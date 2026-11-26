import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {groups,styleAlias} from '../scripts/share-styles.mjs';
const root=new URL('../',import.meta.url);
for(const g of groups){
 const canonical=readFileSync(new URL(g.canonical,root),'utf8');
 assert.ok(canonical.length>100);
 assert.ok(!/url\s*\(|@import/i.test(canonical));
 for(const p of g.targets)assert.equal(readFileSync(new URL('modules/'+p,root),'utf8'),styleAlias(p,g.canonical),p);
}
console.log('Shared CSS aliases and canonical sources passed');
