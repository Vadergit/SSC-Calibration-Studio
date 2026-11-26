// Public ZSC31010 datasheet, 2016-01-20, Tables 3.6 and 3.12. Offline read-order decoder only.
export function decode31010(input){
 const words=typeof input==="string"?input.trim().split(/[\s,;]+/):input;
 if(!Array.isArray(words)||words.length!==14)throw Error("14 Bytes inklusive abschliessendem A5 erforderlich.");
 const b=words.map(x=>typeof x==="number"?x:/^(?:0x)?[0-9a-f]{1,2}$/i.test(x)?parseInt(x,16):NaN);
 if(b.some(x=>!Number.isInteger(x)||x<0||x>255)||b[13]!==0xa5||(b[12]>>4)!==(b[0]&15))throw Error("Ungültiger Dump: Bytebereich, A5-Abschluss oder Offset-Duplikat stimmt nicht.");
 const twos=(x,n)=>x>=2**(n-1)?x-2**n:x;
 const join=(i)=>((b[i]>>6)|(b[i+1]&63)<<2);
 const gainCode=(b[10]>>5)|(b[11]<<3)|((b[12]&15)<<11),tc=(b[6]>>6)|((b[7]&3)<<2),sot=(b[7]>>2)|((b[8]&3)<<6),cfg=(b[8]>>2)&15,offsetMode=(b[9]>>5)&3,output=(b[9]>>7)|((b[10]&1)<<1);
 return {Gain_B_code:gainCode,Gain_B:(gainCode&16383)/2048*(gainCode&16384?8:1),Offset_B:twos(b[0]|((b[1]&63)<<8),14),Gain_T:join(1)/128,Offset_T:twos(join(2),8),T_SETL_code:join(3),Tcg_code:join(4)*(tc&4?-1:1),Tco_code:join(5)*(tc&1?-1:1)*(tc&2?8:1),polarityInverted:!!(tc&8),SOT_code:(sot&127)*(sot&128?-1:1),SOT_target:["Bridge","Tcg","Tco","Reserved"][cfg>>2],preampGain:[6,24,12,48][cfg&3],ADC_offsetMode:["-1/16 … 15/16","-1/8 … 7/8","-1/4 … 3/4","-1/2 … 1/2"][offsetMode],outputMode:["Digital + Temperatur","0–1 V","Ratiometrisch","Digital ohne Temperatur"][output],updateMs:[1,5,25,125][(b[10]>>1)&3],JFET_code:(b[10]>>3)&3,oscTrimCode:(b[8]>>6)|((b[9]&1)<<2),trimCode:(b[9]>>1)&15};
}
