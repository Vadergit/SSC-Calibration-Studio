import {crc8} from './hardware.mjs';
// Same-origin native service for the original RS485 boards.
export const adapters=Object.freeze({
 esp32:{name:'ESP32-C3 SuperMini',firmware:'ESP32-C3',transport:'DIY · USB / I²C'},
 promicro:{name:'Arduino Pro Micro',firmware:'ATmega32U4',transport:'DIY · USB / I²C'},
 evm:{name:'NOVOSENSE NSX2860_EVM',transport:'RS485 · 250 kBd · Mark/Space'},
 cal32:{name:'NOVOSENSE NSA2860_CAL32',transport:'RS485 · 250 kBd · 8N1'},
 nsa2302evm:{name:'NOVOSENSE NSA2302 Evaluation System',transport:'RS485 · Befehlsprotokoll noch offen'}
});
export const isDiy=k=>k==='esp32'||k==='promicro';
export const nativeAvailable=()=>location.protocol==='http:'&&location.hostname==='127.0.0.1';
export class NativeBridge {
 constructor(kind){this.kind=kind;this.closed=true;this.log=[];this.info=null;this.port=null;}
 async call(action,body={}){
  if(!nativeAvailable())throw Error('Originalboard benötigt die lokale Web-App: http://127.0.0.1:8765/');
  const resp=await fetch('/api/adapter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...body}),signal:AbortSignal.timeout(6500)});
  let reply;try{reply=await resp.json()}catch{throw Error('Lokaler NOVOSENSE-Adapterdienst nicht gestartet')}
  if(!resp.ok||!reply.ok)throw Error(reply.error||'Adapterfehler');
  return reply.result;
 }
 async connect(){this.info=await this.call('open',{board:this.kind});this.closed=false;return this.info;}
 async close(){if(this.closed)return;try{await this.call('close')}finally{this.closed=true;this.info=null;}}
 async read(_address,reg,count){if(this.closed||this.kind!=='evm')throw Error('Kein EVM-Lesekanal');const r=await this.call('read',{reg,count});if(!Array.isArray(r.bytes)||r.bytes.length!==count||r.bytes.some(x=>!Number.isInteger(x)||x<0||x>255))throw Error('Registerantwort ungültig');return Uint8Array.from(r.bytes);}
 async version(){return this.call('version')}
 async enter(){return this.call('enter',{confirm:'POWER_CYCLE_TEST_DUT'})}
 async fetchLog(){this.log=(await this.call('log')).log;return this.log;}
 async request(){throw Error('RAM-/NVM-Schreibzugriff via Originalboard nicht freigegeben')}
}

export function boardFrame(address,fn,payload=[]){if(![address,fn,...payload].every(v=>Number.isInteger(v)&&v>=0&&v<=255)||payload.length>251)throw Error('Frame ungültig');const bytes=[address,payload.length+4,fn,...payload];return Uint8Array.from([...bytes,crc8(bytes)]);}
export function boardResponse(raw,address,fn,expected=null){if(raw.length<5||raw[0]!==address||raw[1]!==raw.length||raw[2]!==fn)throw Error('Frameadresse, Länge oder Funktion ungültig');if(crc8(Array.from(raw.slice(0,-1)))!==raw.at(-1))throw Error('CRC8 ungültig');if(raw[3]!==0)throw Error('Board-Fehler 0x'+raw[3].toString(16));const data=Array.from(raw.slice(4,-1));if(expected!==null&&data.length!==expected)throw Error('Nutzdatenlänge ungültig');return data;}
export class Cal32Bridge {
 constructor(address=0x80){if(!Number.isInteger(address)||address<0x80||address>0xf0)throw Error('MCU-Adresse 0x80–0xF0');this.address=address;this.closed=true;this.port=null;this.log=[];this.reader=null;this.writer=null;this.buffer=[];this.busy=false;}
 record(direction,data){this.log.push({time:new Date().toISOString(),direction,hex:Array.from(data,b=>b.toString(16).padStart(2,'0')).join(' ')});if(this.log.length>2000)this.log.shift();}
 async connect(port){this.port=port;try{await port.open({baudRate:250000,dataBits:8,stopBits:1,parity:'none',flowControl:'none'});this.closed=false;this.reader=port.readable.getReader();this.writer=port.writable.getWriter();return await this.version();}catch(e){await this.close();throw e}}
 async version(){if(this.closed||this.busy)throw Error('Board nicht verbunden oder beschäftigt');this.busy=true;const frame=boardFrame(this.address,0);let timer;
 try{this.record('TX',frame);await this.writer.write(frame);const data=await Promise.race([this.receive(frame),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('32CAL Antwort-Timeout')),2500)})]);if(!data.length)throw Error('Leere Versionsantwort');return {board:'cal32',address:this.address,versionBytes:data,transport:'Web Serial 250000 8N1'};}catch(e){await this.close();throw e}finally{clearTimeout(timer);this.busy=false;}}
 async receive(sent){while(!this.closed){while(this.buffer.length&&this.buffer[0]!==this.address)this.buffer.shift();if(this.buffer.length>=2){const n=this.buffer[1];if(n<4)throw Error('Ungültige Frame-Länge');if(this.buffer.length>=n){const raw=Uint8Array.from(this.buffer.splice(0,n));this.record('RX',raw);if(n===sent.length&&raw.every((b,i)=>b===sent[i]))continue;return boardResponse(raw,this.address,0);}}const {value,done}=await this.reader.read();if(done)throw Error('Serieller Port geschlossen');this.buffer.push(...value);if(this.buffer.length>512)throw Error('Empfangspuffer überfüllt');}throw Error('Verbindung geschlossen');}
 async close(){this.closed=true;const p=this.port,r=this.reader,w=this.writer;this.port=null;this.reader=null;this.writer=null;this.buffer=[];try{await r?.cancel()}catch{}try{r?.releaseLock()}catch{}try{w?.releaseLock()}catch{}try{await p?.close()}catch{}}
}
