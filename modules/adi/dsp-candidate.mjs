import {fitSurface} from './engine.mjs';
// Candidate formats: Rev.3 tables 28/29 vs figure 4. NO production encoding claim.
import {hex,validateSnapshot} from './max40109.mjs';
export function encodeCoeff(v,index,format){
 if(!Number.isFinite(v)||!Number.isInteger(index)||index<0||index>=20)throw Error('Ungültiger Koeffizient');
 if(format==='float'){let b=new DataView(new ArrayBuffer(4));b.setFloat32(0,v,true);if(!Number.isFinite(b.getFloat32(0,true)))throw Error('Float overflow');return b.getUint32(0,true);}
 if(!['fixed-sign','fixed-twos'].includes(format))throw Error('Format auswählen');
 const scale=index===0||index===4?1:2**23,mag=Math.round(Math.abs(v)*scale);
 if(mag>0x7fffffff)throw Error('Koeffizient ausserhalb des Formats');
 return v<0&&mag?format==='fixed-sign'?0x80000000+mag:2**32-mag:mag;
}
export function decodeCoeff(w,index,format){
 if(!Number.isInteger(w)||w<0||w>0xffffffff)throw Error('Ungültiges Wort');
 if(format==='float'){let b=new DataView(new ArrayBuffer(4));b.setUint32(0,w,true);return b.getFloat32(0,true);}
 if(!['fixed-sign','fixed-twos'].includes(format))throw Error('Format auswählen');
 let v=w>=2**31?format==='fixed-sign'?-(w-2**31):w-2**32:w;return v/(index===0||index===4?1:2**23);
}
export function linearCandidate(f,settings,lo,hi,format,original){
 validateSnapshot(original);
 if(f?.model!=='max40109'||f.po!==1||f.to!==0||!settings||settings.source==='synthetic')throw Error('Reale oder manuelle lineare MAX40109-Druckmessung ohne TK erforderlich');
 if(!Number.isInteger(lo)||!Number.isInteger(hi)||lo<-32768||hi>32767||hi<=lo||!(settings.hi>settings.lo))throw Error('DSP-Zielbereich ungültig');
 const factor=(hi-lo)/(settings.hi-settings.lo),c=Array(16).fill(0);c[0]=lo+(f.coefficients[0]-settings.lo)*factor;c[4]=f.coefficients[1]*factor/32768;
 const words=[...original],coefficients=c.map((v,i)=>{let index=i+4,w=encodeCoeff(v,index,format);words[index*2]=w%65536;words[index*2+1]=Math.floor(w/65536);return {index,name:['H','G','N','M'][Math.floor(i/4)]+i%4,ideal:v,encoded:hex(w,8),decoded:decodeCoeff(w,index,format)};});
 const predict=raw=>coefficients[0].decoded+coefficients[4].decoded*raw;
 const residuals=settings.points.map(p=>{let target=lo+(p.reference-settings.lo)*factor;return {raw:p.raw,target,predicted:predict(p.raw),error:predict(p.raw)-target}});
 if(residuals.some(p=>!Number.isFinite(p.predicted)||p.predicted<-32768||p.predicted>32767))throw Error('DSP-Bereich überschritten');
 return {format,lo,hi,referenceLo:settings.lo,referenceHi:settings.hi,words,coefficients,residuals,experimental:true};
}
export function crc8(bytes){let crc=0;for(let byte of bytes){for(let i=0;i<8;i++){let bit=(crc^byte)&1;crc>>=1;if(bit)crc^=0x8c;byte>>=1;}}return crc;}
export function verifyRom(s){if(!/^[0-9A-F]{16}$/.test(s))throw Error('ROM-Format');let b=s.match(/../g).map(x=>parseInt(x,16));if(b[0]!==0x76||crc8(b)!==0)throw Error('MAX40109 Family-Code oder CRC ungültig');return s;}

// Experimental raw signed-code convention, Fig.4 and Tables 28/29 conflict.
// Compute in normalized coordinates for conditioning, then convert to raw-code polynomial.
export function surfaceCandidate(f,settings,lo,hi,format,original,tempFit=null,tempScale=100){
 validateSnapshot(original);
 if(f?.model!=='max40109'||!Number.isInteger(f.po)||f.po<1||f.po>3||!Number.isInteger(f.to)||f.to<0||f.to>3||!settings||settings.source==='synthetic')throw Error('Reale/manuelle MAX40109-Messung erforderlich');
 if(!Number.isInteger(lo)||!Number.isInteger(hi)||lo<-32768||hi>32767||hi<=lo||!(settings.hi>settings.lo))throw Error('DSP-Zielbereich ungültig');
 if(!Array.isArray(settings.points)||!settings.points.length)throw Error('Messpunkte fehlen');
 const words=[...original],coefficients=[],k=Array(4).fill(0);
 const set=(index,v)=>{let w=encodeCoeff(v,index,format);words[index*2]=w%65536;words[index*2+1]=Math.floor(w/65536);let q=decodeCoeff(w,index,format);coefficients.push({index,name:['K','H','G','N','M'][Math.floor(index/4)]+index%4,ideal:v,encoded:hex(w,8),decoded:q});return q;};
 let f2=f, tCode=()=>0;
 if(f.to){
  if(!tempFit||!Array.isArray(tempFit.k)||!Number.isFinite(tempScale)||tempScale<=0)throw Error('Temperaturkennlinie und Codes/°C für TK erforderlich');
  for(let i=0;i<4;i++)k[i]=set(i,(tempFit.k[i]||0)*tempScale/32768**i);
  tCode=raw=>{let x=k.reduce((sum,v,i)=>sum+v*raw**i,0);if(!Number.isFinite(x)||x<-32768||x>32767)throw Error('Kalibrierter Temperaturcode ausserhalb signed 16 Bit');return Math.round(x);};
  f2=fitSurface(settings.points.map(x=>({...x,temp:tCode(x.temp)})),f.po,f.to,'max40109');
 }
 const factor=(hi-lo)/(settings.hi-settings.lo),q=Array(16).fill(0);
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){let c=i<=f2.po&&j<=f2.to?f2.coefficients[i*(f2.to+1)+j]*factor/32768**(i+j):0;if(!i&&!j)c+=lo-settings.lo*factor;q[i*4+j]=set(4+i*4+j,c);}
 const predict=(p,t)=>q.reduce((s,c,i)=>s+c*p**Math.floor(i/4)*t**(i%4),0);
 const residuals=settings.points.map(p=>{let target=lo+(p.reference-settings.lo)*factor,T=tCode(p.temp),predicted=predict(p.raw,T);return {raw:p.raw,temperatureCode:T,target,predicted,error:predicted-target};});
 if(residuals.some(p=>!Number.isFinite(p.predicted)||p.predicted<-32768||p.predicted>32767))throw Error('DSP-Bereich überschritten');
 let maxPercent=100*Math.max(...residuals.map(x=>Math.abs(x.error)))/(hi-lo);
 return {format,lo,hi,referenceLo:settings.lo,referenceHi:settings.hi,words,coefficients,residuals,maxPercent,temperatureCodesPerDegree:f.to?tempScale:null,experimental:true};
}
export function burnPlan(before,after,status,remaining){validateSnapshot(before);validateSnapshot(after);if(before[68]&0x8000)throw Error('MTP-Lock gesetzt');if(status&0x6f)throw Error('MTP-Status fehlerhaft');const changes=[];for(let i=0;i<69;i++)if(before[i]!==after[i]){if(i>=40)throw Error('Nur Kalibrierwörter im Testplan');changes.push({address:hex(i),before:hex(before[i],4),after:hex(after[i],4)});}if(!changes.length)throw Error('Keine Änderungen');if(!Number.isInteger(remaining)||remaining<changes.length)throw Error('Nicht genügend MTP-Restzyklen');return {changes,remaining,estimatedAfter:remaining-changes.length,execution:false,requirements:['Herstellerformat und Referenzwerte bestätigt','Echte unabhängige DSP-Nachmessung bestanden','VDDHV mindestens 12 V gemäss Datenblatt','Chip-ID und Kaltstart-Backup bestätigt','Programmierung und Rücklesung auf Testchip validiert']};}
