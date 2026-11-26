// ADC hardware boundaries from ZSC31014 datasheet §3.8.4; 2% reserve is an application recommendation, not a chip restriction.
export const adcLimits31014=Object.freeze({min:0,max:16383,reserveLow:328,reserveHigh:16055,tempMin:0,tempMax:2047});
export function adcQuality31014(value,min=value,max=value){
 if(![value,min,max].every(Number.isFinite))return 'unknown';
 if(min<=0||max>=16383||value<=0||value>=16383)return 'limit';
 if(min<328||max>16055||value<328||value>16055)return 'reserve';
 return 'ok';
}
export function validateSamples31014(samples,{temperature=false}={}){
 if(!Array.isArray(samples)||!samples.length)throw Error('Keine Rohwerte vorhanden.');
 for(const p of samples){if(!Number.isFinite(p.bridge)||p.bridge<=0||p.bridge>=16383)throw Error('ADC_S '+p.bridge+' Digits: '+(p.bridge<=0?'untere':'obere')+' ADC-Grenze erreicht. AFE-Offset/Gain anpassen, dann Messpunkt erneut aufnehmen.');if(temperature&&(!Number.isFinite(p.temperatureCode)||p.temperatureCode<=0||p.temperatureCode>=2047))throw Error('ADC_T '+p.temperatureCode+' (11-Bit-Code): Temperaturmessbereich erreicht. Temperatur-Frontend prüfen.');}
 return adcQuality31014(samples[0].bridge,Math.min(...samples.map(p=>p.bridge)),Math.max(...samples.map(p=>p.bridge)));
}
