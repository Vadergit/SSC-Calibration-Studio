import assert from 'node:assert/strict';
import {catalog,calibratorUrl} from '../src/model.mjs';
for(const id of ['adi','jhm','melexis','novosense','renesas','ti']){
 const native=(await import('../modules/'+id+'/catalog.mjs')).catalog[0].models;
 const studio=catalog.find(m=>m.id===id).models;
 assert.deepEqual(studio.map(m=>m.id).sort(),native.map(m=>m.id).sort(),id+' catalog drift');
 for(const m of studio)assert.equal(new URL(calibratorUrl(id,m.id),'https://example.org/').searchParams.get('model'),m.id);
}
console.log('All native model catalog IDs match Studio');
