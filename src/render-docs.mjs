// Static documentation renderer for the Markdown subset used in this repository.
// Raw HTML is escaped; links only permit local paths and HTTP(S).
import {STUDIO_VERSION} from '../packages/core/index.mjs';
export const documents=[
 {path:'README.md',label:'Projektübersicht',group:'Dokumentation'},
 {path:'docs/studio-architecture.md',label:'Softwarearchitektur',group:'Dokumentation'},
 {path:'docs/development-roadmap.md',label:'Roadmap',group:'Dokumentation'},
 {path:'docs/firmware-and-hardware.md',label:'Hardware & Firmware',group:'Dokumentation'},
 {path:'CHANGELOG.md',label:'Versionshistorie',group:'Dokumentation'},
 {path:'docs/manufacturers/elmos.md',label:'Elmos',group:'SSC-Hersteller'},
 {path:'docs/manufacturers/renesas-idt.md',label:'Renesas / IDT',group:'SSC-Hersteller'},
 {path:'docs/manufacturers/novosense.md',label:'NOVOSENSE',group:'SSC-Hersteller'},
 {path:'docs/manufacturers/texas-instruments.md',label:'Texas Instruments',group:'SSC-Hersteller'},
 {path:'docs/manufacturers/melexis.md',label:'Melexis',group:'SSC-Hersteller'},
 {path:'docs/manufacturers/analog-devices.md',label:'Analog Devices / Maxim',group:'SSC-Hersteller'},
 {path:'docs/manufacturers/jiuhao.md',label:'Jiuhao Microelectronics',group:'SSC-Hersteller'}
];
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const outputPath=path=>path.replace(/\.md$/i,'.html');
const prefix=path=>'../'.repeat(path.split('/').length-1);
function resolvePath(path,relative){
 const parts=path.split('/').slice(0,-1);
 for(const p of relative.split('/')){if(p==='..')parts.pop();else if(p&&p!=='.')parts.push(p)}
 return parts.join('/');
}
function linkTarget(source,href){
 if(/^https?:\/\//i.test(href))return href;
 if(href.startsWith('#'))return href;
 if(/^[a-z][a-z0-9+.-]*:/i.test(href)||href.startsWith('//'))return '#';
 const hash=href.indexOf('#'),path=hash<0?href:href.slice(0,hash),anchor=hash<0?'':href.slice(hash);
 const resolved=resolvePath(source,path);
 if(documents.some(d=>d.path===resolved))return prefix(source)+outputPath(resolved)+anchor;
 return href;
}
function inline(s,source){
 // Parse only recognized inline tokens; nested emphasis/links are rendered recursively.
 const pattern=/`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*([^*]+)\*/g;
 let out='',last=0;
 for(const m of s.matchAll(pattern)){
  out+=escapeHtml(s.slice(last,m.index));
  if(m[1]!==undefined)out+='<code>'+escapeHtml(m[1])+'</code>';
  else if(m[2]!==undefined)out+='<a href="'+escapeHtml(linkTarget(source,m[3]))+'">'+inline(m[2],source)+'</a>';
  else if(m[4]!==undefined)out+='<strong>'+inline(m[4],source)+'</strong>';
  else out+='<em>'+inline(m[5],source)+'</em>';
  last=m.index+m[0].length;
 }
 return out+escapeHtml(s.slice(last));
}
const headingSlug=s=>s.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu,'').trim().replace(/\s/g,'-');
const listMatch=line=>line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
const tableCells=line=>line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(s=>s.trim());
const tableRule=line=>/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line||'');
export function parseDocument(markdown,source){
 const lines=markdown.replace(/\r\n/g,'\n').split('\n');
 let i=0,title='',body='',toc=[];const seen=new Map();
 function item(text){
  const task=text.match(/^\[([ xX])\]\s+(.*)$/);
  if(!task)return inline(text,source);
  return '<span class="doc-task"><input type="checkbox" disabled'+(task[1].toLowerCase()==='x'?' checked':'')+' aria-label="'+(task[1].toLowerCase()==='x'?'Completed':'Not completed')+'"><span>'+inline(task[2],source)+'</span></span>';
 }
 function list(indent,ordered){
  const tag=ordered?'ol':'ul';let html='<'+tag+' class="doc-list">';
  while(i<lines.length){
   const m=listMatch(lines[i]);if(!m||m[1].length!==indent||/\d+\./.test(m[2])!==ordered)break;
   html+='<li>'+item(m[3]);i++;
   while(i<lines.length){
    const child=listMatch(lines[i]);if(!child||child[1].length<=indent)break;
    html+=list(child[1].length,/\d+\./.test(child[2]));
   }
   html+='</li>';
  }
  return html+'</'+tag+'>';
 }
 function blockStart(line,next){return /^#{1,6}\s|^```|^>\s?|^\s*---\s*$/.test(line)||!!listMatch(line)||(line.includes('|')&&tableRule(next))}
 while(i<lines.length){
  const line=lines[i];
  if(!line.trim()){i++;continue}
  const h=line.match(/^(#{1,6})\s+(.+)$/);
  if(h){
   if(!title&&h[1].length===1){title=h[2];i++;continue}
   const base=headingSlug(h[2])||'section',count=seen.get(base)||0;seen.set(base,count+1);
   const id=base+(count?'-'+count:''),level=Math.max(2,h[1].length);
   toc.push({id,text:h[2],level});body+='<h'+level+' id="'+escapeHtml(id)+'">'+inline(h[2],source)+'<a class="heading-anchor" href="#'+escapeHtml(id)+'" aria-label="Link to section">#</a></h'+level+'>';i++;continue;
  }
  if(/^```/.test(line)){
   const lang=line.slice(3).trim();let code=[];i++;while(i<lines.length&&!/^```/.test(lines[i]))code.push(lines[i++]);if(i<lines.length)i++;
   body+='<div class="doc-code"><div class="code-label">'+escapeHtml(lang||'Code')+'</div><pre><code>'+escapeHtml(code.join('\n'))+'</code></pre></div>';continue;
  }
  if(line.includes('|')&&tableRule(lines[i+1])){
   const headers=tableCells(line);i+=2;body+='<div class="table-scroll" tabindex="0" role="region" aria-label="Table"><table><thead><tr>'+headers.map(c=>'<th scope="col">'+inline(c,source)+'</th>').join('')+'</tr></thead><tbody>';
   while(i<lines.length&&/^\s*\|/.test(lines[i])){body+='<tr>'+tableCells(lines[i++]).map(c=>'<td>'+inline(c,source)+'</td>').join('')+'</tr>'}
   body+='</tbody></table></div>';continue;
  }
  const m=listMatch(line);if(m){body+=list(m[1].length,/\d+\./.test(m[2]));continue}
  if(/^>/.test(line)){const quote=[];while(i<lines.length&&/^>/.test(lines[i]))quote.push(lines[i++].replace(/^>\s?/,''));body+='<blockquote>'+inline(quote.join(' '),source)+'</blockquote>';continue}
  if(/^\s*---\s*$/.test(line)){body+='<hr>';i++;continue}
  const para=[line.trim()];i++;while(i<lines.length&&lines[i].trim()&&!blockStart(lines[i],lines[i+1]))para.push(lines[i++].trim());
  body+='<p>'+inline(para.join(' '),source)+'</p>';
 }
 return {title:title||source,body,toc};
}
export function renderDocument(source,markdown){
 const doc=documents.find(d=>d.path===source);if(!doc)throw Error('Unknown document '+source);
 const root=prefix(source)||'./',parsed=parseDocument(markdown,source);
 const nav=['Dokumentation','SSC-Hersteller'].map(group=>'<div class="doc-nav-group"><h2>'+group+'</h2>'+documents.filter(d=>d.group===group).map(d=>'<a href="'+root+outputPath(d.path)+'"'+(d.path===source?' aria-current="page"':'')+'>'+escapeHtml(d.label)+'</a>').join('')+'</div>').join('');
 const toc=parsed.toc.map(h=>'<a class="toc-level-'+h.level+'" href="#'+escapeHtml(h.id)+'">'+escapeHtml(h.text)+'</a>').join('');
 const logo='<span class="logo" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="10" y="10" width="20" height="20" rx="3"/><path d="M15 5v5m10-5v5M15 30v5m10-5v5M5 15h5m-5 10h5m20-10h5m-5 10h5M14 21h3l2-6 4 10 2-4h2"/></svg></span>';
 return '<!doctype html>\n<html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapeHtml(doc.label)+' · SSC Calibration Studio</title><link rel="stylesheet" href="'+root+'src/studio.css?v='+STUDIO_VERSION+'"><link rel="stylesheet" href="'+root+'src/docs.css?v='+STUDIO_VERSION+'"><script defer src="'+root+'src/theme.js?v='+STUDIO_VERSION+'"></script></head><body><div class="doc-wrap"><header class="doc-header"><a class="brand" href="'+root+'"><span class="doc-brand-logo">'+logo+'</span><span><span class="eyebrow">TECHNICAL DOCUMENTATION</span><span class="doc-brand-title">SSC Calibration Studio</span></span></a><div class="header-actions"><a class="header-source" href="'+root+'">← Studio</a><span class="badge">v'+STUDIO_VERSION+'</span><button id="theme" type="button" aria-label="Farbschema wechseln" hidden>Dark Mode</button></div></header><div class="doc-layout"><aside class="doc-sidebar"><nav aria-label="Documentation">'+nav+'</nav></aside><main class="doc-content"><div class="doc-breadcrumb"><a href="'+root+'">Studio</a><span>/</span><span>'+escapeHtml(doc.group)+'</span><span>/</span><span>'+escapeHtml(doc.label)+'</span></div><article class="doc-article" lang="en"><div class="section-kicker">SSC / REFERENCE</div><h1>'+inline(parsed.title,source)+'</h1><div class="doc-meta"><span>Technical documentation</span><a href="https://github.com/Vadergit/SSC-Calibration-Studio/blob/main/'+escapeHtml(source)+'">Markdown source ↗</a></div>'+parsed.body+'</article></main><aside class="doc-toc"><nav aria-label="On this page"><h2>Inhalt</h2>'+toc+'</nav></aside></div><footer><div><strong>SSC Calibration Studio</strong><span>Laborsoftware, keine Serienfreigabe.</span></div><div class="footer-links"><a href="'+root+'">Studio</a><a href="https://github.com/Vadergit/SSC-Calibration-Studio">GitHub</a></div></footer></div></body></html>\n';
}
