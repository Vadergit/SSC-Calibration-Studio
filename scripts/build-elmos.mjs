import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {patchElmos} from './patch-elmos.mjs';
import {elmos} from '../src/modules/elmos.mjs';
const root=resolve(new URL('..',import.meta.url).pathname);
const dir=await mkdtemp(join(tmpdir(),'ssc-elmos-'));
try{
 execFileSync('git',['init','-q',dir]);
 execFileSync('git',['-C',dir,'fetch','--depth=1','https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App.git',elmos.sourceRevision],{stdio:'inherit'});
 execFileSync('git',['-C',dir,'checkout','--detach','FETCH_HEAD'],{stdio:'inherit'});
 if(execFileSync('git',['-C',dir,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==elmos.sourceRevision)throw Error('Elmos revision mismatch');
 const out=join(root,'modules','elmos');
 await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
 await cp(dir,out,{recursive:true,filter:p=>!['.git','.github','tests','scripts','feedback-service','.gitignore'].includes(p.slice(dir.length+1).split('/')[0])});
 const result=patchElmos(await readFile(join(out,'index.html'),'utf8'),await readFile(join(out,'app.js'),'utf8'));
 await writeFile(join(out,'index.html'),result.index);await writeFile(join(out,'app.js'),result.app);
 for(const f of ['studio-entry.js','studio-entry.css'])await cp(join(root,'src','integrations','elmos',f),join(out,f));
 console.log('Packaged Elmos '+elmos.sourceVersion+' at '+elmos.sourceRevision);
}finally{await rm(dir,{recursive:true,force:true})}
