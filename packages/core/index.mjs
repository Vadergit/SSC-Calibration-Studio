// Browser-independent module contract, version 1.
export const CONTRACT_VERSION=1;
export const STUDIO_VERSION='0.3.0';
export const selectionKeys=Object.freeze(['manufacturer','model','adapter','protocol','task']);
export function emptySelection(){return Object.fromEntries(selectionKeys.map(k=>[k,'']))}
export function changeSelection(state,key,value,allowed){
 const index=selectionKeys.indexOf(key);
 if(index<0||!allowed.includes(value))throw new Error('Ungültige Auswahl');
 const next={...state,[key]:value};
 if(state[key]!==value)for(const k of selectionKeys.slice(index+1))next[k]='';
 return next;
}
export function validateModule(module){
 if(!module||module.contractVersion!==CONTRACT_VERSION||!module.id||!module.sourceRevision||
    !Array.isArray(module.adapters)||!Array.isArray(module.tasks)||typeof module.handoff!=='function')
  throw new Error('Ungültiger SSC-Modulvertrag');
 return module;
}
export function launchUrl(path,selection,hash=''){
 const query=new URLSearchParams({adapter:selection.adapter,protocol:selection.protocol,task:selection.task});
 return path+'?'+query.toString()+hash;
}
