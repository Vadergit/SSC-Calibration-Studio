// Strict, deterministic integration patch. Abort when upstream changes.
export function replaceOnce(text,needle,replacement){
 if(text.split(needle).length!==2)throw Error('Upstream integration anchor missing or ambiguous: '+needle.slice(0,110));
 return text.replace(needle,()=>replacement);
}
export function patchElmos(index,app){
 index=replaceOnce(index,'<title>ELMOS E703.11 – Kalibrierassistent</title>','<title>SSC Calibration Studio · E703.11</title><link rel="stylesheet" href="studio-entry.css"><script src="studio-entry.js"></script>');
 app=replaceOnce(app," const demoEnabled=new URLSearchParams(location.search).get('demo')==='1';"," const demoEnabled=new URLSearchParams(location.search).get('demo')==='1';\n const studioLaunch=window.SSC_STUDIO_LAUNCH;");
 app=replaceOnce(app,"let reconnectSsp3OnUsb=true;","let reconnectSsp3OnUsb=false;");
 app=replaceOnce(app,"let autoReconnectEnabled=lsGet(autoReconnectKey)==='1';","let autoReconnectEnabled=false; // Studio starts disconnected; user may explicitly opt in.");
 app=replaceOnce(app,"$('iface').value=lsGet('elmos8-iface')||'plc';","$('iface').value=studioLaunch?.iface||lsGet('elmos8-iface')||'plc';");
 app=replaceOnce(app,"$('adapterType').value=demoEnabled?'ssp3':lsGet('elmos-adapter-type-v1')||'ssp3';","$('adapterType').value=demoEnabled?'ssp3':studioLaunch?.adapter||lsGet('elmos-adapter-type-v1')||'ssp3';");
 app=replaceOnce(app,"  st.bridgeBoard=isProMicro?'Arduino Pro Micro':'ESP32-C3 SuperMini';","  if(studioLaunch?.adapter==='bridge'&&studioLaunch.board!==(isProMicro?'promicro':'esp32'))throw Error('USB-Bridge stimmt nicht mit der Studio-Auswahl überein. Bitte Adapter trennen und die richtige Hardware auswählen.');\n  st.bridgeBoard=isProMicro?'Arduino Pro Micro':'ESP32-C3 SuperMini';");
 app=replaceOnce(app,"  progress?.update('USB-/COM-Port wird geöffnet');","  if(!demoEnabled&&$('iface').value==='spi'&&!$('expertMode').checked)throw Error('SPI-Testmodus benötigt aktivierte Expertenparameter.');\n  progress?.update('USB-/COM-Port wird geöffnet');");
 app=replaceOnce(app," if(!demoEnabled&&webSerialAvailable())setTimeout(()=>auto().catch(()=>{}),350);"," // Studio requires an explicit USB connection; no auto-open on page load.");
 return {index,app};
}
