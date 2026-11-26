// ZSC31014 calibration DLL input conversion; technical note rev 1.41 table 2.3.
// Static review of the original v1.489 installer x64 iLiteCalMath exports.
const finite=(x,min,max)=>{if(!Number.isFinite(x)||x<min||x>max)throw Error('Reference outside documented range');return x};
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
export function fromPercent31014(percent,raw=false){
 const x=finite(percent,0,100);
 return Math.min(raw?8191:16383,(x-(raw?50:0))*16384/100);
}
export function fromHex31014(code,{raw=false,temperature=false}={}){
 if(temperature)return finite(code,0,2047)*8;
 const x=finite(code,0,16383);return raw?x-8192:x;
}
export function fromDegrees31014(celsius,min=-50,max=150){
 if(!Number.isFinite(min)||!Number.isFinite(max)||max<=min)throw Error('Invalid temperature scale');
 return Math.min(16383,(finite(celsius,min,max)-min)*16384/(max-min));
}
export function toDegrees31014(code,min=-50,max=150){
 if(!Number.isFinite(min)||!Number.isFinite(max)||max<=min)throw Error('Invalid temperature scale');
 return finite(code,0,16383)/16384*(max-min)+min;
}
const flags={Offset_B:1,Gain_B:2,Tcg:4,Tco:8,SOT_tco:16,SOT_tcg:32,SOT_bridge:64,Offset_T:128,Gain_T:256,SOT_T:512};
export function dllSelection31014(coefficients){
 if(!Array.isArray(coefficients)||coefficients.some(x=>!Object.hasOwn(flags,x)))throw Error('Unknown coefficient');
 return coefficients.reduce((mask,x)=>mask|flags[x],0);
}
// DLL's negCoeffs flags differ from physical EEPROM bits (datasheet word 0x01).
const signMap=[[1,12],[2,13],[4,14],[8,15],[16,10],[32,11]];
export function dllSignsToConfig31014(config,neg,{temperature=false}={}){
 finite(config,0,65535);finite(neg,0,63);
 if(!Number.isInteger(config)||!Number.isInteger(neg))throw Error('Expected integer flags');
 let result=config;
 for(const [flag,bit] of signMap){if(flag===8&&!temperature)continue;result=(result&~(1<<bit))|((neg&flag)?1<<bit:0)}
 return result;
}
