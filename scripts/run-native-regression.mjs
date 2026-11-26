import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,cpSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
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
 if(id==='elmos'){
  console.log('Baseline: unchanged pinned Elmos source and original regression tests');
  const baseline=spawnSync(process.execPath,['--test',...suites[id].map(name=>join('tests',name))],{cwd:tmp,stdio:'inherit'});
  console.log('Unchanged pinned Elmos baseline exit status:',baseline.status);
  if(baseline.status!==0)process.exitCode=1;
 }
 mkdirSync(dest);
 // Include fixtures and helper files; run only selected regression suites on Studio's actual source.
 cpSync(join(tmp,'tests'),dest,{recursive:true});
 if(id==='elmos'){
  // Only adjust source-location assertions for the documented Studio packaging.
  // Keep all functional and safety assertions unchanged; also run the untouched upstream suite above.
  const file=join(dest,'safety.test.cjs');
  let test=readFileSync(file,'utf8');
  const original="const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');";
  const replacement=`const read=file=>{
   const location=path.join(__dirname,'..',file);
   const source=fs.readFileSync(location,'utf8');
   if(!file.endsWith('.css'))return source;
   const match=/^@import url\\("([^"]+)"\\);/m.exec(source);
   if(!match)return source;
   const canonical=path.resolve(path.dirname(location),match[1]);
   assert.ok(canonical.startsWith(path.resolve(__dirname,'../../../packages/ui/styles')+path.sep),'CSS must resolve to shared UI styles');
   return fs.readFileSync(canonical,'utf8');
  };`;
  if(!test.includes(original))throw Error('Upstream CSS assertion adapter needs review');
  test=test.replace(original,replacement);
  const oldPattern=String.raw`/guided\.css\?v=0\.7\.\d+/`;
  const newPattern=String.raw`/packages\/ui\/styles\/guided\.css\?v=0\.1\.0/`;
  if(!test.includes(oldPattern))throw Error('Upstream CSS version assertion adapter needs review');
  test=test.split(oldPattern).join(newPattern);
  writeFileSync(file,test);
  // Original release workflow is a test fixture, not a Studio workflow.
  const fixture=join(root,'modules',id,'.github','workflows','esp32-c3-release.yml');
  if(existsSync(dirname(dirname(fixture))))throw Error('Unexpected nested .github directory');
  mkdirSync(dirname(fixture),{recursive:true});cpSync(join(tmp,'.github','workflows','esp32-c3-release.yml'),fixture);
 }
 console.log('Integrated Studio source regression');
 const result=spawnSync(process.execPath,['--test',...suites[id].map(name=>join('tests',name))],{cwd:join(root,'modules',id),stdio:'inherit'});
 if(result.status!==0)process.exitCode=1;
}finally{if(id==='elmos')rmSync(join(root,'modules',id,'.github'),{recursive:true,force:true});rmSync(dest,{recursive:true,force:true});rmSync(tmp,{recursive:true,force:true})}
