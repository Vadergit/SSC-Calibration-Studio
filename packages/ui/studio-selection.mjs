export const catalog=[
  {
    "id": "elmos",
    "name": "Elmos",
    "models": [
      {
        "id": "e70311",
        "name": "E703.11"
      }
    ]
  },
  {
    "id": "renesas",
    "name": "Renesas / IDT",
    "models": [
      {
        "id": "zsc31010",
        "name": "ZSC31010"
      },
      {
        "id": "zsc31014",
        "name": "ZSC31014"
      },
      {
        "id": "zsc31015",
        "name": "ZSC31015"
      },
      {
        "id": "zsc31050",
        "name": "ZSC31050"
      },
      {
        "id": "zsc31150",
        "name": "ZSC31150"
      },
      {
        "id": "zssc3154",
        "name": "ZSSC3154"
      },
      {
        "id": "zssc3240",
        "name": "ZSSC3240"
      },
      {
        "id": "zssc3281",
        "name": "ZSSC3281"
      }
    ]
  },
  {
    "id": "novosense",
    "name": "NOVOSENSE",
    "models": [
      {
        "id": "nsa2200",
        "name": "NSA2200"
      },
      {
        "id": "nsa2300",
        "name": "NSA2300"
      },
      {
        "id": "nsa2302",
        "name": "NSA2302"
      },
      {
        "id": "nsa2860(x)",
        "name": "NSA2860"
      },
      {
        "id": "nsa2860x",
        "name": "NSA2860X"
      },
      {
        "id": "nsc2860x",
        "name": "NSC2860X"
      },
      {
        "id": "nsa/nsc9260(x)",
        "name": "NSA/NSC9260(X)"
      },
      {
        "id": "nsc9262",
        "name": "NSC9262"
      },
      {
        "id": "nsc9264",
        "name": "NSC9264"
      }
    ]
  },
  {
    "id": "ti",
    "name": "Texas Instruments",
    "models": [
      {
        "id": "pga300",
        "name": "PGA300"
      },
      {
        "id": "pga302",
        "name": "PGA302"
      },
      {
        "id": "pga305",
        "name": "PGA305"
      },
      {
        "id": "pga309",
        "name": "PGA309"
      }
    ]
  },
  {
    "id": "melexis",
    "name": "Melexis",
    "models": [
      {
        "id": "mlx90328",
        "name": "MLX90328"
      },
      {
        "id": "mlx90329",
        "name": "MLX90329"
      }
    ]
  },
  {
    "id": "adi",
    "name": "Analog Devices / Maxim",
    "models": [
      {
        "id": "max40109",
        "name": "MAX40109"
      },
      {
        "id": "max1454",
        "name": "MAX1454"
      }
    ]
  },
  {
    "id": "jhm",
    "name": "Jiuhao Microelectronics",
    "models": [
      {
        "id": "jhm1101",
        "name": "JHM1101"
      },
      {
        "id": "jhm1102",
        "name": "JHM1102"
      },
      {
        "id": "jhm1103",
        "name": "JHM1103"
      },
      {
        "id": "jhm1102p",
        "name": "JHM1102P"
      },
      {
        "id": "jhm1130",
        "name": "JHM1130"
      },
      {
        "id": "jhm1200",
        "name": "JHM1200"
      },
      {
        "id": "jhm1203",
        "name": "JHM1203"
      },
      {
        "id": "jhm140x",
        "name": "JHM140X"
      },
      {
        "id": "jhm150x",
        "name": "JHM150X"
      },
      {
        "id": "jhm2000",
        "name": "JHM2000"
      },
      {
        "id": "jhm2031c",
        "name": "JHM2031C"
      },
      {
        "id": "jhm2102",
        "name": "JHM2102"
      }
    ]
  }
];
export const selectionKey='ssc-studio-connection-v1';
const b=(id,name)=>({id,name});
const esp=b('esp32','ESP32-C3 SuperMini'),pro=b('promicro','Arduino Pro Micro');
export function boardsFor(m,model){switch(m){
case 'elmos':return [b('ssp3','Original Elmos SSP3'),esp,pro];
case 'renesas':return [b('renesas','Original Renesas / IDT SSC Communication Board'),esp,pro,b('offline','Offline')];
case 'novosense':return [esp,pro,b('evm','Original NSX2860 EVM · lokaler Dienst'),b('cal32','Original NSA2860 CAL32'),b('nsa2302evm','Original NSA2302 EVM · Protokoll offen')];
case 'melexis':return [esp,b('pro-micro','Arduino Pro Micro'),b('host','Original PTC-04 + PRESSURE01 · Windows SDK'),b('manual','Offline')];
case 'ti':return model==='pga300'?[esp,pro,b('evm','Original TI USB2ANY · lokaler Dienst')]:[b('offline','Offline · Treiber in Entwicklung')];
case 'adi':return model==='max40109'?[b('bridge','ESP32-C3 SuperMini'),pro,b('oem','Original MAX40109EVSYS · Protokoll offen'),b('manual','Offline')]:[b('max1454oem','Original MAX1454EVSYS · Protokoll offen'),b('manual','Offline')];
case 'jhm':return [b('esp-pwm','ESP32-C3 · One-Wire'),b('pro-pwm','Pro Micro · One-Wire'),b('i2c','ESP32 / Pro Micro · I²C'),b('native','Original Jiuhao Calibration Board · Diagnose'),b('offline','Offline')];
default:return [];}}
export const protocolsFor=(m,b)=>m==='elmos'?(b==='ssp3'?['onewire','i2c','spi']:['onewire','i2c']):[];
export function normalize(v={}){const m=catalog.find(x=>x.id===v?.manufacturer)||catalog[0],model=m.models.find(x=>x.id===v?.model)||m.models[0],boards=boardsFor(m.id,model.id),board=boards.find(x=>x.id===v?.board)||boards[0],p=protocolsFor(m.id,board.id);return {manufacturer:m.id,model:model.id,board:board.id,protocol:p.includes(v?.protocol)?v.protocol:p[0]||''}}
export function readSelection(storage){try{return normalize(JSON.parse(storage.getItem(selectionKey)))}catch{return normalize()}}
export function saveSelection(storage,s){s=normalize(s);try{storage.setItem(selectionKey,JSON.stringify(s))}catch{}return s}
export function modulePath(s,open=false){s=normalize(s);const q=new URLSearchParams({model:s.model,studioBoard:s.board});if(s.protocol)q.set('studioProtocol',s.protocol);if(open)q.set('studioConnect','1');return 'modules/'+s.manufacturer+'/index.html?'+q}
export function titleFor(s){s=normalize(s);const m=catalog.find(x=>x.id===s.manufacturer);return (m.id==='renesas'?'Renesas':m.id==='jhm'?'Jiuhao':m.name)+' '+m.models.find(x=>x.id===s.model).name}
