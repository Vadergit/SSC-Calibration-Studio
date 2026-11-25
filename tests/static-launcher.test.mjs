import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderLauncher} from '../src/render-launcher.mjs';
import {catalog,manufacturerUrl} from '../src/model.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.equal(html,renderLauncher(),'Regenerate index.html: node scripts/build-launcher.mjs');
assert.ok(!html.includes('type="module"'));
assert.ok(!html.includes('JavaScript muss aktiviert sein'));
for(const maker of catalog){assert.ok(html.includes(maker.name.replaceAll('&','&amp;')));assert.ok(html.includes('href="'+manufacturerUrl(maker.id)+'"'));for(const model of maker.models)assert.ok(html.includes(model.name));}
assert.equal((html.match(/<details /g)||[]).length,0);
for(const id of ['calibrators','about','functions','goals','projects'])assert.ok(html.includes('id="'+id+'"'));
assert.ok(html.includes('href="https://github.com/Vadergit/SensorBridge-Emulator"'));
assert.ok(html.includes('href="https://vadergit.github.io/SensorBridge-Emulator/"'));
assert.ok(html.includes('noch nicht validiert'));
assert.ok(html.indexOf('id="calibrators"')<html.indexOf('id="about"'));
assert.ok(!html.includes('href="#calibrators"'));
assert.ok(!html.includes('href="#about"'));
assert.ok(html.includes('id="project-title">Projektübersicht'));
assert.ok(html.includes('id="functions-title">Funktionsumfang'));
assert.ok(html.includes('id="goals-title">Entwicklungsziele'));
assert.ok(html.includes('class="signal-chain"'));
assert.equal((html.match(/class="maker-icon"/g)||[]).length,catalog.length);
assert.ok(html.includes('aria-label="Vereinfachte Signalkette: Messbrücke, AFE und ADC, DSP, Sensorausgang"'));
assert.ok(html.includes('class="diagram-heading"'));
assert.ok(html.includes('Prinzipdarstellung'));
assert.ok(html.includes('class="release-dot"'));
for(const path of ['development-roadmap','studio-architecture','firmware-and-hardware'])assert.ok(html.includes('href="./docs/'+path+'.html"'));
assert.ok(!html.includes('href="./docs/development-roadmap.md"'));
const cards=[...html.matchAll(/<a class="choice launcher-choice[^>]+>/g)].map(m=>m[0]);
assert.equal(cards.length,catalog.length);
for(const maker of catalog){const card=cards.find(c=>c.includes('href="'+manufacturerUrl(maker.id)+'"'));assert.ok(card);assert.ok(card.includes('target="_blank"'));assert.ok(card.includes('rel="noopener noreferrer"'));}
assert.ok(html.includes('href="./ssc-favicon.svg"'));
assert.ok(html.includes('href="./ssc-favicon.png"'));
const fullCards=[...html.matchAll(/<a class="choice launcher-choice[^>]*>[\s\S]*?<\/a>/g)].map(m=>m[0]);
assert.equal(fullCards.length,7);
for(const maker of catalog){const card=fullCards.find(c=>c.includes('href="'+manufacturerUrl(maker.id)+'"'));assert.ok(card);assert.ok(card.includes(maker.id==='elmos'?'Beta · funktionsfähig':'In Entwicklung'));assert.ok(card.includes(maker.id==='elmos'?'Noch nicht vollständig geprüft':'Noch nicht einsatzbereit'));assert.ok(card.includes('target="_blank"'));}
console.log('Static launcher, maturity status, favicon and new-tab navigation tests passed');
