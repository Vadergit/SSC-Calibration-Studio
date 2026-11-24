import {catalog,modelsFor,calibratorUrl,manufacturerUrl} from './model.mjs';
const $=id=>document.getElementById(id);
let selected=null;
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function choice({name,detail,url,action,planned=false}){
 const b=el(url?'a':'button','choice launcher-choice'+(planned?' planned':''));
 if(url)b.href=url;else{b.type='button';if(action)b.addEventListener('click',action);else b.disabled=true}
 const head=el('span','choice-head');head.append(el('strong','',name),el('span','choice-arrow',url||action?'→':''));
 b.append(head,el('small','',detail));return b;
}
function show(id=null){
 selected=id;render();$('heading').focus();
}
function render(){
 const panel=el('section','panel launcher-panel');
 const maker=catalog.find(m=>m.id===selected);
 if(maker){
  const back=el('button','back','← Alle Hersteller');back.type='button';back.addEventListener('click',()=>show());panel.append(back);
 }
 const h=el('h2','',maker?maker.name:'Kalibrierassistent auswählen');h.id='heading';h.tabIndex=-1;
 panel.append(h,el('p','muted',maker?'Wähle den gewünschten SSC.':'Wähle einen Hersteller oder direkt den gewünschten SSC.'));
 const grid=el('div','choices launcher-grid');
 if(maker){
  for(const m of modelsFor(maker.id)){
   const url=calibratorUrl(maker.id,m.id);
   grid.append(choice({name:m.name,detail:url?'Kalibrierassistent öffnen':'In Vorbereitung',url,planned:!url}));
  }
  if(!maker.models.some(m=>calibratorUrl(maker.id,m.id)))panel.append(el('p','muted small','Für diesen Hersteller ist noch kein Kalibrierassistent verfügbar.'));
 }else{
  for(const m of catalog){
   const url=manufacturerUrl(m.id);
   const count=m.models.filter(c=>calibratorUrl(m.id,c.id)).length;
   const detail=url?m.models[0].name+' · Kalibrierassistent öffnen':count?count+' verfügbar · '+m.models.length+' SSCs':m.models.length+' SSCs / Gruppen · In Vorbereitung';
   grid.append(choice({name:m.name,detail,url,action:url?null:()=>show(m.id),planned:count===0}));
  }
 }
 panel.append(grid);
 if(!maker)panel.append(el('p','muted small','Programmieradapter, Kommunikation und Aufgaben werden direkt im jeweiligen Kalibrierassistenten ausgewählt.'));
 $('workspace').replaceChildren(panel);
}
function theme(mode){document.documentElement.dataset.theme=mode;$('theme').textContent=mode==='dark'?'Light Mode':'Dark Mode';try{localStorage.setItem('ssc-studio-theme-v1',mode)}catch{}}
let saved='light';try{saved=localStorage.getItem('ssc-studio-theme-v1')==='dark'?'dark':'light'}catch{}
theme(saved);$('theme').addEventListener('click',()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
render();
