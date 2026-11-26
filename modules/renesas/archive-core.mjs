// Read-only interpretation of old and current archive records. Never infer a successful write from a connection.
export const ARCHIVE_KEY='renesas-archive';
export const typeLabels={calibration:'Kalibrierung',verification:'Nachmessung',testlog:'Test / Logging'};
export function archiveType(r){return Object.hasOwn(typeLabels,r?.type)?r.type:'calibration'}
export function archiveSource(r){
 if(r.synthetic||r.mode==='demo'||r.mode==='simulation'||r.source==='simulation')return 'Demo';
 if(r.source==='hardware'||r.completed===true||r.hardwareWritten===true||r.type==='verification'&&Array.isArray(r.checks)&&r.checks.some(x=>Number.isFinite(x?.raw)&&Number.isFinite(x?.tempCode)))return 'Hardware';
 if(r.a||r.b||r.points?.some?.(p=>p&&Number.isFinite(p.bridge)&&Number.isFinite(p.count)))return 'Hardware-Messwerte';
 if(r.mode==='hardware-input-offline-fit'||r.points?.some?.(p=>p?.origin==='hardware'))return 'Hardware-Messwerte / Offline-Berechnung';
 if(r.logs?.some?.(p=>p?.origin==='demo'))return r.logs.some(p=>p?.origin?.startsWith?.('hardware'))?'Gemischte Quellen':'Demo';
 if(r.logs?.some?.(p=>p?.origin?.startsWith?.('hardware')||Number.isFinite(p?.bridge)))return 'Hardware';
 return r.mode==='offline'||r.source==='offline'?'Offline':'Quelle nicht dokumentiert';
}
export function archiveStatus(r){return r.status==='aborted'?'Abgebrochen':r.status==='completed'?'Abgeschlossen':r.completed===true?'EEPROM gespeichert':r.type==='testlog'?'Gespeichert':'Nicht dokumentiert'}
export function archiveChecks(r){return (r.type==='verification'?r.checks:r.verification?.checks??r.checks)?.filter?.(x=>x&&typeof x==='object')??[]}
export function archivePoints(r){const p=Array.isArray(r.points)?r.points.filter(Boolean):[];return p.length?p:[r.a,r.b].filter(Boolean)}
export function archiveVerdict(r){
 const checks=archiveChecks(r);if(checks.some(x=>x.pass===false))return 'Nicht bestanden';
 const expected=r.type==='verification'?r.plan?.plan?.length:r.verification?.count;
 if(r.status==='aborted')return 'Unvollständig';
 if(checks.length&&checks.every(x=>x.pass===true)&&Number.isInteger(expected)&&checks.length===expected)return 'Bestanden';
 return checks.length?'Unvollständig / nicht bewertet':'Nicht geprüft';
}
export function validRecord(r){return !!r&&typeof r==='object'&&!Array.isArray(r)&&typeof r.model==='string'&&r.model.length>0&&r.model.length<100&&typeof r.created==='string'&&Number.isFinite(Date.parse(r.created))}
export function archiveFilter(records,{query='',type='',status='',source=''}={}){
 const q=query.trim().toLowerCase();return records.filter(validRecord).filter(r=>(!type||archiveType(r)===type)&&(!status||archiveStatus(r)===status)&&(!source||archiveSource(r)===source)&&(!q||[r.model,r.created,r.name,r.plan?.name,r.dut,r.operator,r.description,archiveSource(r),archiveStatus(r),typeLabels[archiveType(r)]].join(' ').toLowerCase().includes(q))).sort((a,b)=>Date.parse(b.created)-Date.parse(a.created));
}
export const fileBase=r=>('Renesas-'+r.model+'-'+archiveType(r)+'-'+r.created).replace(/[^a-zA-Z0-9_.-]/g,'-');
const csvCell=v=>{let s=v==null?'':typeof v==='object'?JSON.stringify(v):String(v);if(typeof v==='string'&&/^[\s]*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
export function archiveSections(r){return [
 {name:'Kalibrierpunkte',rows:archivePoints(r)},
 {name:'Nachmessung',rows:archiveChecks(r)},
 {name:'Test / Logging',rows:Array.isArray(r.logs)?r.logs.filter(Boolean):[]}
 ].filter(x=>x.rows.length)}
export function archiveCSV(r){
 const lines=[['Protokoll',typeLabels[archiveType(r)]],['SSC',r.model],['Datum',r.created],['Quelle',archiveSource(r)],['Status',archiveStatus(r)],['Prüfergebnis',archiveVerdict(r)]].map(row=>row.map(csvCell).join(';'));
 for(const {name,rows} of archiveSections(r)){const keys=[...new Set(rows.flatMap(x=>Object.keys(x)))];lines.push('',csvCell(name),keys.map(csvCell).join(';'),...rows.map(x=>keys.map(k=>csvCell(x[k])).join(';')))}
 return '\uFEFF'+lines.join('\r\n');
}
export function mergeArchive(existing,imported){
 if(!Array.isArray(imported)||!imported.length||imported.some(x=>!validRecord(x)))throw Error('Ungültige Archivdatei. Renesas-Protokolle als JSON erforderlich.');
 const result=existing.slice(),known=new Set(existing.map(x=>JSON.stringify(x)));
 for(const r of imported){const key=JSON.stringify(r);if(!known.has(key)){result.push(r);known.add(key)}}
 return result;
}
