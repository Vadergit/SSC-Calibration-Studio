export const sensorConnected=s=>!s.sensorLost&&!s.adapterFault&&!!(s.chip||s.raw||s.output);
export const requiresSensor=task=>['calibration','alarms','output','testlog'].includes(task);
export function connectionState(s={},model='SSC',demo=false){
 const connected=sensorConnected(s);
 const header=s.adapterFault?'USB-Adapter antwortet nicht':s.sensorLost?'Sensor nicht verbunden':s.chip?'SSC · Command Mode':s.raw?'SSC · Raw Mode':s.output?'SSC · Normalbetrieb':s.port?'USB verbunden · Sensor nicht erkannt':demo?'Demo':'USB nicht verbunden';
 const sensor=connected?model+' verbunden':model+' nicht erkannt';
 const guidance=connected?'Für den Sensorbrücken-Rechner und das Archiv ist keine Sensorverbindung erforderlich.':(s.port?(s.adapterFault?'USB-Kommunikation unterbrochen. USB-Port neu öffnen. ':s.sensorLost?'Sensor-Kommunikation unterbrochen. Sensor neu initialisieren. ':'USB-Adapter verbunden, Sensor noch nicht erkannt. Prüfe die Verbindung & Diagnose. '):'Noch kein USB-Adapter verbunden. ')+'Für den Sensorbrücken-Rechner und das Archiv ist keine Sensorverbindung erforderlich. Für den geführten Sensorabgleich muss zuerst der Chip über USB erkannt werden.';
 return {connected,header,sensor,guidance,live:s.chip?'Command Mode · Live-Messung pausiert':!connected?'Sensor nicht verbunden · Keine Messwerte':'Keine bestätigte Live-Messung'};
}
