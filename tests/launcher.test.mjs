import assert from 'node:assert/strict';
import {catalog,calibratorUrl,manufacturerUrl} from '../src/model.mjs';
assert.equal(manufacturerUrl('elmos'),'./modules/elmos/index.html');
assert.equal(calibratorUrl('elmos','e70311'),'./modules/elmos/index.html');
assert.equal(calibratorUrl('elmos','wrong'),null);
assert.equal(calibratorUrl('renesas','zsc31015'),'https://vadergit.github.io/Renesas-IDT-SSC-Calibration-Web-App/?model=zsc31015');
assert.equal(manufacturerUrl('renesas'),null);
assert.equal(manufacturerUrl('unknown'),null);
const apps = new Set();
for(const m of catalog)for(const c of m.models)if(m.id!=='elmos'){
 const url=new URL(calibratorUrl(m.id,c.id));
 assert.equal(url.origin,'https://vadergit.github.io');
 assert.equal(url.searchParams.get('model'),c.id);
 apps.add(url.pathname);
}
assert.equal(apps.size,6);
assert.ok(!manufacturerUrl('elmos').includes('?'));
console.log('Direct launcher route tests passed');
