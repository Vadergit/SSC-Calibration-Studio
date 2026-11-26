// Integration transformations are strict and only affect Studio copies.
import {patchElmos,replaceOnce} from './patch-elmos.mjs';
export const commonStyles=['guided.css','interface.css','theme.css','settings-refresh.css','verification-guide.css','classic-compact.css','eeprom-config-overview.css','nvm-reconstruction.css','calibration-graph.css','archive-photos.css'];
const settings="const studioSettings=window.SSC_UI.installSettingsPanel({panel:$('settingsPanel'),trigger:$('settingsOpen')});";
export function patchStudioFile(id,path,content){
 // Identical generic reference fit is shared; native coefficient algorithms remain local.
 if(path==='calibration.mjs'&&['adi','jhm','melexis','novosense','ti'].includes(id)){
  const expected="export function fit(points) {\n  if (points.length < 2 || points.some(({raw, reference}) =>\n    !Number.isFinite(raw) || !Number.isFinite(reference))) {\n    throw new Error('Mindestens zwei vollständige, endliche Messpunkte sind erforderlich.');\n  }\n  const mean = key => points.reduce((sum, point) => sum + point[key], 0) / points.length;\n  const x = mean('raw');\n  const y = mean('reference');\n  const variance = points.reduce((sum, point) => sum + (point.raw - x) ** 2, 0);\n  if (!variance) throw new Error('Die Rohwerte müssen sich unterscheiden.');\n  if (!Number.isFinite(variance)) throw new Error(\"Die Rohwerte liegen ausserhalb des unterstützten Bereichs.\");\n  const gain = points.reduce((sum, point) =>\n    sum + (point.raw - x) * (point.reference - y), 0) / variance;\n  const offset = y - gain * x;\n  const residuals = points.map(({raw, reference}) => raw * gain + offset - reference);\n  if (![gain, offset, ...residuals].every(Number.isFinite)) {\n    throw new Error('Die Zahlen liegen ausserhalb des unterstützten Bereichs.');\n  }\n  return {gain, offset, residuals};\n}\n";
  if(content!==expected)throw Error('Generic calibration implementation changed: '+id);
  return "export {fit} from '../../packages/core/calibration.mjs';\n";
 }
 if(path==='index.html'||(id==='novosense'&&['classic.html','guided.html'].includes(path))){
  if(id==='ti'&&!content.includes('</head>'))content=replaceOnce(content,'<link rel="stylesheet" href="./style.css">','<link rel="stylesheet" href="./style.css"><script src="../../packages/ui/settings.js?v=0.1.0"></script>');else content=replaceOnce(content,'</head>','<script src="../../packages/ui/settings.js?v=0.1.0"></script></head>');
  content=content.replace(/href="(?:\.\/|master\/)?(guided|interface|theme|settings-refresh|verification-guide|classic-compact|eeprom-config-overview|nvm-reconstruction|calibration-graph|archive-photos)\.css(?:\?[^"]*)?"/g,(_,name)=>'href="../../packages/ui/styles/'+name+'.css?v=0.1.0"');
  if(id==='adi'){content=replaceOnce(content,'<dialog id="settingsDialog" aria-labelledby="settingsTitle">','<section class="settings-panel" id="settingsDialog" hidden aria-labelledby="settingsTitle">');content=replaceOnce(content,'</dialog><script type="module" src="./app.mjs">','</section><script type="module" src="./app.mjs">');}
 }
 if(id==='renesas'&&path==='ui-settings.mjs')content="export const installSettingsPanel=window.SSC_UI.installSettingsPanel;\n";
 if((id==='melexis'||id==='jhm')&&path==='app.mjs'||id==='ti'&&path==='pga300.mjs'){
  content=replaceOnce(content,"$('settingsOpen').onclick=()=>{$('settingsPanel').hidden=!$('settingsPanel').hidden;$('settingsOpen').setAttribute('aria-expanded',String(!$('settingsPanel').hidden))};",settings);
  if(content.includes("$('settingsClose').onclick=()=>{$('settingsPanel').hidden=true;$('settingsOpen').setAttribute('aria-expanded','false')};"))content=replaceOnce(content,"$('settingsClose').onclick=()=>{$('settingsPanel').hidden=true;$('settingsOpen').setAttribute('aria-expanded','false')};","$('settingsClose').onclick=()=>studioSettings.close();");
  if(id==='ti')content=replaceOnce(content,"link.href='./'+name;","link.href=['master-guided.css','master-interface.css','master-theme.css'].includes(name)?'../../packages/ui/styles/'+name.replace('master-','')+'?v=0.1.0':'./'+name;");
 }
 if(id==='novosense'&&path==='novosense.mjs')content=replaceOnce(content,"$('settingsOpen').onclick=()=>{const p=$('settingsPanel');p.hidden=!p.hidden;$('settingsOpen').setAttribute('aria-expanded',String(!p.hidden))};",settings);
 if(id==='adi'&&path==='app.mjs')content=replaceOnce(content,"$('settingsOpen').onclick=()=>{$('themeSelect').value=document.documentElement.dataset.theme||'light';$('settingsDialog').showModal()};$('settingsClose').onclick=()=>$('settingsDialog').close();","window.SSC_UI.installSettingsPanel({panel:$('settingsDialog'),trigger:$('settingsOpen'),closeButton:$('settingsClose'),onOpen:()=>{$('themeSelect').value=document.documentElement.dataset.theme||'light'}});");
 if(id==='elmos'&&path==='app.js'){
  const start=content.indexOf(' function toggleSettings(open){'),end=content.indexOf(' function openNvmCalculator(){',start);
  if(start<0||end<0||!content.slice(start,end).includes('Dismiss settings on any outside click'))throw Error('Elmos settings anchor changed');
  content=content.slice(0,start)+" const studioSettings=window.SSC_UI.installSettingsPanel({panel:$('settingsPanel'),trigger:$('settingsOpen'),onOpen:()=>{$('settingsSampleCount').value=$('calSampleCount').value;void window.ELMOS_ARCHIVE?.refreshFolderSettings?.()}});\n function toggleSettings(open){if(open)studioSettings.open();else studioSettings.close()}\n"+content.slice(end);
 }
 return content;
}
export function integrateElmos(index,app){const result=patchElmos(index,app);return {index:patchStudioFile('elmos','index.html',result.index),app:patchStudioFile('elmos','app.js',result.app)}}
