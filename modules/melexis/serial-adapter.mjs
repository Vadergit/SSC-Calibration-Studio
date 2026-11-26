import {HostClient} from './host-client.mjs';
// MLX1 is the browser-to-DIY protocol, NOT the Melexis physical wire protocol.
export function requestLine(id,op,model,count=1){
 if(!Number.isInteger(id)||id<1||id>2147483647||!['info','sample','eeprom','ram'].includes(op)||!['mlx90328','mlx90329'].includes(model)||!Number.isInteger(count)||count<1||count>100)throw Error('Ungültiger MLX1-Auftrag.');
 return 'MLX1 '+id+' '+op.toUpperCase()+' '+model+' '+count+'\n';
}
export function parseReply(line,id,model,board){
 let x;try{x=JSON.parse(line)}catch{return null}
 if(x?.protocol!=='MLX1'||x.id!==id)return null;
 if(x.board!==board||x.model!==model)throw Error('Falscher Adapter oder SSC in Antwort.');
 if(x.ok!==true)throw Error(x.error||'Adapterfehler');
 return x;
}
export class SerialAdapter extends HostClient{
 constructor(board){super();if(!['esp32','pro-micro'].includes(board))throw Error('Unbekannter DIY-Adapter');this.board=board;this.id=0;this.port=null;this.reader=null;this.writer=null;this.pending=null;this.closed=false;this.buffer=''}
 async open(){if(!navigator.serial)throw Error('Web Serial nicht verfügbar. Chrome oder Edge auf dem Desktop verwenden.');const port=await navigator.serial.requestPort();if(this.closed)throw Error('Verbindung abgebrochen.');this.port=port;try{await port.open({baudRate:115200});if(this.closed){await port.close();throw Error('Verbindung abgebrochen.')}this.reader=port.readable.getReader();this.writer=port.writable.getWriter();this.readTask=this.readLoop();await new Promise(r=>setTimeout(r,1500));if(this.closed)throw Error('Verbindung abgebrochen.')}catch(e){await this.close();throw e}}
 async readLoop(){const decoder=new TextDecoder();try{while(!this.closed){const {value,done}=await this.reader.read();if(done)break;this.buffer+=decoder.decode(value,{stream:true});if(this.buffer.length>500000)throw Error('Antwort zu lang');let i;while((i=this.buffer.indexOf('\n'))>=0){const line=this.buffer.slice(0,i).trim();this.buffer=this.buffer.slice(i+1);const p=this.pending;if(!p)continue;try{const x=parseReply(line,p.id,p.model,this.board);if(x){this.pending=null;p.resolve(x)}}catch(e){this.pending=null;p.reject(e)}}}}catch(e){this.pending?.reject(e);this.pending=null}finally{this.pending?.reject(Error('USB-Verbindung beendet.'));this.pending=null}}
 async call(op,model,extra={}){if(this.closed||!this.writer||this.pending)throw Error('Adapter nicht bereit.');const id=++this.id,line=requestLine(id,op,model,extra.count??1);let timer;try{return await new Promise((resolve,reject)=>{this.pending={id,model,resolve,reject};timer=setTimeout(()=>{this.pending=null;reject(Error('Keine MLX1-Antwort. Richtige Firmware und Adapterauswahl prüfen.'))},5000);this.writer.write(new TextEncoder().encode(line)).catch(e=>{this.pending=null;reject(e)})})}finally{clearTimeout(timer)}}
 async info(model){const x=await this.call('info',model);if(x.mode==='adapter-only'){if(x.capabilities?.length!==0||x.chipDetected!==false)throw Error('Ungültige Adapterdiagnose');return x}if(x.mode!=='simulation'||x.chipDetected!==false||!Array.isArray(x.capabilities)||x.capabilities.some(v=>!['sample','eeprom','ram'].includes(v))||typeof x.identity!=='string'||!x.identity)throw Error('Unbekannter DIY-Treiberstatus.');return x}
 async close(){if(this.closed)return;this.closed=true;this.pending?.reject(Error('Adapter getrennt.'));this.pending=null;try{await this.reader?.cancel()}catch{}try{await this.readTask}catch{}try{this.reader?.releaseLock()}catch{}try{this.writer?.releaseLock()}catch{}try{await this.port?.close()}catch{}}
}