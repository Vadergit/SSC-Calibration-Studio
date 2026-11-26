import assert from 'node:assert/strict';
import {catalog,calibratorUrl,manufacturerUrl} from '../src/model.mjs';
assert.equal(manufacturerUrl('elmos'),'./modules/elmos/index.html');
assert.equal(calibratorUrl('elmos','e70311'),'./modules/elmos/index.html');
assert.equal(calibratorUrl('elmos','wrong'),null);
assert.equal(calibratorUrl('renesas','zsc31015'),'./modules/renesas/index.html?model=zsc31015');
assert.equal(manufacturerUrl('unknown'),null);
for(const m of catalog){assert.equal(manufacturerUrl(m.id),'./modules/'+m.id+'/index.html');for(const c of m.models)if(m.id!=='elmos'){const u=new URL(calibratorUrl(m.id,c.id),'https://vadergit.github.io/SSC-Calibration-Studio/');assert.equal(u.pathname,'/SSC-Calibration-Studio/modules/'+m.id+'/index.html');assert.equal(u.searchParams.get('model'),c.id)}}
console.log('Pinned Studio launcher route tests passed');
