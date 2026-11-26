// Generic, explicitly configured I2C read transport. No JHM register map is inferred.
export const MAX_BYTES=32;
export function validateProfile(p,model){
 if(!p||p.schema!==1||p.model!==model||p.protocol!=='i2c-read-v1'||typeof p.source!=='string'||!p.source.trim()||p.source.length>500||!Number.isInteger(p.address)||p.address<8||p.address>119||!Array.isArray(p.registers)||p.registers.length<1||p.registers.length>256)throw Error('Ungültiges Profil oder Modell stimmt nicht überein.');
 const ids=new Set(),roles=new Set();
 const registers=p.registers.map(r=>{
  if(!r||typeof r.id!=='string'||!/^[-a-zA-Z0-9_]{1,40}$/.test(r.id)||ids.has(r.id)||typeof r.name!=='string'||r.name.length>100||typeof r.prefix!=='string'||! /^(?:[0-9a-fA-F]{2}){0,2}$/.test(r.prefix)||!Number.isInteger(r.length)||r.length<1||r.length>MAX_BYTES)throw Error('Ungültiger Registereintrag.');
  ids.add(r.id);
  const role=r.role??null;
  if(role!==null&&(!['adcS','adcT','dspS','tempC','pressure','identity'].includes(role)||roles.has(role)))throw Error('Ungültige oder doppelte Messwertrolle.');
  if(role)roles.add(role);
  if(!['ram','otp','eeprom','status','telemetry','unknown'].includes(r.area))throw Error('Speicherbereich fehlt.');
  const expected=r.expected??null;
  if(expected!==null&&(role!=='identity'||typeof expected!=='string'||!new RegExp('^[0-9a-fA-F]{'+(r.length*2)+'}$').test(expected)))throw Error('Identitätsvergleich ungültig.');
  const endian=r.endian??'be',signed=r.signed??false,scale=r.scale??1,offset=r.offset??0;
  if((['adcS','adcT','dspS'].includes(role)&&(scale!==1||offset!==0))||!['be','le'].includes(endian)||typeof signed!=='boolean'||!Number.isFinite(scale)||!Number.isFinite(offset)||(role&&role!=='identity'&&r.length>4))throw Error('Ungültiges Zahlenformat.');
  return {id:r.id,name:r.name,prefix:r.prefix.toUpperCase(),length:r.length,area:r.area,role,expected:expected?.toUpperCase()??null,endian,signed,scale,offset,unit:String(r.unit??'').slice(0,20)};
 });
 return {schema:1,model,address:p.address,protocol:p.protocol,source:p.source,registers};
}
export function command(id,address,prefix,length){
 if(!Number.isSafeInteger(id)||id<1||!Number.isInteger(address)||address<8||address>119||typeof prefix!=='string'||!/^(?:[0-9A-F]{2}){0,2}$/.test(prefix)||!Number.isInteger(length)||length<1||length>MAX_BYTES)throw Error('Ungültiger Leseauftrag.');
 return 'READ '+id+' '+address.toString(16).toUpperCase().padStart(2,'0')+' '+(prefix||'-')+' '+length+'\n';
}
export function parseReply(line,id,length){
 const m=/^(OK|ERR) (\d+) ([A-Z0-9_]+)$/.exec(line.trim());
 if(!m||Number(m[2])!==id)throw Error('Antwort-ID oder Format falsch.');
 if(m[1]==='ERR')throw Error('Adapter: '+m[3]);
 if(!new RegExp('^[0-9A-F]{'+(length*2)+'}$').test(m[3]))throw Error('Antwortlänge falsch.');
 return m[3];
}
export function decode(hex,r){
 if(!new RegExp('^[0-9A-F]{'+r.length*2+'}$').test(hex))throw Error('Ungültige Daten.');
 if(r.length>4)return null;
 let bytes=hex.match(/../g).map(x=>parseInt(x,16));if(r.endian==='le')bytes.reverse();
 let v=bytes.reduce((a,b)=>a*256+b,0);const bits=bytes.length*8;
 if(r.signed&&v>=2**(bits-1))v-=2**bits;
 const scaled=v*r.scale+r.offset;if(!Number.isFinite(scaled))throw Error('Zahlenüberlauf.');return scaled;
}
export function compareDumps(a,b){if(a.model!==b.model||a.address!==b.address||JSON.stringify(a.profile)!==JSON.stringify(b.profile))throw Error('Nur identische Profile vergleichen.');const prior=new Map(a.values.map(x=>[x.id,x.hex]));return b.values.filter(x=>prior.get(x.id)!==x.hex).map(x=>({id:x.id,before:prior.get(x.id)??null,after:x.hex}));}
export class ReadBridge{
 constructor(port){this.port=port;this.id=0;this.reader=null;this.writer=null;this.buffer='';this.pending=null;this.active=false;this.decoder=new TextDecoder();this.encoder=new TextEncoder();}
 async open(){await this.port.open({baudRate:115200});try{this.reader=this.port.readable.getReader();this.writer=this.port.writable.getWriter();this.active=true;this.loop();await new Promise(r=>setTimeout(r,1200));const hello=await this.exchange('HELLO\n',line=>line==='JHM-BRIDGE 1 I2C-READ'?line:undefined);return hello;}catch(e){await this.close();throw e}}
 async loop(){try{while(this.active){const {value,done}=await this.reader.read();if(done)throw Error('Serielle Verbindung beendet.');this.buffer+=this.decoder.decode(value,{stream:true});if(this.buffer.length>4096)throw Error('Empfangspuffer zu gross.');let i;while((i=this.buffer.indexOf('\n'))>=0){const line=this.buffer.slice(0,i).trim();this.buffer=this.buffer.slice(i+1);const p=this.pending;if(!p)continue;try{const result=p.match(line);if(result!==undefined){this.pending=null;clearTimeout(p.timer);p.resolve(result)}}catch(e){this.pending=null;clearTimeout(p.timer);p.reject(e)}}}}catch(e){this.fail(e);this.active=false}}
 fail(e){if(this.pending){const p=this.pending;this.pending=null;clearTimeout(p.timer);p.reject(e)}}
 async exchange(text,match){if(!this.active||this.pending)throw Error('Adapter nicht bereit oder beschäftigt.');let p;const reply=new Promise((resolve,reject)=>{p={resolve,reject,match,timer:setTimeout(()=>{this.fail(Error('Zeitüberschreitung. Verbindung neu öffnen.'));this.active=false;void this.close()},2500)};this.pending=p});try{await this.writer.write(this.encoder.encode(text));}catch(e){this.fail(e)}return reply;}
 async read(address,r){const id=++this.id;return this.exchange(command(id,address,r.prefix,r.length),line=>/^(OK|ERR) /.test(line)?parseReply(line,id,r.length):undefined)}
 async close(){this.active=false;this.fail(Error('Verbindung geschlossen.'));try{await this.reader?.cancel()}catch{}try{this.reader?.releaseLock()}catch{}try{this.writer?.releaseLock()}catch{}try{await this.port.close()}catch{}this.reader=null;this.writer=null}
}
