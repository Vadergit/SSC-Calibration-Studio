/* Public GitHub source metadata. No token, writes, or hardware access. */
(function(){
'use strict';
const semver='(\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?(?:\\+[0-9A-Za-z.-]+)?)';
const markers={
 elmos:'data-app-version=["\\\']v?',
 renesas:'Renesas / IDT · v',
 novosense:'NOVOSENSE · SSC · v',
 ti:'Texas Instruments · v',
 melexis:'MELEXIS · SSC · v',
 adi:'MAX40109 · SSC · v',
 jhm:'^\\s*v?'
};
function parseVersion(text,kind){
 if(!Object.prototype.hasOwnProperty.call(markers,kind))return null;
 const match=String(text).match(new RegExp(markers[kind]+semver+(kind==='jhm'?'\\s*$':'')));
 return match?match[1]:null;
}
function relative(date,now=Date.now()){
 const delta=now-Date.parse(date);
 if(!Number.isFinite(delta))return 'Datum unbekannt';
 if(delta< -60000)return 'Zeitstempel prüfen';
 const minutes=Math.floor(Math.max(0,delta)/60000);
 if(minutes<1)return 'gerade eben';
 if(minutes<60)return 'vor '+minutes+(minutes===1?' Minute':' Minuten');
 const h=Math.floor(minutes/60);if(h<24)return 'vor '+h+(h===1?' Stunde':' Stunden');
 const days=Math.floor(h/24);if(days<30)return 'vor '+days+(days===1?' Tag':' Tagen');
 if(days<365){const m=Math.floor(days/30);return 'vor '+m+(m===1?' Monat':' Monaten')}
 const y=Math.floor(days/365);return 'vor '+y+(y===1?' Jahr':' Jahren');
}
function valid(value){return value&&/^[a-f0-9]{40}$/.test(value.sha)&&Number.isFinite(Date.parse(value.date))&&(value.version===null||new RegExp('^'+semver+'$').test(value.version))}
if(typeof module==='object'&&module.exports)module.exports={parseVersion,relative,valid};
if(typeof document==='undefined')return;
const cards=[...document.querySelectorAll('[data-repo][data-version-kind]')];
const status=document.getElementById('version-refresh-status');
const cacheKey='ssc-app-version-cache-v1';
const ttl=15*60*1000;
let cache={};try{cache=JSON.parse(localStorage.getItem(cacheKey)||'{}')||{}}catch{}
const state=new Map();
function getSeed(card){return {sha:card.dataset.sha,date:card.dataset.changed,version:card.dataset.version||null}}
function render(card,v){
 state.set(card,v);
 card.querySelector('.app-version').textContent=v.version?'v'+v.version:'Version nicht erkannt';
 const time=card.querySelector('.app-changed');time.dateTime=v.date;
 time.textContent=new Intl.DateTimeFormat('de-CH',{timeZone:'Europe/Zurich',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date(v.date));
 card.querySelector('.app-age').textContent=relative(v.date);
}
async function request(url,kind){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{const response=await fetch(url,{signal:controller.signal,cache:'no-cache',credentials:'omit'});if(!response.ok)throw Error('HTTP '+response.status);return kind==='json'?await response.json():await response.text()}finally{clearTimeout(timer)}
}
async function refresh(card){
 const repo=card.dataset.repo,seed=getSeed(card),saved=cache[repo];
 let current=valid(saved)&&Date.parse(saved.date)>=Date.parse(seed.date)?saved:seed;
 render(card,current);
 if(valid(saved)&&saved.version&&current===saved&&Number.isFinite(saved.checkedAt)&&Date.now()-saved.checkedAt>=0&&Date.now()-saved.checkedAt<ttl)return true;
 try{
  const commit=await request('https://api.github.com/repos/Vadergit/'+encodeURIComponent(repo)+'/commits/main','json');
  const sha=commit.sha,date=commit.commit?.committer?.date;
  if(!valid({sha,date,version:null}))throw Error('Invalid commit metadata');
  if(Date.parse(date)<Date.parse(current.date)&&sha===current.sha)throw Error('Invalid date');
  let version=current.sha===sha?current.version:null;
  if(!version){
   const raw=await request('https://raw.githubusercontent.com/Vadergit/'+encodeURIComponent(repo)+'/'+sha+'/'+card.dataset.versionPath,'text');
   version=parseVersion(raw,card.dataset.versionKind);
  }
  current={sha,date,version,checkedAt:Date.now()};
  render(card,current);cache[repo]=current;
  return version!==null;
 }catch{
  // Preserve the last confirmed metadata; do not label a cached value as live.
  return false;
 }
}
let busy=false;
async function refreshAll(){
 if(busy)return;busy=true;if(status)status.textContent='Versionsstände werden geprüft …';
 try{
  const results=await Promise.all(cards.map(refresh));
  try{localStorage.setItem(cacheKey,JSON.stringify(cache))}catch{}
  if(status)status.textContent=results.every(Boolean)?'Versionsstände geprüft (GitHub Main; max. 15 Minuten zwischengespeichert).':'Teilweise gespeicherte Angaben: Live-Abfrage oder Versionserkennung nicht vollständig möglich.';
 }finally{busy=false}
}
for(const card of cards){const seed=getSeed(card);if(valid(seed))render(card,seed)}
refreshAll();
setInterval(()=>{for(const [card,v] of state)card.querySelector('.app-age').textContent=relative(v.date)},60000);
setInterval(refreshAll,ttl);
})();
