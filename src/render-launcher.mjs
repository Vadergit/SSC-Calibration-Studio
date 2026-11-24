import {catalog,calibratorUrl,manufacturerUrl} from './model.mjs';
import {STUDIO_VERSION} from '../packages/core/index.mjs';
import {projectIntro,projectDetails} from './project-overview.mjs';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function modelCard(maker,model){
 const url=calibratorUrl(maker.id,model.id);
 return url?'<a class="model-card" href="'+esc(url)+'">'+esc(model.name)+' <span>→</span></a>':'<div class="model-card planned-model"><strong>'+esc(model.name)+'</strong><small>In Vorbereitung</small></div>';
}
function manufacturerCard(maker){
 const url=manufacturerUrl(maker.id);
 if(url)return '<a class="choice launcher-choice available" href="'+esc(url)+'"><span class="choice-head"><strong>'+esc(maker.name)+'</strong><span class="choice-arrow" aria-hidden="true">→</span></span><small>'+esc(maker.models[0].name)+'</small><span class="available-label">Kalibrierassistent öffnen</span></a>';
 const count=maker.models.filter(m=>calibratorUrl(maker.id,m.id)).length;
 const detail=count?count+' verfügbar · '+maker.models.length+' SSCs':maker.models.length+' SSCs / Gruppen · In Vorbereitung';
 return '<details class="manufacturer-card"><summary class="choice launcher-choice"><span class="choice-head"><strong>'+esc(maker.name)+'</strong><span class="choice-arrow" aria-hidden="true">⌄</span></span><small>'+esc(detail)+'</small></summary><div class="model-list">'+maker.models.map(m=>modelCard(maker,m)).join('')+'</div></details>';
}
export function renderLauncher(){
 return '<!doctype html>\n<html lang="de-CH" data-theme="light">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SSC Calibration Studio</title><link rel="stylesheet" href="./src/studio.css?v='+STUDIO_VERSION+'"><script defer src="./src/theme.js?v='+STUDIO_VERSION+'"></script></head>\n<body><div class="wrap"><header><a class="brand" href="./"><span class="logo">SSC</span><span><span class="eyebrow">SENSOR SIGNAL CONDITIONER</span><h1>SSC Calibration Studio</h1></span></a><div class="header-actions"><span class="badge">v'+STUDIO_VERSION+' · Labor</span><button id="theme" type="button" aria-label="Farbschema wechseln" hidden>Dark Mode</button></div></header>\n<main id="workspace">'+projectIntro()+'<section class="panel launcher-panel" id="calibrators" aria-labelledby="calibrators-title"><h2 id="calibrators-title">Kalibrierassistent auswählen</h2><p class="muted">Hersteller / SSC</p><div class="choices launcher-grid">'+catalog.map(manufacturerCard).join('\n')+'</div><p class="muted small">Programmieradapter, Kommunikation und Aufgaben werden direkt im jeweiligen Kalibrierassistenten ausgewählt.</p></section>'+projectDetails()+'</main>\n<footer><a href="https://github.com/Vadergit/SSC-Calibration-Studio">GitHub</a> · <a href="./docs/development-roadmap.md">Roadmap</a> · Laborsoftware, keine Serienfreigabe.</footer></div></body></html>\n';
}
