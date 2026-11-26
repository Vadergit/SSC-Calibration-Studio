import {fitContinuousBridge} from './zsc31014-reference-math.mjs';
import {decodeCorrectionWords31014,encodeCorrectionWords31014} from './zsc31014-calibration-plan.mjs';
import {isRaw31014} from './zsc31014-native.mjs';
// Independent fixed-point implementation checked against original v1.489 DLL SolveBridge.
const clip=(v,lo=-32768,hi=32767)=>Math.min(hi,Math.max(lo,v));
const mul=(a,b,scale=1)=>Math.trunc(clip(a*b*scale/8192-(a<0&&b<0?1:0)));
const signed=w=>w&32768?w-65536:w;
const terms={Tcg:['tcg',4096],Tco:['tco',8192],SOT_tco:['sotTco',4096],SOT_tcg:['sotTcg',2048],SOT_bridge:['sotBridge',4096]};
export function solveBridgeRegisters31014(c,neg,raw,temp,curve,adcOffset){
 if(c.length!==12||![...c,neg,raw,temp,curve,adcOffset].every(Number.isFinite))throw Error('Ungültige Koeffizienten oder Rohwerte');
 const [off,gain,tcg,tco,so,sg,sb]=c,sgn=(v,flag)=>neg&flag?-v:v;
 const d=clip(temp-c[11]);
 const offset=clip(off+mul(d,clip(sgn(tco,16)+mul(d,sgn(so,2)))));
 const x=clip(raw-adcOffset+offset);
 const gc=clip(8192+mul(d,clip(sgn(tcg,32)+mul(d,sgn(sg,4)))),0,32767);
 const z=mul(mul(x,gc),c[10]?gain&32767:gain,c[10]?8:1);
 let out;
 if(curve)out=clip(mul(z,clip(8192+mul(Math.abs(z),sgn(sb,1)),0,32767))+8192,0,16383);
 else {const u=clip(z+8192,0,32767);out=clip(mul(u,clip(8192+mul(u,sgn(sb,1)),0,32767)),0,16383)}
 return Math.trunc(out);
}
export function predict31014(words,bridge,temp,adcOffset=((words[15]&15)-8)*1024){
 const d=decodeCorrectionWords31014(words),neg=(d.SOT_bridge.negative?1:0)|(d.SOT_tco.negative?2:0)|(d.SOT_tcg.negative?4:0)|(d.SOT_T.negative?8:0)|(d.Tco.negative?16:0)|(d.Tcg.negative?32:0);
 return solveBridgeRegisters31014([signed(words[3]),words[4],words[5],words[6],words[7],words[8],words[9],signed(words[10]),words[11],words[12],words[4]&32768?1:0,words[13]],neg,bridge-8192,temp,words[1]&512?1:0,adcOffset);
}
export function isRawTemp31014(w){return w?.length===20&&w[10]===0&&w[11]===0x2000&&w[12]===0}
export function fitExtended31014(w,points,selected,{maxErrorDigits=16,curve='parabolic',original=w}={}){
 if(!isRaw31014(w)||!isRawTemp31014(w))throw Error('Bestätigte Brücken- und Temperatur-Unity-Konfiguration erforderlich.');
 if(!Array.isArray(points)||points.length<2+selected.length||selected.some(t=>!Object.hasOwn(terms,t))||new Set(selected).size!==selected.length)throw Error('Unvollständiger Messplan.');
 if(!Number.isFinite(maxErrorDigits)||maxErrorDigits<=0||!Array.isArray(original)||original.length!==20)throw Error('Ungültige Toleranz oder Original-Backup.');
 if(points.some(p=>![p.bridge,p.temperatureCode,p.targetPercent].every(Number.isFinite)||p.bridge<=0||p.bridge>=16383||p.temperatureCode<=0||p.temperatureCode>=2047||p.targetPercent<0||p.targetPercent>100))throw Error('Rohwerte ausserhalb des ungesättigten Messfensters.');
 const tsetl=Math.round(points[0].temperatureCode*8),adc=((w[15]&15)-8)*1024;
 const observations=points.map(p=>({raw:p.bridge/16384,temp:p.temperatureCode*8/16384,target:Math.min(16383,p.targetPercent*16384/100)/16384}));
 const f=fitContinuousBridge(observations,{terms:selected,tsetl:tsetl/16384,curve}),p=f.parameters;
 if(p.gain<1||p.gain>=32)throw Error('Digitalgain ausserhalb 1 bis unter 32. AFE anpassen.');
 const scale=p.gain<4?1:8;
 const gainMagnitude=Math.round(p.gain*8192/scale);
 if(gainMagnitude<8192/scale||gainMagnitude>32767)throw Error('Gain nicht darstellbar.');
 const initial=[Math.round(p.offset*16384+adc),gainMagnitude,...selected.map(t=>Math.round(p[terms[t][0]]*terms[t][1]))];
 const limits=[[-8192,8191],[8192/scale,32767],...selected.map(t=>t==='SOT_bridge'?[-1023,32767]:[-65535,65535])];
 if(initial.some((v,i)=>!Number.isFinite(v)||v<limits[i][0]||v>limits[i][1]))throw Error('Koeffizient ausserhalb des Registerbereichs. AFE oder Messplan prüfen.');
 function encode(v){let target=w.slice();target[3]=v[0]&65535;target[4]=v[1]|(scale===8?32768:0);target[13]=tsetl;target[1]=(target[1]&~512)|(curve==='s-shaped'?512:0);
 const correction=Object.fromEntries(Object.keys(terms).map(k=>[k,{magnitude:0,negative:false}]));
 selected.forEach((k,i)=>correction[k]={magnitude:Math.abs(v[i+2]),negative:v[i+2]<0});target=encodeCorrectionWords31014(target,correction);
 // Bridge compensation uses raw internal temperature. Restore the factory/user temperature OUTPUT trim.
 for(const i of [10,11,12])target[i]=original[i];target[1]=(target[1]&~0x8000)|(original[1]&0x8000);
 return target}
 function evaluate(v){const target=encode(v),pred=points.map(q=>predict31014(target,q.bridge,q.temperatureCode*8)),errors=pred.map((y,i)=>y-observations[i].target*16384);return {target,pred,error:Math.max(...errors.map(Math.abs)),cost:errors.reduce((s,x)=>s+x*x,0)}}
 let v=initial,best=evaluate(v);
 // Quantized search starts from the independent continuous fit, then improves native residual.
 for(const step of [8,4,2,1])for(let sweep=0;sweep<12;sweep++){let changed=false;for(let k=0;k<v.length;k++)for(const sign of [-1,1]){const q=v.slice();q[k]+=sign*step;if(q[k]<limits[k][0]||q[k]>limits[k][1])continue;const r=evaluate(q);if(r.cost<best.cost||(r.cost===best.cost&&r.error<best.error)){v=q;best=r;changed=true}}if(!changed)break}
 if(best.error>maxErrorDigits)throw Error('Nativer Restfehler '+best.error.toFixed(1)+' Digits über Toleranz '+maxErrorDigits+'. Messpunkte oder AFE prüfen.');
 // Check monotonicity over the actual measured raw domain at each measured temperature.
 const low=Math.min(...points.map(q=>q.bridge)),high=Math.max(...points.map(q=>q.bridge));
 for(const t of new Set(points.map(q=>q.temperatureCode*8))){let last=-1;for(let i=0;i<=128;i++){const y=predict31014(best.target,low+(high-low)*i/128,t);if(y<last)throw Error('Nicht monotone Kennlinie.');last=y}}
 return {...best,gain:v[1]*scale/8192,off:v[0],terms:selected,tsetl,points:points.map(q=>({...q}))};
}
