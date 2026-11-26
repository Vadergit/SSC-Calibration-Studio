// Offline engineering tools. No hardware I/O or register encoding.
export function crc8(bytes){let c=0;for(const b of bytes){if(!Number.isInteger(b)||b<0||b>255)throw Error('Ungültiges Byte');c^=b;for(let i=0;i<8;i++)c=((c<<1)^((c&128)?7:0))&255;}return c;}
export function signed24(word){if(!Number.isInteger(word)||word<0||word>0xffffff)throw Error('24-Bit-Wort erwartet');return word>=0x800000?word-0x1000000:word;}
export function adcPlan(low,high,bits=24,target=.8){if(![low,high,bits,target].every(Number.isFinite)||!Number.isInteger(bits)||bits<2||bits>32||high===low||target<=0||target>1)throw Error('Ungültige AFE-Eingabe');const half=2**(bits-1),min=-half,max=half-1;if(low<min||low>max||high<min||high>max)throw Error('ADC ausserhalb des signed Bereichs');const center=(low+high)/2,span=high-low;return {center,span,utilization:Math.abs(span)/(max-min)*100,headroom:Math.min(Math.min(low,high)-min,max-Math.max(low,high)),idealGain:target*(max-min)/Math.abs(span),inverted:span<0};}
// NSA2300 datasheet rev 2.3 section 6.7: at T=T0 and KS=KSS=0.
// Inputs must already be in the documented equation's units. Not a register image.
export function nsa2300TwoPoint(x1,x2,y1,y2,p0=0){if(![x1,x2,y1,y2,p0].every(Number.isFinite)||x1===x2||y1===y2)throw Error('Zwei unterschiedliche Mess- und Zielwerte erforderlich');const S0=(y2-y1)/(x2-x1),CNT_off=x1-(y1-p0)/S0;if(![S0,CNT_off].every(Number.isFinite))throw Error('Numerischer Fehler');return {CNT_off,S0,P0:p0,CTC1:0,CTC2:0,STC1:0,STC2:0,KS:0,KSS:0};}
export function nsa2300Evaluate(c,x){return c.P0+(x-c.CNT_off)*c.S0;}
