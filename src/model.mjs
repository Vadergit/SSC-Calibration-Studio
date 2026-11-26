import {modules} from './modules/index.mjs';
import {emptySelection,changeSelection} from '../packages/core/index.mjs';
export const catalog = [
  {
    "id": "elmos",
    "name": "Elmos",
    "models": [
      {
        "id": "e70311",
        "name": "E703.11",
        "module": "elmos",
        "docs": "elmos.md"
      }
    ]
  },
  {
    "id": "renesas",
    "name": "Renesas / IDT",
    "models": [
      {
        "id": "zsc31010",
        "name": "ZSC31010",
        "protocols": [
          "zacwire"
        ]
      },
      {
        "id": "zsc31014",
        "name": "ZSC31014",
        "protocols": [
          "i2c"
        ]
      },
      {
        "id": "zsc31015",
        "name": "ZSC31015",
        "protocols": [
          "zacwire"
        ]
      },
      {
        "id": "zsc31050",
        "name": "ZSC31050",
        "protocols": [
          "zacwire",
          "i2c",
          "spi"
        ]
      },
      {
        "id": "zsc31150",
        "name": "ZSC31150",
        "protocols": [
          "zacwire",
          "i2c"
        ]
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
        "name": "NSA2860(X)"
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
        "id": "jhm1101–1103",
        "name": "JHM1101–1103"
      },
      {
        "id": "jhm1200/1203",
        "name": "JHM1200/1203"
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
        "id": "jhm2102",
        "name": "JHM2102"
      }
    ]
  }
];
export const adapters = {
  "ssp3": "Original · Elmos SSP3",
  "sscCb": "Original · Renesas SSC-CB (Kandidat)",
  "original": "Original · Herstellerboard (noch zu bestimmen)",
  "esp32": "DIY · ESP32-C3 SuperMini",
  "promicro": "DIY · Arduino Pro Micro"
};
export const protocols = {
  "onewire": "Elmos 1-Wire / PLC",
  "i2c": "I²C",
  "spi": "SPI",
  "zacwire": "ZACwire / OWI",
  "unknown": "Noch zu klären"
};
export const tasks = [...new Map(Object.values(modules).flatMap(m=>m.tasks).map(t=>[t.id,t])).values()];
export function modelsFor(id){return catalog.find(x=>x.id===id)?.models??[]}
export function modelFor(s){return modelsFor(s.manufacturer).find(x=>x.id===s.model)}
export function adaptersFor(s){const m=modelFor(s);if(!m)return [];return modules[m.module]?.adapters??[{id:s.manufacturer==="renesas"?"sscCb":"original",protocols:m.protocols??["unknown"]},{id:"esp32",protocols:m.protocols??["unknown"]},{id:"promicro",protocols:m.protocols??["unknown"]}]}
export function protocolsFor(s){return adaptersFor(s).find(x=>x.id===s.adapter)?.protocols??[]}
export function isComplete(s){return protocolsFor(s).includes(s.protocol)}
export function tasksFor(s){return isComplete(s)?(modules[modelFor(s)?.module]?.tasks??[]):[]}
export function initial(){return emptySelection()}
export function select(s,key,value){const allowed={manufacturer:()=>catalog.map(x=>x.id),model:()=>modelsFor(s.manufacturer).map(x=>x.id),adapter:()=>adaptersFor(s).map(x=>x.id),protocol:()=>protocolsFor(s),task:()=>tasksFor(s).map(x=>x.id)};return changeSelection(s,key,value,allowed[key]?.()??[])}
export function handoff(s){if(!tasksFor(s).some(x=>x.id===s.task))return null;return modules[modelFor(s).module].handoff(s)}

const simulationRepositories = {
 "renesas": "Renesas-IDT-SSC-Calibration-Web-App",
 "novosense": "NOVOSENSE-SSC-Calibration-Web-App",
 "ti": "Texas-Instruments-SSC-Calibration-Web-App",
 "melexis": "Melexis-SSC-Calibration-Web-App",
 "adi": "Analog-Devices-Maxim-SSC-Calibration-Web-App",
 "jhm": "Jiuhao-SSC-Calibration-Web-App"
};

// Launcher routes depend only on the SSC, never on hardware or task selection.
export function calibratorUrl(manufacturer,model){
 const entry=modelsFor(manufacturer).find(m=>m.id===model);
 const module=entry?.module?modules[entry.module]:null;
 if (module?.entryUrl) return module.entryUrl;
 const repository = simulationRepositories[manufacturer];
 if (!entry || !repository) return null;
 return './modules/'+manufacturer+'/index.html?'+new URLSearchParams({model:entry.id}).toString();
}
export function manufacturerUrl(manufacturer){
 if(manufacturer==='elmos')return './modules/elmos/index.html';
 const repository=Object.hasOwn(simulationRepositories,manufacturer)?simulationRepositories[manufacturer]:null;
 return repository?'./modules/'+manufacturer+'/index.html':null;
}
