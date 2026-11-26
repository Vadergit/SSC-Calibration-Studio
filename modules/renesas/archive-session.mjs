// Per-task capture of confirmed adapter metadata and timestamped diagnostic events.
export function createArchiveSession({now=()=>new Date().toISOString(),id=()=>globalThis.crypto.randomUUID(),append=()=>{}}={}){
 let session=null;
 const entry=(kind,data)=>{if(session)append({session:session.id,model:session.model,type:session.type,time:now(),kind,data});};
 return {
  begin(type,model,metadata={}){entry('end',{reason:'new-task'});session={id:id(),type,model,startedAt:now(),metadata:{...metadata},events:[],errorCount:0,eventsOmitted:0};entry('start',{metadata,startedAt:session.startedAt});},
  clear(){entry('end',{});session=null},
  metadata(model,metadata){if(session?.model!==model)return;for(const [k,v] of Object.entries(metadata||{}))if(v!=null&&v!==''&&session.metadata[k]!==v){session.metadata[k]=v;entry('metadata',{key:k,value:v});}},
  event(message,level='info'){if(!session)return;const e={time:now(),level,message:String(message)};if(level==='error')session.errorCount++;entry('event',e);if(session.events.length>=2000){session.events.shift();session.eventsOmitted++}session.events.push(e);},
  capture(kind,data){entry(kind,data)},
  active(){return !!session},
  snapshot(model,type){if(session?.model!==model||session.type!==type)return {};return {...session.metadata,journalId:session.id,startedAt:session.startedAt,endedAt:now(),errors:session.errorCount,events:session.events.slice(),eventsOmitted:session.eventsOmitted};}
 };
}
