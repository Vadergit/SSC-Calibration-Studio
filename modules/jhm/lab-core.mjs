// Hardware-independent laboratory helpers. No vendor register encoding.
export function afePlan({low,high,adcMin,adcMax,target=0.8,options}){
 if(![low,high,adcMin,adcMax,target].every(Number.isFinite)||low===high||adcMax<=adcMin||target<=0||target>1||!Array.isArray(options)||!options.length||options.length>1000)throw Error('Ungültige AFE-Eingaben.');
 const mid=(adcMax+adcMin)/2,span=adcMax-adcMin;
 const candidates=options.map(o=>{if(!o||!Number.isFinite(o.gain)||o.gain<=0||!Number.isFinite(o.offset)||![1,-1].includes(o.polarity))throw Error('Ungültige AFE-Kombination.');const x=low*o.gain*o.polarity+o.offset,y=high*o.gain*o.polarity+o.offset;const utilisation=Math.abs(y-x)/span;const clipped=Math.min(x,y)<adcMin||Math.max(x,y)>adcMax;return {...o,x,y,utilisation,clipped,headroom:Math.min(Math.min(x,y)-adcMin,adcMax-Math.max(x,y)),score:Math.abs(utilisation-target)+Math.abs((x+y)/2-mid)/span+(y<x?1:0)}});
 const feasible=candidates.filter(x=>!x.clipped&&x.y>x.x).sort((a,b)=>a.score-b.score);
 return {best:feasible[0]??null,candidates};
}
export function quantize(value,{bits,fraction,signed}){
 if(!Number.isFinite(value)||!Number.isInteger(bits)||bits<1||bits>32||!Number.isInteger(fraction)||fraction<0||fraction>31||typeof signed!=='boolean')throw Error('Ungültiges Festkommaformat.');
 const scale=2**fraction,min=signed?-(2**(bits-1)):0,max=signed?2**(bits-1)-1:2**bits-1,code=Math.round(value*scale);
 if(!Number.isSafeInteger(code)||code<min||code>max)throw Error('Koeffizient ausserhalb des darstellbaren Bereichs.');
 return {code,encoded:code<0?2**bits+code:code,decoded:code/scale,error:code/scale-value};
}
export function verificationSummary(points,tolerance){
 if(!Array.isArray(points)||!points.length||!Number.isFinite(tolerance)||tolerance<0||points.some(p=>!Number.isFinite(p.errorFS)||!Number.isFinite(p.reference)||!Number.isFinite(p.temperature)))throw Error('Ungültige Prüfdaten.');
 return {count:points.length,maxAbs:Math.max(...points.map(p=>Math.abs(p.errorFS))),rms:Math.sqrt(points.reduce((s,p)=>s+p.errorFS**2,0)/points.length),passed:points.every(p=>Math.abs(p.errorFS)<=tolerance),failed:points.filter(p=>Math.abs(p.errorFS)>tolerance).length};
}
export function parseHexDump(text,count){
 if(typeof text!=='string'||text.length>10000||!Number.isInteger(count)||count<1||count>64)throw Error('Ungültiger Dump.');
 const s=text.trim().replace(/\s+/g,'').toUpperCase();if(!new RegExp('^[0-9A-F]{'+count*2+'}$').test(s))throw Error('Genau '+count+' Bytes als Hex eingeben.');return s;
}
export function crc8(bytes,{poly,init,xorOut}){
 if(!Array.isArray(bytes)||bytes.some(x=>!Number.isInteger(x)||x<0||x>255)||![poly,init,xorOut].every(x=>Number.isInteger(x)&&x>=0&&x<=255)||poly===0)throw Error('Ungültige CRC-Parameter.');
 let crc=init;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=((crc&128)?(crc<<1)^poly:crc<<1)&255;}return crc^xorOut;
}
export function chartSeries(points,max=300){if(!Number.isInteger(max)||max<1||max>10000)throw Error('Ungültiges Limit.');return points.filter(p=>Number.isFinite(p.value)&&Number.isFinite(p.time)).slice(-max);}
