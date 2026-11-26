export function fitModel(points,kind="linear"){
 const terms={linear:2,quadratic:3,tk0:3,temperature:4}[kind];
 if(!terms||!Array.isArray(points)||points.length<terms||points.some(p=>!Number.isFinite(p.raw)||!Number.isFinite(p.reference)||((kind==="temperature"||kind==="tk0")&&!Number.isFinite(p.temp))))throw Error("Zu wenige oder ungültige Messpunkte.");
 const mean=k=>points.reduce((s,p)=>s+p[k],0)/points.length;
 const center=mean("raw"),scale=Math.max(...points.map(p=>Math.abs(p.raw-center))),tc=(kind==="temperature"||kind==="tk0")?mean("temp"):0,ts=(kind==="temperature"||kind==="tk0")?Math.max(...points.map(p=>Math.abs(p.temp-tc))):1;
 if(!Number.isFinite(scale)||!scale||!ts||!Number.isFinite(ts))throw Error("Messpunkte decken den Rohwert- oder Temperaturbereich nicht ab.");
 const basis=(r,t)=>{const x=(r-center)/scale,z=(t-tc)/ts;return kind==="quadratic"?[1,x,x*x]:kind==="temperature"?[1,x,z,x*z]:kind==="tk0"?[1,x,z]:[1,x]};
 const a=points.map(p=>basis(p.raw,p.temp)),y=points.map(p=>p.reference);
 // Modified Gram-Schmidt with reorthogonalization, small normalized design matrix.
 const q=[],R=Array.from({length:terms},()=>Array(terms).fill(0)),b=[];
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 for(let j=0;j<terms;j++){let v=a.map(row=>row[j]);for(let pass=0;pass<2;pass++)for(let k=0;k<j;k++){const d=dot(q[k],v);R[k][j]+=d;v=v.map((x,i)=>x-d*q[k][i]);}const n=Math.sqrt(dot(v,v));if(!Number.isFinite(n)||n<1e-9*Math.sqrt(points.length))throw Error("Messpunkte sind linear abhängig; weitere unabhängige Punkte nötig.");R[j][j]=n;q.push(v.map(x=>x/n));b.push(dot(q[j],y));}
 const coefficients=Array(terms).fill(0);for(let j=terms-1;j>=0;j--)coefficients[j]=(b[j]-R[j].slice(j+1).reduce((s,r,i)=>s+r*coefficients[j+i+1],0))/R[j][j];
 const residuals=a.map((row,i)=>dot(row,coefficients)-y[i]);
 if(![...coefficients,...residuals].every(Number.isFinite))throw Error("Numerischer Überlauf.");
 return {kind,center,scale,tc,ts,coefficients,residuals,maxError:Math.max(...residuals.map(Math.abs)),gain:kind==="linear"?coefficients[1]/scale:null,offset:kind==="linear"?coefficients[0]-coefficients[1]*center/scale:null};
}

export function predict(f,raw,temp=25){if(!Number.isFinite(raw)||!Number.isFinite(temp))throw Error("Ungültiger Prüfwert.");const x=(raw-f.center)/f.scale,z=(temp-f.tc)/f.ts,c=f.coefficients;return c[0]+c[1]*x+(f.kind==="quadratic"?c[2]*x*x:f.kind==="temperature"?c[2]*z+c[3]*x*z:f.kind==="tk0"?c[2]*z:0);}

export function verification(f,raw,temp,reference,span,tolerance){if(![reference,span,tolerance].every(Number.isFinite)||span<=0||tolerance<0)throw Error("Ungültiger Prüfbereich.");const estimate=predict(f,raw,temp),error=estimate-reference,percent=100*error/span;return {estimate,error,percent,pass:Math.abs(percent)<=tolerance};}

export function bridge(v,low,high,gain){if(![v,low,high,gain].every(Number.isFinite)||v<=0||gain<=0||low===high)throw Error("Ungültige Brückenparameter.");return {span:high-low,offset:low,lowMv:low*v,highMv:high*v,amplifiedSpanMv:(high-low)*v*gain};}

export function outputValue(value,min,max,lo,hi,clip){if(![value,min,max,lo,hi].every(Number.isFinite)||max<=min||hi<=lo)throw Error("Ungültige Skalierung.");const y=lo+(value-min)/(max-min)*(hi-lo);return clip?Math.min(hi,Math.max(lo,y)):y;}
export const fit=fitModel;
