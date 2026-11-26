import assert from 'node:assert/strict';
import {createArchiveSession} from '../modules/renesas/archive-session.mjs';
let t='2026-11-26T14:00:00Z';const s=createArchiveSession({now:()=>t});
s.begin('calibration','zsc31014',{adapter:'renesas',adapterFirmware:'confirmed firmware'});
s.metadata('other',{adapter:'wrong'});s.event('write failed','error');s.event('retry','info');t='2026-11-26T14:02:00Z';
const r=s.snapshot('zsc31014','calibration');assert.equal(r.adapter,'renesas');assert.equal(r.errors,1);assert.equal(r.events.length,2);assert.equal(r.startedAt,'2026-11-26T14:00:00Z');assert.equal(r.endedAt,t);assert.deepEqual(s.snapshot('other','calibration'),{});
s.clear();assert.deepEqual(s.snapshot('zsc31014','calibration'),{});
