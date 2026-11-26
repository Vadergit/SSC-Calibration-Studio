import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const paths={"elmos":{"key":"elmos-ui-theme-v1","files":["index.html","app.js"]},"renesas":{"key":"renesas-theme","files":["index.html","app.mjs"]},"melexis":{"key":"mlx-theme","files":["index.html","app.mjs"]},"adi":{"key":"adi-theme","files":["index.html","app.mjs"]},"jhm":{"key":"jhm-theme","files":["index.html","app.mjs"]},"novosense":{"key":"novo-theme","files":["index.html","classic.html","guided.html","novosense.mjs"]},"ti":{"key":"ti-theme","files":["pga300.mjs"]}};
for(const [id,{key,files}] of Object.entries(paths))for(const file of files){
 const c=readFileSync(new URL('../modules/'+id+'/'+file,import.meta.url),'utf8');
 assert.ok(c.includes('ssc-studio-theme-v1'),id+'/'+file);
 assert.ok(!c.includes(key),id+'/'+file);
}
console.log('All seven integrated manufacturers use the same theme preference');
