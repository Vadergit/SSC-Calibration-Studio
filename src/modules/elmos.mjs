import {launchUrl} from '../../packages/core/index.mjs';
// Versioned local-page integration; upstream calibration engine remains intact.
export const elmos = Object.freeze({
 id:'elmos', version:'0.2.0', contractVersion:1, sourceVersion:'0.7.172',
 sourceRevision:'fbd88d422821151b22a440421133a66fb9983c03',
 mode:'local-page',
 adapters:[
  {
    "id": "ssp3",
    "protocols": [
      "onewire",
      "i2c",
      "spi"
    ]
  },
  {
    "id": "esp32",
    "protocols": [
      "onewire",
      "i2c"
    ]
  },
  {
    "id": "promicro",
    "protocols": [
      "onewire",
      "i2c"
    ]
  }
],
 tasks:[
  {
    "id": "calibration",
    "name": "Sensor neu abgleichen",
    "desc": "Druckpunkte, Temperatur, AFE und Koeffizienten"
  },
  {
    "id": "verification",
    "name": "Nachmessung",
    "desc": "Kennlinie, Abweichung, Hysterese und Temperatur"
  },
  {
    "id": "output",
    "name": "Ausgang konfigurieren",
    "desc": "Ausgangsart, Skalierung und Begrenzungen"
  },
  {
    "id": "diagnostics",
    "name": "Register / NVM / Diagnose",
    "desc": "Konfiguration lesen und prüfen"
  },
  {
    "id": "logging",
    "name": "Test / Logging",
    "desc": "Messdaten aufnehmen und exportieren"
  },
  {
    "id": "archive",
    "name": "Archiv",
    "desc": "Frühere Abgleiche und Messungen"
  },
  {
    "id": "bridge",
    "name": "Sensorbrücken-Rechner",
    "desc": "Nullpunkt, Spanne und Temperaturgang"
  },
  {
    "id": "alarms",
    "name": "Alarme & Fehler",
    "desc": "Fehlerreaktionen und Alarmgrenzen"
  }
],
 handoff(selection){
  if(!this.tasks.some(t=>t.id===selection.task)||!this.adapters.some(a=>a.id===selection.adapter&&a.protocols.includes(selection.protocol)))return null;
  return {url:launchUrl('./modules/elmos/index.html',selection,selection.task==='bridge'?'#nvm-rechner':''),mode:this.mode,selectionTransferred:true};
 }
});
