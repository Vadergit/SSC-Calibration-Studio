// Manufacturer worksheet reference calculations (not a hardware write path).
// AFE Configuration Spreadsheet rev 1.10, ZSC31014_Bridge, E11:E19.
// External Temperature Measurement rev 1.0, External_Temp_Adjustment, H9:H25.
const gains=[1.5,3,6,12,24,48,96,192];
export function bridgeAfeReference({supply,span,spanTolerance=0,offset=0,offsetTolerance=0}){
 if(![supply,span,spanTolerance,offset,offsetTolerance].every(Number.isFinite)||supply<=0||span<=0||spanTolerance<0||offsetTolerance<0)throw Error('Invalid bridge inputs');
 const min=supply*(offset-offsetTolerance),max=supply*(span+spanTolerance+offset+offsetTolerance),range=max-min;
 const adcRange=0.97*supply*1000,maximumGain=Math.floor(adcRange/range);
 const selectedGain=gains.filter(g=>g<=maximumGain).at(-1)??null;
 return {min,max,range,adcMinV:.015*supply,adcMaxV:.985*supply,maximumGain,selectedGain};
}
export function externalTempReference({supply,bridgeOhms,bridgePpm,tailOhms,tailPpm,ambient,low,high}){
 if(![supply,bridgeOhms,bridgePpm,tailOhms,tailPpm,ambient,low,high].every(Number.isFinite)||supply<=0||bridgeOhms<=0||tailOhms<0||high<=low)throw Error('Invalid external temperature inputs');
 const at=t=>{const bridge=bridgeOhms*(1+bridgePpm*1e-6*(t-ambient)),tail=tailOhms*(1+tailPpm*1e-6*(t-ambient));if(bridge<=0||tail<0)throw Error('Resistance outside physical range');return {bridge,tail,voltage:supply*(bridge/2+tail)/(bridge+tail)}};
 const a=at(low),b=at(high),spanMv=Math.abs(b.voltage-a.voltage)*1000;
 return {low:a,high:b,spanMv,negativeGain:b.voltage<a.voltage,validInput:[a,b].every(x=>x.voltage>=1&&x.voltage<=supply-1.2),maximumGain:spanMv?Math.floor(.97*supply*1000/spanMv):null};
}
// Continuous approximation of datasheet equations 4–7, normalized to 14-bit full scale.
// This is deliberately independent of register encoding. It must never be used to program EEPROM.
export function continuousBridge({raw,temp},p,{curve='parabolic',tsetl=0}={}){
 const d=temp-tsetl;
 const z=p.gain*(1+d*((p.sotTcg||0)*d+(p.tcg||0)))*(raw-.5+p.offset+d*((p.sotTco||0)*d+(p.tco||0)));
 return curve==='s-shaped'?z*(1+(p.sotBridge||0)*Math.abs(z))+.5:(z+.5)*(1+(p.sotBridge||0)*(z+.5));
}
const termMap={Tco:'tco',Tcg:'tcg',SOT_tco:'sotTco',SOT_tcg:'sotTcg',SOT_bridge:'sotBridge'};
function solveLinear(a,b){
 const n=b.length,m=a.map((r,i)=>[...r,b[i]]);
 for(let k=0;k<n;k++){let q=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[q][k]))q=i;
 if(Math.abs(m[q][k])<1e-13)throw Error('Insufficient independent calibration points');
 [m[k],m[q]]=[m[q],m[k]];const d=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=d;
 for(let i=0;i<n;i++)if(i!==k){const f=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=f*m[k][j]}}
 return m.map(r=>r[n]);
}
export function fitContinuousBridge(points,{terms=[],curve='parabolic',tsetl=points[0]?.temp}={}){
 if(!['parabolic','s-shaped'].includes(curve)||!Number.isFinite(tsetl)||terms.some(t=>!Object.hasOwn(termMap,t))||new Set(terms).size!==terms.length)throw Error('Invalid calibration model');
 const keys=['gain','offset',...terms.map(t=>termMap[t])];
 if(points.length<keys.length||points.some(p=>![p.raw,p.temp,p.target].every(Number.isFinite)||p.raw<0||p.raw>1||p.temp<0||p.temp>1||p.target<0||p.target>1))throw Error('Invalid or insufficient normalized data');
 const ordered=[...points].sort((a,b)=>a.raw-b.raw),lo=ordered[0],hi=ordered.at(-1);
 let gain=(hi.target-lo.target)/(hi.raw-lo.raw);
 if(!Number.isFinite(gain)||gain<=0)throw Error('No positive bridge span');
 let p={gain,offset:(lo.target-.5)/gain-lo.raw+.5};for(const k of keys.slice(2))p[k]=0;
 const f=(point,param)=>continuousBridge(point,param,{curve,tsetl});
 const cost=param=>points.reduce((s,q)=>s+(f(q,param)-q.target)**2,0);
 let error=cost(p);
 for(let iteration=0;iteration<80;iteration++){
  const jac=points.map(q=>keys.map(k=>{const h=1e-6*Math.max(1,Math.abs(p[k]));return (f(q,{...p,[k]:p[k]+h})-f(q,{...p,[k]:p[k]-h}))/(2*h)}));
  const normal=keys.map((_,i)=>keys.map((_,j)=>jac.reduce((s,r)=>s+r[i]*r[j],0)));
  const rhs=keys.map((_,i)=>points.reduce((s,q,j)=>s+jac[j][i]*(q.target-f(q,p)),0));
  const delta=solveLinear(normal,rhs);
  if(Math.max(...delta.map(Math.abs))<1e-10)break;
  let improved=false;
  for(let step=1;step>=1/1024;step/=2){const candidate={...p};keys.forEach((k,i)=>candidate[k]+=step*delta[i]);const e=cost(candidate);if(candidate.gain>0&&e<error){p=candidate;error=e;improved=true;break}}
  if(!improved)break;
 }
 const predicted=points.map(q=>f(q,p)),maxErrorDigits=Math.max(...predicted.map((y,i)=>Math.abs(y-points[i].target)*16384));
 if(!Number.isFinite(maxErrorDigits)||maxErrorDigits>16)throw Error('Continuous fit residual too large');
 return {parameters:p,tsetl,curve,predicted,maxErrorDigits,hardwareVerified:false};
}
// Cached output in Coeff_Calc B16:B26/D18:D25. The sheet calls iLiteCalMath.dll;
// the cached result is an independent fixture, not a derivation of register weights.
export const workbookReference31014=Object.freeze({
 bridgeRawPercent:[[8,84],[9,85],[11,87]],targetPercent:[0,100],
 rawTemperatureC:[8,36,87],targetTemperatureC:[5,30,80],
 adcOffset:-6144,offsetB:-5653,gainB:10778,tcg:-2,tco:-607,sotTco:-69,sotTcg:5,sotBridge:0,offsetT:0,gainT:8192,sotT:0,tsetl:7045
});
