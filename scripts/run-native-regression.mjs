import {readFileSync,mkdtempSync,mkdirSync,cpSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
const id=process.argv[2],root=resolve('.'),lock=JSON.parse(readFileSync('modules-lock.json','utf8')),suites={
  "elmos": [
    "elmos-calibration.test.cjs",
    "timed-onewire-planning.test.cjs",
    "nvm-preflight.test.cjs",
    "safety.test.cjs",
    "home-navigation.test.cjs",
    "verification-reference.test.cjs",
    "universal-bridge.test.cjs"
  ],
  "renesas": [
    "calibration.test.mjs",
    "hardware.test.mjs",
    "zsc31014-extended-hardware.test.mjs",
    "zsc31014-fixed-point.test.mjs",
    "zsc31015-program.test.mjs"
  ],
  "novosense": [
    "adapters.test.mjs",
    "device.test.mjs",
    "engine.test.mjs",
    "lab.test.mjs"
  ],
  "melexis": [
    "afe.test.mjs",
    "host-client.test.mjs",
    "offline-tools.test.mjs",
    "serial-adapter.test.mjs",
    "temperature.test.mjs"
  ],
  "ti": [
    "pga300-adapters.test.mjs",
    "pga300-hardware.test.mjs",
    "pga300-test-tools.test.mjs",
    "pga300.test.mjs"
  ],
  "adi": [
    "adapter-profile.test.mjs",
    "dsp-candidate.test.mjs",
    "engine.test.mjs",
    "lab-validation.test.mjs",
    "max40109.test.mjs",
    "surface-candidate.test.mjs"
  ],
  "jhm": [
    "calibration.test.mjs",
    "hardware-core.test.mjs",
    "lab-core.test.mjs",
    "pulse-core.test.mjs",
    "temperature.test.mjs"
  ]
};
if(!suites[id]||!lock[id])throw Error('Unknown manufacturer');
const tmp=mkdtempSync(join(tmpdir(),'studio-native-regression-')),dest=join(root,'modules',id,'tests');
if(existsSync(dest))throw Error('Unexpected existing tests directory: '+dest);
try{
 execFileSync('git',['init','-q',tmp],{stdio:'inherit'});
 execFileSync('git',['-C',tmp,'fetch','--depth=1','https://github.com/Vadergit/'+lock[id].repo+'.git',lock[id].sha],{stdio:'inherit'});
 execFileSync('git',['-C',tmp,'checkout','--detach','FETCH_HEAD'],{stdio:'inherit'});
 if(execFileSync('git',['-C',tmp,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==lock[id].sha)throw Error('Pinned source mismatch');
 mkdirSync(dest);
 // Include fixtures and helper files; run only selected regression suites on Studio's actual source.
 cpSync(join(tmp,'tests'),dest,{recursive:true});
 const result=spawnSync(process.execPath,['--test',...suites[id].map(name=>join('tests',name))],{cwd:join(root,'modules',id),stdio:'inherit'});
 if(result.status!==0)process.exitCode=1;
}finally{rmSync(dest,{recursive:true,force:true});rmSync(tmp,{recursive:true,force:true})}
