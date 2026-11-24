import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {renderLauncher} from '../src/render-launcher.mjs';
import {catalog,calibratorUrl} from '../src/model.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.equal(html,renderLauncher(),'Regenerate index.html: node scripts/build-launcher.mjs');
assert.ok(!html.includes('type="module"'));
assert.ok(!html.includes('JavaScript muss aktiviert sein'));
for(const maker of catalog){assert.ok(html.includes(maker.name.replaceAll('&','&amp;')));for(const model of maker.models){assert.ok(html.includes(model.name));const url=calibratorUrl(maker.id,model.id);if(url){assert.ok(html.includes('href="'+url+'"'));assert.ok(existsSync(new URL(url,new URL('../',import.meta.url))))}}}
assert.equal((html.match(/<details /g)||[]).length,catalog.filter(m=>m.id!=='elmos').length);
for(const id of ['calibrators','about','functions','goals','projects'])assert.ok(html.includes('id="'+id+'"'));
assert.ok(html.includes('href="https://github.com/Vadergit/SensorBridge-Emulator"'));
assert.ok(html.includes('href="https://vadergit.github.io/SensorBridge-Emulator/"'));
assert.ok(html.includes('noch nicht validiert'));
assert.ok(html.indexOf('id="calibrators"')<html.indexOf('id="about"'));
console.log('Static no-JavaScript launcher and project overview tests passed');
