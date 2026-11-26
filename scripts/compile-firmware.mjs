import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const root=new URL('../',import.meta.url),spec=JSON.parse(readFileSync(new URL('scripts/firmware-matrix.json',root),'utf8'));
const board=process.argv[2],fqbn={esp:'esp32:esp32:esp32c3:CDCOnBoot=cdc',pro16:'SparkFun:avr:promicro:cpu=16MHzatmega32U4',pro8:'SparkFun:avr:promicro:cpu=8MHzatmega32U4'}[board];
if(!fqbn)throw Error('Use esp, pro16 or pro8');
const group=board==='esp'?'esp':'pro';
let failed=[];
for(const [id,sketches] of Object.entries(spec))for(const sketch of sketches[group]){
 const path=resolve('modules',id,'firmware',sketch),out=resolve('build',board,id,sketch);
 if(!existsSync(resolve(path,sketch+'.ino')))throw Error('Missing '+path);
 mkdirSync(out,{recursive:true});
 const args=['compile','--fqbn',fqbn,'--output-dir',out];
 if(id==='elmos')args.push('--libraries',resolve('modules/elmos/firmware/libraries'));
 if(id==='elmos'&&group==='pro')args.push('--build-property','compiler.cpp.extra_flags=-std=gnu++17');
 // The Elmos CDC-only sketch is a diagnostic prototype, not a sensor driver.
 console.log('Compile',id,sketch,board);
 const res=spawnSync('arduino-cli',[...args,path],{stdio:'inherit'});
 if(res.status!==0)failed.push(id+'/'+sketch);
}
if(failed.length){console.error('Failed firmware builds:',failed.join(', '));process.exitCode=1}
