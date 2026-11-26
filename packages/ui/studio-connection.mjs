import {catalog,normalize,readSelection,saveSelection,boardsFor,protocolsFor,modulePath,titleFor} from './studio-selection.mjs';
const match=location.pathname.match(/^(.*\/)modules\/(elmos|renesas|novosense|ti|melexis|adi|jhm)\//);
if(match)void mount(match[1],match[2]);
async function mount(root,manufacturer){
 const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
 for(let i=0;i<200&&!window.SSC_STUDIO_NATIVE;i++)await new Promise(r=>setTimeout(r,50));
 const native=window.SSC_STUDIO_NATIVE;if(!native)return;
 const saved=readSelection(localStorage),requestedModel=native.model?.()||q.get('model')||(saved.manufacturer===manufacturer?saved.model:'');
 let active=normalize({manufacturer,model:requestedModel,board:q.get('studioBoard')||(saved.manufacturer===manufacturer&&saved.model===requestedModel?saved.board:undefined),protocol:q.get('studioProtocol')||saved.protocol});
 active=saveSelection(localStorage,active);
 const header=document.querySelector('header.top')||document.querySelector('header'),title=header?.querySelector('.brand h1')||header?.querySelector('h1');if(!header||!title)return;
 const style=document.createElement('link');style.rel='stylesheet';style.href=root+'packages/ui/studio-connection.css';document.head.append(style);
 function refreshTitle(){title.textContent=titleFor(active);document.title=titleFor(active)+' · SSC Calibration Studio'}
 refreshTitle();
 const button=document.createElement('button');button.id='studioConnection';button.type='button';button.className='settings-gear ssc-connection-entry';button.textContent='Verbindung';button.setAttribute('aria-haspopup','dialog');(header.querySelector('.connection-actions')||header.querySelector('.live-connection')||header).prepend(button);
 const eyebrow=header.querySelector('.eyebrow');if(eyebrow){const a=document.createElement('a');a.textContent='SSC Calibration Studio · Übersicht';a.href=root+'?overview=1';a.target='_blank';a.rel='noopener noreferrer';a.className='ssc-studio-overview';eyebrow.after(a)}
 const dialog=document.createElement('dialog');dialog.id='studioConnectionDialog';dialog.className='ssc-choice-dialog';dialog.setAttribute('aria-labelledby','studioConnectionTitle');dialog.innerHTML='<h2 id="studioConnectionTitle">Verbindung</h2><p>Hersteller, SSC-Typ und Communication Board auswählen.</p><div class="ssc-choice-fields"><label>Hersteller<select id="studioManufacturer"></select></label><label>SSC-Typ<select id="studioSSC"></select></label><label>Communication Board<select id="studioBoard"></select></label><label id="studioProtocolField">Chip-Schnittstelle<select id="studioProtocol"></select></label></div><p id="studioConnectionStatus" class="ssc-choice-status" role="status"></p><div class="ssc-choice-actions"><button type="button" id="studioCancel">Abbrechen</button><button type="button" class="primary" id="studioApply">Weiter zur Verbindung</button></div>';document.body.append(dialog);
 const maker=$('studioManufacturer'),model=$('studioSSC'),board=$('studioBoard'),protocol=$('studioProtocol'),status=$('studioConnectionStatus');let draft=active;
 const fill=(el,options,value)=>{el.replaceChildren(...options.map(o=>new Option(o.name,o.id)));el.value=value};
 const render=()=>{fill(maker,catalog,draft.manufacturer);fill(model,catalog.find(m=>m.id===draft.manufacturer).models,draft.model);fill(board,boardsFor(draft.manufacturer,draft.model),draft.board);const p=protocolsFor(draft.manufacturer,draft.board);fill(protocol,p.map(id=>({id,name:{onewire:'1-Wire / PLC',i2c:'I²C',spi:'SPI · Expertenmodus'}[id]})),draft.protocol);$('studioProtocolField').hidden=!p.length;status.textContent=''};
 maker.onchange=()=>{draft=normalize({manufacturer:maker.value});render()};model.onchange=()=>{draft=normalize({...draft,model:model.value});render()};board.onchange=()=>{draft=normalize({...draft,board:board.value});render()};protocol.onchange=()=>{draft=normalize({...draft,protocol:protocol.value});render()};
 button.onclick=()=>{draft={...active};render();dialog.showModal()};$('studioCancel').onclick=()=>dialog.close();
 const openNative=()=>{try{native.open?.(active)}catch(e){status.textContent=e.message;dialog.showModal()}};
 $('studioApply').onclick=()=>{const changed=JSON.stringify(draft)!==JSON.stringify(active);if(changed){if(!native.canSwitch?.()){status.textContent='Bitte laufende Hardwareoperation abschliessen und den Adapter zuerst trennen.';return}if(native.hasDraft?.()&&!confirm('SSC wechseln? Nicht gespeicherte Messdaten können verloren gehen.'))return;saveSelection(localStorage,draft);dialog.close();location.assign(root+modulePath(draft,true));return}dialog.close();openNative()};
 // Native selection changes remain reflected in the common title and persistent selection.
 document.addEventListener('change',e=>{if(dialog.contains(e.target))return;if(['model','adapter','gwConnectionAdapter','gwConnectionInterface'].includes(e.target.id))queueMicrotask(()=>{let b=native.board?.()||active.board;if(manufacturer==='elmos'&&b==='bridge')b=['esp32','promicro'].includes(active.board)?active.board:'esp32';active=saveSelection(localStorage,{manufacturer,model:native.model?.()||active.model,board:b,protocol:native.protocol?.()||active.protocol});const url=new URL(location.href);url.searchParams.set('model',active.model);url.searchParams.set('studioBoard',active.board);if(active.protocol)url.searchParams.set('studioProtocol',active.protocol);else url.searchParams.delete('studioProtocol');history.replaceState(null,'',url);refreshTitle()})});
 native.prepare?.(active);
 if(q.get('studioConnect')==='1'){openNative();q.delete('studioConnect');history.replaceState(null,'',location.pathname+(q.size?'?'+q:'')+location.hash)}
}
