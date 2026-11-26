import {decode31015,plan31015,commandPlan31015} from './zsc31015.mjs';
// Datasheet §2.3, §3.6 and library Mathcad transfer functions.
// Continuous arithmetic with quantized register values, NOT silicon bit-exact emulation.
// Reference temperature register: upper 7 bits of concatenated 11-bit raw temperature.
export function predict31015(d,raw,tempCode){
 if(!Number.isFinite(raw)||raw<0||raw>16383||!Number.isFinite(tempCode)||tempCode<0||tempCode>2047||d.sotConfig===3||d.negativeGain)throw Error('Ungültiger Rohwert oder nicht unterstützter negativer Digitalgain.');
 const dt=2*(tempCode-16*d.tsetl),s=d.sotSigned;
 const gain=d.digitalGain*(1+d.tcgSigned*dt/1048576+(d.sotConfig===1?s*dt*dt/1073741824:0));
 const offset=-d.offsetB+d.tcoSigned*dt/256+(d.sotConfig===2?s*(d.tcConfig&2?8:1)*dt*dt/524288:0);
 const z=gain*(raw+offset);
 return d.sotConfig===0?z*(1.25+s*z/4194304):z;
}
const keys={Tco:'a',Tcg:'b',SOT_bridge:'s',SOT_tco:'s',SOT_tcg:'s'};
function linear(A,B){const m=A.map((r,i)=>[...r,B[i]]),n=B.length;for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[p][k]))p=i;if(Math.abs(m[p][k])<1e-12)throw Error('Messpunkte nicht unabhängig.');[m[k],m[p]]=[m[p],m[k]];const v=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=v;for(let i=0;i<n;i++)if(i!==k){const v=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=v*m[k][j]}}return m.map(r=>r[n])}
export function previewFit31015(before,mode,points,{toleranceDigits=32}={}){
 const original=decode31015(before),plan=plan31015(mode),terms=plan.coefficients.slice(2);
 if(original.negativeGain)throw Error('Negative Digitalgain-Variante noch nicht verifiziert.');
 if(!Array.isArray(points)||points.length!==plan.points.length||points.some(p=>![p.raw,p.tempCode,p.targetPercent].every(Number.isFinite)||p.raw<=0||p.raw>=16383||p.tempCode<0||p.tempCode>2047||p.targetPercent<0||p.targetPercent>100)||!Number.isFinite(toleranceDigits)||toleranceDigits<=0)throw Error('Ungültige oder unvollständige Messdaten.');
 if(mode==='autoQuadratic'){const trials=[];for(const [candidate,indices] of [['quadraticOffset',[0,1,2,3,4]],['quadraticGain',[0,1,2,3,5]]]){try{const fit=previewFit31015(before,candidate,indices.map(j=>points[j]),{toleranceDigits}),decoded=decode31015(fit.expected),predicted=points.map(q=>predict31015(decoded,q.raw,q.tempCode)),maxErrorDigits=Math.max(...predicted.map((v,j)=>Math.abs(v-Math.min(16383,points[j].targetPercent*16384/100))));trials.push({...fit,mode,selectedMode:candidate,predicted,maxErrorDigits,withinTolerance:maxErrorDigits<=toleranceDigits})}catch{}}if(!trials.length)throw Error('Kein darstellbares quadratisches Modell.');return trials.sort((x,y)=>x.maxErrorDigits-y.maxErrorDigits)[0]}
 const sotConfig=terms.includes('SOT_bridge')?0:terms.includes('SOT_tco')?2:1;
 const tsetl=Math.min(127,Math.round(points[0].tempCode/16));
 const rows=points.map(p=>({x:p.raw/16384,t:2*(p.tempCode-16*tsetl)/2048,y:Math.min(16383,p.targetPercent*16384/100)/16384}));
 const coeff=['g','o',...terms.map(t=>keys[t])],lo=rows[0],hi=rows.reduce((a,b)=>b.y>a.y?b:a);
 const g=(hi.y-lo.y)/(hi.x-lo.x)/(sotConfig===0?1.25:1);
 if(!Number.isFinite(g)||g<=0)throw Error('Positiver Rohwert-Hub erforderlich.');
 let p={g,o:lo.x-lo.y/g/(sotConfig===0?1.25:1),a:0,b:0,s:0};
 const fn=(r,v)=>{const z=v.g*(1+v.b*r.t+(sotConfig===1?v.s*r.t*r.t:0))*(r.x-v.o+v.a*r.t+(sotConfig===2?v.s*r.t*r.t:0));return sotConfig===0?z*(1.25+v.s*z):z};
 const cost=v=>rows.reduce((sum,r)=>sum+(fn(r,v)-r.y)**2,0);
 for(let iter=0;iter<50;iter++){const J=rows.map(r=>coeff.map(k=>{const h=1e-6;return (fn(r,{...p,[k]:p[k]+h})-fn(r,{...p,[k]:p[k]-h}))/(2*h)})),A=coeff.map((_,i)=>coeff.map((_,j)=>J.reduce((s,r)=>s+r[i]*r[j],0))),B=coeff.map((_,i)=>rows.reduce((s,r,j)=>s+J[j][i]*(r.y-fn(r,p)),0)),delta=linear(A,B);
 if(Math.max(...delta.map(Math.abs))<1e-10)break;
 let accepted=false;for(let step=1;step>=1/1024;step/=2){const q={...p};coeff.forEach((k,i)=>q[k]+=step*delta[i]);if(q.g>0&&cost(q)<cost(p)){p=q;accepted=true;break}}if(!accepted)break;
 }
 const gain8=p.g>=8,scale=gain8?8:1,gain=Math.round(p.g*2048/scale),off=Math.round(p.o*16384),tcg=Math.round(p.b*512);
 const tco8=Math.abs(p.a*2048)>255||(sotConfig===2&&Math.abs(p.s*2048)>127),ts=tco8?8:1,tco=Math.round(p.a*2048/ts);
 const sot=Math.round(p.s*(sotConfig===0?256:sotConfig===1?256:2048/ts));
 if(gain<1||gain>16383||off<0||off>16383||Math.abs(tcg)>255||Math.abs(tco)>255||Math.abs(sot)>127)throw Error('Koeffizient nicht darstellbar: Gain '+gain+', Offset '+off+', Tco '+tco+', Tcg '+tcg+', SOT '+sot+'. AFE oder Messpunkte prüfen.');
 const change={gainB:gain|(gain8?0x4000:0),offsetB:off,tco:Math.abs(tco),tcg:Math.abs(tcg),tcConfig:(tcg<0?4:0)|(tco8?2:0)|(tco<0?1:0),sot:Math.abs(sot)|(sot<0?128:0),sotConfig,tsetl};
 const encode=v=>commandPlan31015(before,v);
 let result=encode(change),d=decode31015(result.expected),predicted=points.map(q=>predict31015(d,q.raw,q.tempCode)),maxErrorDigits=Math.max(...predicted.map((y,i)=>Math.abs(y-rows[i].y*16384)));
 // Search adjacent offset/gain register values to reduce quantization residual.
 for(let k=0;k<6;k++){let improved=false;for(const field of ['gainB','offsetB'])for(const step of [-1,1]){const v={...change,[field]:change[field]+step};if(v.offsetB<0||v.offsetB>16383||(v.gainB&0x4000)!==(change.gainB&0x4000)||(v.gainB&0x3fff)===0)continue;const q=encode(v),next=decode31015(q.expected),pred=points.map(x=>predict31015(next,x.raw,x.tempCode)),error=Math.max(...pred.map((y,i)=>Math.abs(y-rows[i].y*16384)));if(error<maxErrorDigits){Object.assign(change,v);result=q;d=next;predicted=pred;maxErrorDigits=error;improved=true}}if(!improved)break}
 return {mode,change,commands:result.commands,expected:result.expected,predicted,maxErrorDigits,withinTolerance:maxErrorDigits<=toleranceDigits,hardwareVerified:false,model:'continuous-register-preview'};
}
