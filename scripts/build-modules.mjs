import {readFile,writeFile,mkdir,cp,rm,mkdtemp,readdir,rename} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {patchStudioFile,integrateElmos,commonStyles} from './patch-studio-module.mjs';
import {patchFirmware} from './patch-firmware.mjs';
import {patchNativeHost} from './patch-native-host.mjs';
import {shareStyles} from './share-styles.mjs';
const root=fileURLToPath(new URL('..',import.meta.url)),manifest=JSON.parse(await readFile(join(root,'modules-lock.json'),'utf8'));
const tmp=await mkdtemp(join(tmpdir(),'ssc-studio-'));
async function checkout(id,m){
 const p=join(tmp,id);await mkdir(p,{recursive:true});execFileSync('git',['init','-q',p]);execFileSync('git',['-C',p,'fetch','--depth=1','https://github.com/Vadergit/'+m.repo+'.git',m.sha],{stdio:'inherit'});execFileSync('git',['-C',p,'checkout','--detach','FETCH_HEAD'],{stdio:'inherit'});
 if(execFileSync('git',['-C',p,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==m.sha)throw Error('Revision mismatch '+id);return p;
}
async function walk(p,fn){for(const d of await readdir(p,{withFileTypes:true})){const f=join(p,d.name);if(d.isDirectory())await walk(f,fn);else await fn(f)}}
try{
 const stage=join(tmp,'stage');await mkdir(stage);
 for(const [id,m] of Object.entries(manifest)){
  const source=await checkout(id,m),out=join(stage,id);
  await cp(source,out,{recursive:true,filter:p=>!['.git','.github','tests','scripts','feedback-service','.gitignore'].includes(relative(source,p).split(sep)[0])});
  if(id==='elmos'){
   const v=integrateElmos(await readFile(join(out,'index.html'),'utf8'),await readFile(join(out,'app.js'),'utf8'));
   await writeFile(join(out,'index.html'),v.index);await writeFile(join(out,'app.js'),v.app);
   for(const file of ['studio-entry.js','studio-entry.css'])await cp(join(root,'src','integrations','elmos',file),join(out,file));
  }
  await walk(out,async p=>{const path=relative(out,p).split(sep).join('/');if(id==='elmos'&&['index.html','app.js'].includes(path))return;if(!/\.(?:m?js|html|py|ino)$/.test(path))return;const old=await readFile(p,'utf8'),next=path.endsWith('.ino')?patchFirmware(id,path,old):path.endsWith('.py')?patchNativeHost(id,path,old):patchStudioFile(id,path,old);if(old!==next)await writeFile(p,next)});
 }
 const styles=join(root,'packages','ui','styles');await mkdir(styles,{recursive:true});for(const file of commonStyles)await cp(join(tmp,'elmos',file),join(styles,file));
 await shareStyles(root,stage);
 for(const id of Object.keys(manifest)){const out=join(root,'modules',id),backup=join(tmp,'previous-'+id);try{await rename(out,backup)}catch(e){if(e.code!=='ENOENT')throw e}try{await rename(join(stage,id),out)}catch(e){try{await rename(backup,out)}catch{}throw e}}
 console.log('Pinned modules packaged. Run UI tests before release.');
}finally{await rm(tmp,{recursive:true,force:true})}
