import {catalog,adapters,protocols,tasks,modelsFor,modelFor,adaptersFor,protocolsFor,isComplete,tasksFor,initial,select,handoff} from './model.mjs';
const $=id=>document.getElementById(id);
let state=initial(), page=0;
const labels=['Hersteller','SSC auswählen','Programmieradapter','Kommunikation','Aufgabe'];
const keys=['manufacturer','model','adapter','protocol','task'];
const desc=['Wähle den Hersteller des Sensor Signal Conditioners.','Wähle das genaue Modell.','Originale Eval-Boards und DIY-Adapter bleiben gleichwertige Integrationsziele.','Wähle die gewünschte Schnittstelle zum SSC. USB und Sensorprotokoll sind zwei verschiedene Ebenen.','Wähle die gewünschte Aufgabe.'];
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function button(label,fn,cls=''){const b=el('button',cls,label);b.type='button';b.addEventListener('click',fn);return b}
function note(parent,text){parent.append(el('p','notice',text))}
function choice(parent,label,detail,active,fn){const b=button('',fn,'choice'+(active?' selected':''));b.setAttribute('aria-pressed',String(active));b.append(el('strong','',label),el('small','',detail));parent.append(b)}
function go(n){page=n;render();$('heading').focus()}
function choose(key,id){state=select(state,key,id);go(Math.min(page+1,4))}
function maxPage(){let i=0;while(i<4&&state[keys[i]])i++;return i}
function render(){
 const steps=$('steps');steps.replaceChildren();
 labels.forEach((label,i)=>{const b=button('',()=>go(i),'step'+(page===i?' active':''));b.disabled=i>maxPage();if(page===i)b.setAttribute('aria-current','step');b.append(el('span','num',String(i+1)),el('span','',label));steps.append(b)});
 const sum=$('summary');sum.replaceChildren();
 const values=[catalog.find(x=>x.id===state.manufacturer)?.name,modelFor(state)?.name,adapters[state.adapter],protocols[state.protocol],tasks.find(x=>x.id===state.task)?.name];
 values.forEach((v,i)=>{sum.append(el('dt','',labels[i]),el('dd','',v||'–'))});
 const panel=el('section','panel');panel.append(el('div','eyebrow','SCHRITT '+(page+1)+' VON 5'));
 const heading=el('h2','',labels[page]);heading.id='heading';heading.tabIndex=-1;panel.append(heading,el('p','muted',desc[page]));
 const grid=el('div','choices');panel.append(grid);
 if(page===0)catalog.forEach(m=>choice(grid,m.name,m.id==='elmos'?'Bestehender Einzelassistent':'Geplant · '+m.models.length+' Modelle / Gruppen',state.manufacturer===m.id,()=>choose('manufacturer',m.id)));
 if(page===1)modelsFor(state.manufacturer).forEach(m=>choice(grid,m.name,m.module==='elmos'?'Einzelassistent vorhanden · native Integration offen':'Treiber geplant',state.model===m.id,()=>choose('model',m.id)));
 if(page===2){adaptersFor(state).forEach(a=>choice(grid,adapters[a.id],modelFor(state)?.module==='elmos'?'Im Elmos-Einzelassistenten auswählbar':'Kandidat · Kombination nicht validiert',state.adapter===a.id,()=>choose('adapter',a.id)));note(panel,'Die DIY-Boards benötigen eine passende Firmware, korrekte Signalpegel und gegebenenfalls externe Pegelwandler / Lastschalter.');}
 if(page===3){protocolsFor(state).forEach(p=>choice(grid,protocols[p],modelFor(state)?.module==='elmos'?'Im Einzelassistenten verfügbar · Hardwarestatus beachten':'Planung · Adapterunterstützung noch nicht bestätigt',state.protocol===p,()=>choose('protocol',p)));note(panel,'Die Auswahl stellt noch keine Geräteverbindung her.');}
 if(page===4){
  const available=tasksFor(state);
  if(!available.length){note(panel,'Für diese SSC-Kombination ist noch kein Assistent integriert. Keine Verbindung, Kalibrierung oder Programmierung möglich.');const a=el('a','link','Entwicklungsstand auf GitHub');a.href='https://github.com/Vadergit/SSC-Calibration-Studio/tree/main/docs/manufacturers';panel.append(a);}
  else{
   available.forEach(t=>choice(grid,t.name,t.desc,state.task===t.id,()=>choose('task',t.id)));
   const link=handoff(state);
   const box=el('section','handoff');box.append(el('h3','','Elmos-Einzelassistent'));
   box.append(el('p','muted','Die offizielle Web-App wird in einem neuen Tab geöffnet. Adapter, Protokoll und Aufgabe dort nochmals auswählen (Sensorbrücken-Rechner öffnet direkt). Das Studio überträgt noch keine Auswahl und führt keine Hardwarebefehle aus.'));
   if(link){const a=el('a','primary','Elmos-Assistent öffnen ↗');a.href=link.url;a.target='_blank';a.rel='noopener';box.append(a)}
   else box.append(el('p','small muted','Wähle zuerst eine Aufgabe.'));
   panel.append(box);
  }
 }
 const nav=el('div','nav');if(page>0)nav.append(button('← Zurück',()=>go(page-1)));if(page<maxPage()&&page<4)nav.append(button('Weiter →',()=>go(page+1),'primary'));panel.append(nav);
 $('workspace').replaceChildren(panel);
}
$('reset').addEventListener('click',()=>{state=initial();go(0)});
function theme(mode){document.documentElement.dataset.theme=mode;$('theme').textContent=mode==='dark'?'Light Mode':'Dark Mode';try{localStorage.setItem('ssc-studio-theme-v1',mode)}catch{}}
let saved='light';try{saved=localStorage.getItem('ssc-studio-theme-v1')==='dark'?'dark':'light'}catch{}
theme(saved);$('theme').addEventListener('click',()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
render();
