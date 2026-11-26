import assert from 'node:assert/strict';
import {fit} from '../packages/core/calibration.mjs';
import {patchStudioFile} from '../scripts/patch-studio-module.mjs';
import {readFileSync} from 'node:fs';
const ids=['adi','jhm','melexis','novosense','ti'];
for (const id of ids) {
 const module=await import('../modules/'+id+'/calibration.mjs');
 assert.equal(module.fit,fit,id+' uses shared implementation');
 assert.equal(patchStudioFile(id,'calibration.mjs',readFileSync(new URL('../packages/core/calibration.mjs',import.meta.url),'utf8')),readFileSync(new URL('../modules/'+id+'/calibration.mjs',import.meta.url),'utf8'));
 assert.throws(()=>patchStudioFile(id,'calibration.mjs','changed'),/implementation changed/);
}
const cases=[
 [{raw:0,reference:5},{raw:10,reference:25}],
 [{raw:-10,reference:25},{raw:0,reference:5},{raw:10,reference:-15}]
];
assert.deepEqual(fit(cases[0]),{gain:2,offset:5,residuals:[0,0]});
assert.deepEqual(fit(cases[1]),{gain:-2,offset:5,residuals:[0,0,0]});
assert.throws(()=>fit([]));
assert.throws(()=>fit([{raw:1,reference:2},{raw:1,reference:3}]));
assert.throws(()=>fit([{raw:NaN,reference:2},{raw:1,reference:3}]));
assert.equal(patchStudioFile('renesas','calibration.mjs','native code'),'native code');
console.log('Shared calibration fit, snapshot reproducibility and native driver isolation passed');
