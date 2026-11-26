import {fit} from './calibration.mjs';
export function fitTemperature(points){
 if(!Array.isArray(points)||!points.length||points.some(p=>!Number.isFinite(p.temperature)))throw Error('Temperaturwerte fehlen.');
 const temperatures=[...new Set(points.map(p=>p.temperature))].sort((a,b)=>a-b);
 if(temperatures.length>3||temperatures.some((t,i)=>i&&t-temperatures[i-1]<1))throw Error('Ungültige Temperaturmatrix.');
 const nodes=temperatures.map(temperature=>{const {gain,offset}=fit(points.filter(p=>p.temperature===temperature));if(gain===0)throw Error('Gain darf nicht null sein.');return {temperature,gain,offset}});
 if(nodes.some(n=>Math.sign(n.gain)!==Math.sign(nodes[0].gain)))throw Error('Signalrichtung wechselt zwischen Temperaturstufen.');
 const result={nodes,gain:nodes[0].gain,offset:nodes[0].offset};
 return {...result,residuals:points.map(p=>predict(result,p.raw,p.temperature)-p.reference)};
}
export function predict(model,raw,temperature){
 if(!Number.isFinite(raw)||!Number.isFinite(temperature))throw Error('Ungültiger Prüfwert.');
 const nodes=model.nodes;
 if(nodes.length===1)return nodes[0].gain*raw+nodes[0].offset;
 if(temperature<nodes[0].temperature||temperature>nodes.at(-1).temperature)throw Error('Temperatur ausserhalb der Kalibrierung.');
 let value=0;
 for(const n of nodes){let w=1;for(const other of nodes)if(other!==n)w*=(temperature-other.temperature)/(n.temperature-other.temperature);value+=w*(n.gain*raw+n.offset);}
 if(!Number.isFinite(value))throw Error('Berechnung ausserhalb des Zahlenbereichs.');
 return value;
}
