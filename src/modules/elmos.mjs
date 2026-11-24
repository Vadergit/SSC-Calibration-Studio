// Standalone integration, not a native hardware driver.
export const elmos = Object.freeze({
 id:'elmos', version:'0.1.0', sourceVersion:'0.7.172',
 sourceRevision:'fbd88d422821151b22a440421133a66fb9983c03',
 mode:'standalone',
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
 handoff(task){
  if(!this.tasks.some(t=>t.id===task))return null;
  return {url:task==='bridge'?'https://vadergit.github.io/ELMOS-E703.11-Calibration-Web-App/nvm-rechner.html':'https://vadergit.github.io/ELMOS-E703.11-Calibration-Web-App/',mode:this.mode,selectionTransferred:false};
 }
});
