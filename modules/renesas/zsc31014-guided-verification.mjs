export function guidedVerify31014(raw,reference,{refLow,refHigh,targetLow,targetHigh,tolerance}){
 if(![raw,reference,refLow,refHigh,targetLow,targetHigh,tolerance].every(Number.isFinite)||raw<0||raw>16383||reference<0||reference>100||refHigh<=refLow||targetHigh<=targetLow||tolerance<=0)throw Error('Prüfwerte, Kalibrierbereich oder Toleranz ungültig.');
 const digital=raw*100/16384,expected=targetLow+(reference-refLow)*(targetHigh-targetLow)/(refHigh-refLow);
 const estimate=refLow+(digital-targetLow)*(refHigh-refLow)/(targetHigh-targetLow),error=estimate-reference;
 if(expected<0||expected>100)throw Error('Referenzdruck ausserhalb des darstellbaren digitalen Zielbereichs.');
 return {raw,digital,expected,reference,estimate,error,tolerance,pass:Math.abs(error)<=tolerance};
}
