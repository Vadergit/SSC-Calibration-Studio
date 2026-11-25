import assert from 'node:assert/strict';
import live from '../src/app-version-live.js';
import {appVersions} from '../src/app-versions.mjs';
const examples={elmos:'<body data-app-version="0.7.173">',renesas:"model.name+' · Renesas / IDT · v0.6.1'",novosense:'NOVOSENSE · SSC · v0.5.0',ti:'PGA300 · Texas Instruments · v0.4.1',melexis:'MELEXIS · SSC · v0.6.0-beta.1',adi:'MAX40109 · SSC · v0.7.0',jhm:'0.7.0-lab\n'};
for(const [id,v] of Object.entries(appVersions)){assert.equal(live.parseVersion(examples[id],id),v.version);assert.ok(live.valid(v))}
assert.equal(live.parseVersion('firmware v9.0.0','elmos'),null);
assert.equal(live.relative('2026-11-25T10:00:00Z',Date.parse('2026-11-25T12:00:00Z')),'vor 2 Stunden');
assert.equal(live.relative('2026-11-25T12:01:01Z',Date.parse('2026-11-25T12:00:00Z')),'Zeitstempel prüfen');
console.log('Version metadata parsers and relative timestamps passed');
