import {readFile,writeFile} from 'node:fs/promises';
import {join,relative,dirname,sep} from 'node:path';
export const groups=[
  {
    "canonical": "packages/ui/styles/guided.css",
    "source": "adi/guided.css",
    "targets": [
      "adi/guided.css",
      "elmos/guided.css",
      "jhm/guided.css",
      "melexis/master/guided.css",
      "novosense/guided.css",
      "renesas/guided.css",
      "ti/master-guided.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/interface.css",
    "source": "adi/interface.css",
    "targets": [
      "adi/interface.css",
      "elmos/interface.css",
      "jhm/interface.css",
      "melexis/master/interface.css",
      "novosense/interface.css",
      "renesas/interface.css",
      "ti/master-interface.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/settings-refresh.css",
    "source": "adi/settings-refresh.css",
    "targets": [
      "adi/settings-refresh.css",
      "elmos/settings-refresh.css",
      "melexis/master/settings-refresh.css",
      "novosense/settings-refresh.css",
      "renesas/settings-refresh.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/theme.css",
    "source": "adi/theme.css",
    "targets": [
      "adi/theme.css",
      "elmos/theme.css",
      "jhm/theme.css",
      "melexis/master/theme.css",
      "novosense/theme.css",
      "renesas/theme.css",
      "ti/master-theme.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/archive-photos.css",
    "source": "elmos/archive-photos.css",
    "targets": [
      "elmos/archive-photos.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/calibration-graph.css",
    "source": "elmos/calibration-graph.css",
    "targets": [
      "elmos/calibration-graph.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/classic-compact.css",
    "source": "elmos/classic-compact.css",
    "targets": [
      "elmos/classic-compact.css",
      "melexis/master/classic-compact.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/eeprom-config-overview.css",
    "source": "elmos/eeprom-config-overview.css",
    "targets": [
      "elmos/eeprom-config-overview.css",
      "renesas/eeprom-config-overview.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/nvm-reconstruction.css",
    "source": "elmos/nvm-reconstruction.css",
    "targets": [
      "elmos/nvm-reconstruction.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/verification-guide.css",
    "source": "elmos/verification-guide.css",
    "targets": [
      "elmos/verification-guide.css",
      "melexis/master/verification-guide.css",
      "renesas/verification-guide.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/base-legacy.css",
    "source": "adi/master-base.css",
    "targets": [
      "adi/master-base.css",
      "jhm/master-base.css",
      "novosense/master-base.css"
    ]
  },
  {
    "canonical": "packages/ui/styles/base-current.css",
    "source": "renesas/master-base.css",
    "targets": [
      "renesas/master-base.css",
      "ti/master-base.css",
      "melexis/master/base.css"
    ]
  }
];
export function styleAlias(path,canonical){
 const href=relative(dirname('modules/'+path),canonical).split(sep).join('/');
 return '/* Shared SSC Studio stylesheet. Generated; edit the canonical file. */\n@import url("'+href+'");\n';
}
export async function shareStyles(root,stage){
 for(const g of groups){
  const canonical=join(root,g.canonical);
  const source=await readFile(join(stage,g.source));
  if(/url\s*\(|@import/i.test(source.toString('utf8')))throw Error('Review relative assets before sharing '+g.source);
  for(const path of g.targets){
   const target=join(stage,path),bytes=await readFile(target);
   if(!source.equals(bytes))throw Error('Styles no longer identical: '+path);
  }
  await writeFile(canonical,source);
  for(const path of g.targets)await writeFile(join(stage,path),styleAlias(path,g.canonical));
 }
}
