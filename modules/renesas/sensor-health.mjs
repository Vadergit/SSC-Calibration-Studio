// Only live requests count; intentional calibration pauses are not failures.
export function createSensorHealth({timeoutMs=1500,errorLimit=3}={}){
 let since=null,errors=0;
 return {reset(){since=null;errors=0},observe(now,{fresh=false,error=false,adapterFault=false}={}){
  if(fresh){since=null;errors=0;return false}
  since??=now;if(error)errors++;
  return adapterFault||errors>=errorLimit||now-since>=timeoutMs;
 }};
}
