// Pure common reference/verification maths; never commands hardware.
export function referenceError({reference,measured,minimum,maximum}){
 if(![reference,measured,minimum,maximum].every(Number.isFinite)||maximum<=minimum)
  throw new Error('Ungültiger Messbereich oder Messwert');
 const error=measured-reference;
 return {error,errorPercentFS:100*error/(maximum-minimum)};
}
export function verificationSummary(points,tolerancePercentFS){
 if(!Number.isFinite(tolerancePercentFS)||tolerancePercentFS<0||!points.length)
  throw new Error('Ungültige Toleranz oder leere Messreihe');
 const results=points.map(p=>({...p,...referenceError(p)}));
 const maxErrorPercentFS=Math.max(...results.map(p=>Math.abs(p.errorPercentFS)));
 return {results,maxErrorPercentFS,passed:maxErrorPercentFS<=tolerancePercentFS};
}
