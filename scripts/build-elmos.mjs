import {readFile,writeFile,mkdir,cp,rm,rename,mkdtemp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {patchElmos} from './patch-elmos.mjs';
import {elmos} from '../src/modules/elmos.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const dir=await mkdtemp(join(tmpdir(),'ssc-elmos-'));
const upstream=join(dir,'source');
const modules=join(root,'modules');
await mkdir(modules,{recursive:true});
const staging=await mkdtemp(join(modules,'.elmos-staging-'));
const out=join(modules,'elmos');
const backup=staging+'-previous';
let moved=false;
try{
 await mkdir(upstream,{recursive:true});
 execFileSync('git',['init','-q',upstream]);
 execFileSync('git',['-C',upstream,'fetch','--depth=1','https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App.git',elmos.sourceRevision],{stdio:'inherit'});
 execFileSync('git',['-C',upstream,'checkout','--detach','FETCH_HEAD'],{stdio:'inherit'});
 if(execFileSync('git',['-C',upstream,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==elmos.sourceRevision)throw Error('Elmos revision mismatch');
 await cp(upstream,staging,{recursive:true,filter:p=>!['.git','.github','tests','scripts','feedback-service','.gitignore'].includes(relative(upstream,p).split(sep)[0])});
 const result=patchElmos(await readFile(join(staging,'index.html'),'utf8'),await readFile(join(staging,'app.js'),'utf8'));
 await writeFile(join(staging,'index.html'),result.index);await writeFile(join(staging,'app.js'),result.app);
 for(const f of ['studio-entry.js','studio-entry.css'])await cp(join(root,'src','integrations','elmos',f),join(staging,f));
 // Do not touch the previously working snapshot until checkout and patch both succeed.
 try{await rename(out,backup);moved=true}catch(e){if(e.code!=='ENOENT')throw e}
 try{await rename(staging,out)}catch(e){if(moved){await rename(backup,out);moved=false}throw e}
 if(moved){await rm(backup,{recursive:true,force:true});moved=false}
 console.log('Packaged Elmos '+elmos.sourceVersion+' at '+elmos.sourceRevision);
}finally{await rm(dir,{recursive:true,force:true});await rm(staging,{recursive:true,force:true})}
