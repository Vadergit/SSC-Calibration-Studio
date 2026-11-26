// Append-only browser journal, separate from the compact localStorage report index.
// No automatic pruning. A failed write is reported; never claim that it was persisted.
export function createJournal({indexedDB:dbFactory=globalThis.indexedDB,onError=()=>{}}={}){
 let database,failed=null,pending=Promise.resolve(),queue=[],scheduled=false;
 function db(){if(!database)database=new Promise((resolve,reject)=>{
  if(!dbFactory){reject(Error('IndexedDB nicht verfügbar'));return}
  const req=dbFactory.open('renesas-calibration-journal-v1',1);
  req.onupgradeneeded=()=>{const store=req.result.createObjectStore('entries',{keyPath:'id',autoIncrement:true});store.createIndex('session','session');};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('Archivdatenbank blockiert'));
 });return database;}
 const error=e=>{failed=e;onError(e);};
 function schedule(){
  if(scheduled)return;scheduled=true;
  pending=pending.then(async()=>{
   const d=await db();const batch=queue.splice(0);
   if(!batch.length)return;
   try{await new Promise((resolve,reject)=>{const t=d.transaction('entries','readwrite');const store=t.objectStore('entries');for(const item of batch)store.add(item);t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||Error('Archivtransaktion abgebrochen'));});}
   catch(e){queue.unshift(...batch);throw e;}
  }).catch(error).finally(()=>{scheduled=false;if(queue.length&&!failed)schedule();});
 }
 function append(entry){
  try{queue.push(JSON.parse(JSON.stringify(entry)));schedule();}catch(e){error(e);}
 }
 async function flush(){while(scheduled){await pending;}if(queue.length&&!failed){schedule();return flush()}if(failed)throw failed;}
 async function read(session){try{await flush()}catch{}const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('entries','readonly'),store=t.objectStore('entries'),req=session?store.index('session').getAll(session):store.getAll();req.onsuccess=()=>resolve([...req.result,...queue.filter(x=>!session||x.session===session)]);req.onerror=()=>reject(req.error);});}
 return {append,flush,read,failed:()=>!!failed};
}
