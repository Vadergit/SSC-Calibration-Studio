import assert from 'node:assert/strict';
import {createArchiveSession} from '../modules/renesas/archive-session.mjs';
const entries=[];const s=createArchiveSession({id:()=> 'test',append:e=>entries.push(structuredClone(e)),now:()=> '2026-11-26T14:00:00Z'});
s.begin('calibration','zsc31014',{adapter:'renesas'});s.capture('eeprom-write-request',{before:[1],target:[2]});s.capture('calibration-point',{value:10});s.capture('calibration-point',{value:11});
for(let i=0;i<2100;i++)s.event('test');
assert.equal(s.snapshot('zsc31014','calibration').journalId,'test');assert.equal(entries.filter(e=>e.kind==='event').length,2100);assert.equal(entries.filter(e=>e.kind==='calibration-point').length,2);s.clear();assert.equal(entries.at(-1).kind,'end');
