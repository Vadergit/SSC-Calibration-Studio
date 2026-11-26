/* SSC Studio UI contract, based on ELMOS settings behaviour. No device I/O. */
(function(global){
'use strict';
function installSettingsPanel({panel,trigger,root=document,onOpen=()=>{},closeButton}){
 if(!panel||!trigger)throw Error('Settings panel and trigger required');
 const set=(open,focus=false)=>{panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)onOpen();else if(focus)trigger.focus()};
 const toggle=()=>set(panel.hidden);
 const outside=e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger.contains(e.target))set(false)};
 const key=e=>{if(e.key==='Escape'&&!panel.hidden){set(false,true);e.preventDefault()}};
 const close=()=>set(false,true);
 trigger.addEventListener('click',toggle);root.addEventListener('click',outside,true);root.addEventListener('keydown',key);closeButton?.addEventListener('click',close);
 trigger.setAttribute('aria-controls',panel.id);set(!panel.hidden);
 return {open:()=>set(true),close:()=>set(false),destroy(){trigger.removeEventListener('click',toggle);root.removeEventListener('click',outside,true);root.removeEventListener('keydown',key);closeButton?.removeEventListener('click',close)}};
}
global.SSC_UI=Object.freeze({version:'0.1.0',installSettingsPanel});
})(window);
