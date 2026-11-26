// ZSC31014: documented calibration point topology and reference input preparation.
// Datasheet 2016-01-20 §3.7, §3.8; Calibration Sequence and DLL rev 1.41 §2.2, §2.3.
// No guessed EEPROM fixed-point scaling. This module does not write hardware.
const L=0,H=1,M=.5;
const endpoints=[[L,0],[H,0]];
const both=[...endpoints,[L,1],[H,1]];
const modes={
 linear:{terms:[],points:endpoints},
 tk0:{terms:['Tco'],points:[...endpoints,[L,1]]},
 tke:{terms:['Tcg'],points:[...endpoints,[H,1]]},
 combined:{terms:['Tco','Tcg'],points:both},
 bridge:{terms:['SOT_bridge'],points:[...endpoints,[M,0]]},
 tk0Bridge:{terms:['Tco','SOT_bridge'],points:[...endpoints,[M,0],[L,1]]},
 tkeBridge:{terms:['Tcg','SOT_bridge'],points:[...endpoints,[M,0],[H,1]]},
 combinedBridge:{terms:['Tco','Tcg','SOT_bridge'],points:[...both,[M,0]]},
 quadraticOffset:{terms:['Tco','Tcg','SOT_tco'],points:[...both,[L,2]]},
 quadraticGain:{terms:['Tco','Tcg','SOT_tcg'],points:[...both,[H,2]]},
 quadraticBoth:{terms:['Tco','Tcg','SOT_tco','SOT_tcg'],points:[...both,[L,2],[H,2]]},
 full:{terms:['Tco','Tcg','SOT_tco','SOT_tcg','SOT_bridge'],points:[...both,[L,2],[H,2],[M,0]]}
};
export const calibrationModes31014=Object.freeze(Object.keys(modes));
export function planCalibration31014(mode,{low=10,high=90,temperatures=[25,50,75],targetLow=10,targetHigh=90,curve='parabolic'}={}){
 const m=modes[mode];if(!Object.hasOwn(modes,mode))throw Error('Unknown ZSC31014 calibration type');
 if(![low,high,targetLow,targetHigh].every(Number.isFinite)||low<0||high>100||low>=high||targetLow<0||targetHigh>100||targetLow>=targetHigh)throw Error('Invalid pressure or output range');
 if(!['parabolic','s-shaped'].includes(curve))throw Error('Unknown curve');
 const points=m.points.map(([p,t])=>[p,t]);
 // S-shaped bridge fitting requires an additional noncentral bridge point (TN §2.2.3).
 // Replace the center with a quarter-span point and add a three-quarter-span point.
 if(curve==='s-shaped'&&m.terms.includes('SOT_bridge')){
   const i=points.findIndex(([p,t])=>p===M&&t===0);points[i]=[.25,0];points.push([.75,0]);
 }
 const count=Math.max(...points.map(p=>p[1]))+1,temps=temperatures.slice(0,count);
 if(temps.length!==count||temps.some(t=>!Number.isFinite(t))||new Set(temps).size!==count)throw Error('Distinct temperature conditions required');
 return {mode,curve,coefficients:['Offset_B','Gain_B',...m.terms],temperatureConditions:temps,points:points.map(([p,t],i)=>({index:i,pressure:low+p*(high-low),temperature:temps[t],targetPercent:targetLow+p*(targetHigh-targetLow)}))};
}
// §2.2.1: the NOM temperature output is raw only when Offset_T=0, Gain_T=0x2000 and SOT_T=0.
export function rawTemperatureInterval31014(code,words){
 if(!Array.isArray(words)||words.length!==20||words.some(v=>!Number.isInteger(v)||v<0||v>65535))throw Error('20 EEPROM words required');
 if(words[10]!==0||words[11]!==0x2000||words[12]!==0)throw Error('Temperature output is corrected; not a raw ADC value');
 if(!Number.isFinite(code)||code<0||code>2047)throw Error('Invalid 11-bit temperature output');
 // Averaged samples may be fractional. The lost three bits cannot be reconstructed.
 return {minimum:8*code,maximum:8*code+7,midpoint:8*code+3.5};
}
const signBits={Tco:[6,10],Tcg:[5,11],SOT_bridge:[9,12],SOT_tco:[7,13],SOT_tcg:[8,14],SOT_T:[12,15]};
// §3.6 and §3.8.4: separate sign bits; this accepts *manufacturer-computed register magnitudes*,
// not mathematical coefficients. It is a codec, not a coefficient solver.
export function decodeCorrectionWords31014(words){
 if(!Array.isArray(words)||words.length!==20||words.some(v=>!Number.isInteger(v)||v<0||v>65535))throw Error('20 EEPROM words required');
 return Object.fromEntries(Object.entries(signBits).map(([name,[addr,bit]])=>[name,{magnitude:words[addr],negative:!!(words[1]&(1<<bit))}]));
}
export function encodeCorrectionWords31014(words,corrections){
 decodeCorrectionWords31014(words);
 const result=words.slice();
 for(const [name,c] of Object.entries(corrections)){
  if(!Object.hasOwn(signBits,name)||!c||!Number.isInteger(c.magnitude)||c.magnitude<0||c.magnitude>65535||typeof c.negative!=='boolean')throw Error('Invalid correction register: '+name);
  if((name==='SOT_bridge'||name==='SOT_T')&&c.magnitude>(c.negative?0x3ff:0x7fff))throw Error('SOT out of documented range');
  const [addr,bit]=signBits[name];result[addr]=c.magnitude;result[1]=(result[1]&~(1<<bit))|(c.negative&&c.magnitude!==0?1<<bit:0);
 }
 return result;
}
