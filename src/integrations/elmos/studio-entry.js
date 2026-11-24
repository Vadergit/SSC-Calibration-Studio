/* Studio integration only; all chip operations use the original guarded API. */
(()=>{
 'use strict';
 const q=new URLSearchParams(location.search);
 const adapter=q.get('adapter'),protocol=q.get('protocol'),task=q.get('task');
 const labels={calibration:'Sensor neu abgleichen',verification:'Nachmessung',output:'Ausgang konfigurieren',diagnostics:'Register / NVM / Diagnose',logging:'Test / Logging',archive:'Archiv',bridge:'Sensorbrücken-Rechner',alarms:'Alarme & Fehler'};
 const taskKeys={calibration:'calibration',verification:'verification',output:'output',diagnostics:'inspect',logging:'testlog',archive:'archive',bridge:'nvm',alarms:'alarms'};
 const boards={ssp3:'Original SSP3',esp32:'ESP32-C3 SuperMini',promicro:'Arduino Pro Micro'};
 const iface={onewire:'plc',i2c:'i2c',spi:'spi'};
 const offline=['archive','verification','bridge'];
 const valid=Object.hasOwn(boards,adapter)&&Object.hasOwn(iface,protocol)&&Object.hasOwn(labels,task)&&!(adapter!=='ssp3'&&protocol==='spi');
 const config=valid?Object.freeze({board:adapter,adapter:adapter==='ssp3'?'ssp3':'bridge',iface:iface[protocol],task}):null;
 window.SSC_STUDIO_LAUNCH=config;
 function mount(){
  const api=window.ELMOS_GUIDED_API;
  const bar=document.createElement('section');bar.className='ssc-studio-bar';
  const title=document.createElement('strong');title.textContent='SSC Calibration Studio · Elmos E703.11';bar.append(title);
  const info=document.createElement('span');info.className='ssc-studio-info';info.textContent=config?'Startauswahl: '+boards[adapter]+' · '+protocol.toUpperCase()+' · '+labels[task]:'Lokales Elmos-Modul';bar.append(info);
  const actions=document.createElement('div');actions.className='ssc-studio-actions';bar.append(actions);
  const status=document.createElement('span');status.setAttribute('role','status');status.className='ssc-studio-info';bar.append(status);
  const make=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);actions.append(b);return b};
  let pending=false,started=false;
  const situation=()=>typeof ELMOS_HOME_NAVIGATION!=='undefined'?ELMOS_HOME_NAVIGATION.situation():{critical:true,unfinished:true};
  function safe(){const s=api?.state?.();const n=situation();return !!s&&!pending&&!s.connectionBusy&&!n.critical&&!n.measuring&&!n.unfinished&&!n.recording}
  const back=make('← SSC-Auswahl',()=>{const s=api?.state?.();if(!safe()||s.usbConnected){status.textContent='Zuerst Vorgang abschliessen und USB trennen.';return}location.assign('../../')});
  const connect=make('USB-Port auswählen',async()=>{
   if(!config||!safe()||!api||api.state().usbConnected)return;
   pending=true;status.textContent='Verbindung wird aufgebaut …';refresh();
   try{await api.connectGuided({adapter:config.adapter,iface:config.iface,choosePort:true});status.textContent='Sensor erkannt. Die gewählte Aufgabe ist verfügbar.'}
   catch(e){status.textContent=String(e.message||e)}
   finally{pending=false;refresh()}
  });
  const disconnect=make('USB trennen',()=>{
   if(!safe()||!api.state().usbConnected)return;
   document.getElementById('disconnect')?.click();
  });
  const start=make(config?labels[task]+' starten':'Aufgabe auswählen',()=>{
   if(!config||!api||started||!safe()||(!offline.includes(task)&&!api.state().chip))return;
   if(task==='bridge'&&location.hash==='#nvm-rechner'){started=true;refresh();return}
   const guided=window.ELMOS_GUIDED;
   guided?.open?.();
   const button=document.querySelector('[data-gw-task="'+taskKeys[task]+'"]');
   if(!button||button.disabled){status.textContent='Bitte die Aufgabe in der Elmos-Oberfläche öffnen.';return}
   started=true;button.click();refresh();
  });
  function refresh(){
   const s=api?.state?.();
   const ready=!!s&&!pending;
   const idle=safe();
   back.disabled=!idle||!!s?.usbConnected;
   back.title=back.disabled?'Zuerst laufende Aufgabe abschliessen und USB trennen.':'';
   connect.hidden=!config;
   connect.textContent=offline.includes(task)?'USB verbinden (optional)':'USB-Port auswählen';
   connect.disabled=!ready||!idle||!!s?.usbConnected||!!s?.demo;
   disconnect.hidden=!s?.usbConnected;
   disconnect.disabled=!idle;
   start.hidden=!config||task==='bridge';
   start.disabled=!ready||!idle||started||(!offline.includes(task)&&!s?.chip);
   if(config?.iface==='spi'&&!document.getElementById('expertMode')?.checked&&!s?.usbConnected){connect.disabled=true;status.textContent='SPI-Testmodus: zuerst Expertenparameter aktivieren.'}
   if(!api)status.textContent='Elmos-Initialisierung fehlgeschlagen. Seite neu laden.';
  }
  if(config&&task!=='bridge'&&!window.ELMOS_GUIDED?.isOpen?.())window.ELMOS_GUIDED?.open?.();
  document.body.prepend(bar);refresh();setInterval(refresh,500);
 }
 window.addEventListener('load',()=>setTimeout(mount,0),{once:true});
})();
