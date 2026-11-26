import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const matrix=JSON.parse(readFileSync(new URL('scripts/firmware-matrix.json',root),'utf8'));
assert.equal(Object.keys(matrix).length,7);
for(const [id,{esp,pro}] of Object.entries(matrix)){
 assert.ok(esp.length&&pro.length,id);
 const dir=new URL('modules/'+id+'/firmware/',root);
 for(const name of new Set([...esp,...pro]))assert.ok(existsSync(new URL(name+'/'+name+'.ino',dir)),id+'/'+name);
 const all=readdirSync(dir,{withFileTypes:true}).filter(x=>x.isDirectory()&&existsSync(new URL(x.name+'/'+x.name+'.ino',dir))).map(x=>x.name).sort();
 assert.deepEqual([...new Set([...esp,...pro])].sort(),all,id+' firmware coverage');
}
console.log('All integrated sketch directories covered by firmware matrix');

const ti=readFileSync(new URL('modules/ti/firmware/esp32c3_pga300/esp32c3_pga300.ino',root),'utf8');
assert.ok(ti.includes('OWI_TX=4,OWI_RX=5,ACT=6'));
assert.ok(ti.includes('owi.begin(RATE,SERIAL_8N1,OWI_RX,OWI_TX)'));
const jhm=readFileSync(new URL('modules/jhm/firmware/pulse_bridge/pulse_bridge.ino',root),'utf8');
assert.ok(jhm.includes('uint32_t start=micros();bool found=false;'));
assert.ok(jhm.indexOf('struct Config')<jhm.indexOf('static void send(const uint8_t *data,unsigned n,const Config& c);'));
