// Host-side reference model, NOT a chip memory image.
export const signed16=n=>{if(!Number.isInteger(n)||n<0||n>65535)throw Error('Ungültiges Registerwort');return n>=32768?n-65536:n};
export const adc=n=>{if(!Number.isFinite(n)||n < -32768||n>32767)throw Error('ADC ausserhalb signed 16 Bit');return n/32768};
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export function basis(p,t,po,to){
 if(!Number.isFinite(p)||!Number.isFinite(t)||!Number.isInteger(po)||!Number.isInteger(to)||po<0||po>3||to<0||to>3)throw Error('Ungültige Modellordnung oder Werte');
 return Array.from({length:po+1},(_,i)=>Array.from({length:to+1},(_,j)=>p**i*t**j)).flat();
}
// Modified Gram-Schmidt with reorthogonalisation; reject near dependent columns.
export function solve(a,b){
 const n=a[0]?.length||0,m=a.length;
 if(!n||m<n||b.length!==m||a.some(row=>row.length!==n||row.some(v=>!Number.isFinite(v)))||b.some(v=>!Number.isFinite(v)))throw Error('Zu wenige oder ungültige Messpunkte');
 const q=[],r=Array.from({length:n},()=>Array(n).fill(0));
 for(let j=0;j<n;j++){
  let v=a.map(row=>row[j]),norm0=Math.hypot(...v);
  for(let pass=0;pass<2;pass++)for(let i=0;i<j;i++){let d=dot(q[i],v);r[i][j]+=d;v=v.map((x,k)=>x-d*q[i][k]);}
  let norm=Math.hypot(...v);if(!norm0||norm<Math.max(1e-10,1e-8*norm0))throw Error('Messmatrix nicht unabhängig oder schlecht konditioniert');
  r[j][j]=norm;q.push(v.map(x=>x/norm));
 }
 const c=q.map(v=>dot(v,b));
 for(let j=n-1;j>=0;j--){for(let k=j+1;k<n;k++)c[j]-=r[j][k]*c[k];c[j]/=r[j][j];}
 if(c.some(v=>!Number.isFinite(v)))throw Error('Berechnung nicht endlich');return c;
}
export function fitSurface(points,po,to,model='max40109'){
 const scale=model==='max40109'?32768:1;
 const rows=points.map(({raw,temp,reference})=>{let p=model==='max40109'?adc(raw):raw;let t=to?(model==='max40109'?adc(temp):temp):0;return basis(p,t,po,to)});
 const coefficients=solve(rows,points.map(p=>p.reference));
 const result={po,to,model,scale,coefficients};
 return {...result,residuals:points.map(p=>predict(result,p.raw,p.temp)-p.reference)};
}
export function predict(f,raw,temp=0){
 let p=f.model==='max40109'?adc(raw):raw,t=f.to?(f.model==='max40109'?adc(temp):temp):0;
 return dot(f.coefficients,basis(p,t,f.po,f.to));
}
export function verify(f,points,lo,hi,tolerance){
 if(!points.length||![lo,hi,tolerance].every(Number.isFinite)||hi<=lo||tolerance<0)throw Error('Ungültiger Prüfbereich');
 return points.map(p=>{if(!Number.isFinite(p.reference))throw Error('Referenz fehlt');const predicted=predict(f,p.raw,p.temp),error=predicted-p.reference,percent=100*error/(hi-lo);return {...p,predicted,error,percent,pass:Math.abs(percent)<=tolerance};});
}
export function fitTemperature(points,order){
 const k=solve(points.map(p=>basis(adc(p.raw),0,order,0)),points.map(p=>p.reference));
 return {order,k,residuals:points.map(p=>dot(k,basis(adc(p.raw),0,order,0))-p.reference)};
}
export function makePlan(lo,hi,pc,tc,tl,th){
 if(![lo,hi,tl,th].every(Number.isFinite)||hi<=lo||!Number.isInteger(pc)||!Number.isInteger(tc)||pc<2||pc>4||tc<1||tc>4||(tc>1&&th<=tl))throw Error('Ungültiger Messplan');
 return Array.from({length:tc},(_,j)=>Array.from({length:pc},(_,i)=>({reference:lo+(hi-lo)*i/(pc-1),temperature:tc===1?tl:tl+(th-tl)*j/(tc-1)}))).flat();
}
export function afeEstimate(offset,span,drive,gain,limit){
 if(![offset,span,drive,gain,limit].every(Number.isFinite)||drive<=0||gain<=0||limit<=0||span===0)throw Error('Ungültige Brückendaten');
 const a=offset*drive*gain/1000,b=(offset+span)*drive*gain/1000;
 return {a,b,utilization:100*Math.max(Math.abs(a),Math.abs(b))/limit,span:b-a};
}
