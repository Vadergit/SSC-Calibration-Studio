// Per-task capture of confirmed adapter metadata and timestamped diagnostic events.
export function createArchiveSession({now=()=>new Date().toISOString()}={}){
 let session=null;
 return {
  begin(type,model,metadata={}){session={type,model,startedAt:now(),metadata:{...metadata},events:[],errorCount:0,eventsOmitted:0};},
  clear(){session=null},
  metadata(model,metadata){if(session?.model!==model)return;for(const [k,v] of Object.entries(metadata||{}))if(v!=null&&v!=='')session.metadata[k]=v;},
  event(message,level='info'){if(!session)return;const e={time:now(),level,message:String(message)};if(level==='error')session.errorCount++;if(session.events.length>=2000){session.events.shift();session.eventsOmitted++}session.events.push(e);},
  snapshot(model,type){if(session?.model!==model||session.type!==type)return {};return {...session.metadata,startedAt:session.startedAt,endedAt:now(),errors:session.errorCount,events:session.events.slice(),eventsOmitted:session.eventsOmitted};}
 };
}
