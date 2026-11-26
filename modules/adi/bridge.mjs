import {parseScan} from './lab-validation.mjs';
import {hex,parseDump,validPatch} from './max40109.mjs';
import {verifyRom} from './dsp-candidate.mjs';
export class ReadBridge {
 constructor(){this.port=null;this.busy=false;this.queue=Promise.resolve();this.buffer='';}
 async connect(){if(!navigator.serial)throw Error('Web Serial benötigt Chrome/Edge und HTTPS oder localhost');if(this.port)throw Error('Bereits verbunden');let p=await navigator.serial.requestPort();await p.open({baudRate:115200});this.port=p;this.reader=p.readable.getReader();this.writer=p.writable.getWriter();this.decoder=new TextDecoder();this.buffer='';}
 async close(){if(this.busy)throw Error('Messung läuft');await this.shutdown();}
 async shutdown(){let p=this.port;this.port=null;try{await this.reader?.cancel()}catch{}try{this.reader?.releaseLock()}catch{}try{this.writer?.releaseLock()}catch{}try{await p?.close()}catch{}this.buffer='';}
 async exchange(cmd,pattern,timeout=3000){if(!this.port)throw Error('Nicht verbunden');this.busy=true;let timer;try{await this.writer.write(new TextEncoder().encode(cmd+'\n'));const read=async()=>{for(;;){let i;while((i=this.buffer.indexOf('\n'))>=0){let s=this.buffer.slice(0,i).trim();this.buffer=this.buffer.slice(i+1);if(s.startsWith('ERR '))throw Error(s);if(pattern.test(s))return s;}let {value,done}=await this.reader.read();if(done)throw Error('USB getrennt');this.buffer+=this.decoder.decode(value,{stream:true});if(this.buffer.length>8192)throw Error('Antwort zu lang');}};return await Promise.race([read(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Timeout: '+cmd)),timeout)})]);}catch(e){await this.shutdown();throw e;}finally{clearTimeout(timer);this.busy=false;}}
 run(fn){let p=this.queue.then(fn);this.queue=p.catch(()=>{});return p;}
 read(cmd){if(cmd==='HELLO')return this.run(()=>this.exchange(cmd,/^MAX40109-RO 5$/));if(!/^READ [0-9A-F]{2}$/.test(cmd))throw Error('Ungültiger Befehl');return this.run(async()=>parseInt((await this.exchange(cmd,new RegExp('^OK '+cmd.slice(5)+' [0-9A-F]{4}$'))).slice(-4),16));}
 info(){return this.run(()=>this.exchange('INFO',/^OK INFO (ESP32C3|PROMICRO) 5 I2C,ROM,RAM,MTP,SHADOW$/));}
 scan(){return this.run(async()=>parseScan(await this.exchange('SCAN',/^OK SCAN(?: [0-9A-F]{2})*$/,20000)));}
 fresh(){return this.run(async()=>parseInt((await this.exchange('FRESH',/^OK FRESH [0-9A-F]{4}$/,4000)).slice(-4),16));}
 owRead(a){if(!Number.isInteger(a)||a<0||a>255)throw Error('Adresse ungültig');return this.run(async()=>parseInt((await this.exchange('OWREAD '+hex(a),/^OK OWREAD [0-9A-F]{2} [0-9A-F]{4}$/)).slice(-4),16));}
 probe(a){if(!Number.isInteger(a)||a<8||a>119)throw Error('I2C-Adresse ungültig');return this.run(()=>this.exchange('PROBE '+hex(a),/^OK PROBE [0-9A-F]{2}$/));}
 dump(){return this.run(async()=>parseDump(await this.exchange('DUMP',/^OK DUMP(?: [0-9A-F]{4}){69}$/,12000)));}
 patch(a,m,v){validPatch(a,m,v);return this.run(async()=>parseInt((await this.exchange('PATCH '+hex(a)+' '+hex(m,4)+' '+hex(v,4),new RegExp('^OK PATCH '+hex(a)+' [0-9A-F]{4}$'))).slice(-4),16));}
 rom(){return this.run(async()=>verifyRom((await this.exchange('ROM',/^OK ROM [0-9A-F]{16}$/)).slice(7)));}
 shadow(a,v){if(!Number.isInteger(a)||a<0||a>39||!Number.isInteger(v)||v<0||v>65535)throw Error('Nur Kalibrierwörter im Shadow');return this.run(async()=>{const reply=await this.exchange('SHADOW '+hex(a)+' '+hex(v,4),new RegExp('^OK SHADOW '+hex(a)+' [0-9A-F]{4}$'));return parseInt(reply.slice(-4),16);});}
}
