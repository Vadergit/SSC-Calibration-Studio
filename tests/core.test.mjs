import assert from 'node:assert/strict';
import {referenceError,verificationSummary} from '../packages/core/measurement.mjs';
import {validateModule} from '../packages/core/index.mjs';
import {elmos} from '../src/modules/elmos.mjs';
assert.equal(validateModule(elmos),elmos);assert.throws(()=>validateModule({id:'bad'}));
assert.deepEqual(referenceError({reference:40,measured:41,minimum:0,maximum:100}),{error:1,errorPercentFS:1});
assert.equal(verificationSummary([{reference:40,measured:41,minimum:0,maximum:100}],0.5).passed,false);
assert.throws(()=>referenceError({reference:0,measured:0,minimum:1,maximum:1}));
console.log('Core contract and reference-error tests passed');
