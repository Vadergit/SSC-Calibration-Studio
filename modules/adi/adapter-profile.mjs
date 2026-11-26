export const adapters={
 manual:{name:'Manuell / offline',ready:false,board:'',pins:''},
 bridge:{name:'ESP32-C3 SuperMini',ready:true,board:'ESP32C3',pins:'SDA GPIO4 · SCL GPIO5 · DQ GPIO6'},
 promicro:{name:'Arduino Pro Micro',ready:true,board:'PROMICRO',pins:'SDA D2 · SCL D3 · DQ D4'},
 oem:{name:'MAX40109EVSYS / MAX32666FTHR',ready:false,board:'',pins:''},
 max1454oem:{name:'MAX1454EVSYS',ready:false,board:'',pins:''}
};
export function verifyAdapter(s,choice){let m=/^OK INFO (ESP32C3|PROMICRO) 5 I2C,ROM,RAM,MTP,SHADOW$/.exec(s);if(!m)throw Error('Unbekannte Firmware');if(!adapters[choice]?.ready||m[1]!==adapters[choice].board)throw Error('Adapter stimmt nicht mit Auswahl überein: '+m[1]);return {board:m[1],protocol:5};}
