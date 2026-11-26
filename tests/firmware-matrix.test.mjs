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
