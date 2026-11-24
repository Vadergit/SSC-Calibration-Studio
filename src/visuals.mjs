// Local SVG icons and a conceptual signal-chain diagram. No external assets.
const paths={
 chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
 usb:'<path d="M12 21V4m-4 4 4-4 4 4m-4 9-5-5v-2m5 4 5-5V7"/><circle cx="7" cy="8" r="2"/><rect x="15" y="3" width="4" height="4" rx=".5"/>',
 scope:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M6 13h3l2-5 3 8 2-3h2"/>',
 sliders:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="var(--paper)"/><circle cx="15" cy="12" r="2" fill="var(--paper)"/><circle cx="10" cy="18" r="2" fill="var(--paper)"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 save:'<path d="M4 4h13l3 3v13H4zM8 4v6h8V4M8 20v-7h8v7"/>',
 chart:'<path d="M4 4v16h16M7 15l4-5 3 3 5-7"/>',
 bridge:'<path d="M12 2 9 5m-4 4-3 3 3 3m4 4 3 3 3-3m4-4 3-3-3-3m-4-4-3-3"/><path d="m9 5-4 4m14 0-4-4M5 15l4 4m10-4-4 4" stroke-width="3"/><circle cx="12" cy="2" r="1"/><circle cx="22" cy="12" r="1"/><circle cx="12" cy="22" r="1"/><circle cx="2" cy="12" r="1"/>',
 file:'<path d="M5 3h9l5 5v13H5zM14 3v5h5M8 12h8m-8 4h8"/>',
 layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
 wrench:'<path d="M14 6a5 5 0 0 0-6 6l-5 5a2.5 2.5 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-4 2-2-2 2-4Z"/>',
 box:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8m-8 3h8m-8 3h5"/>'
};
export function technicalIcon(name,cls='tech-icon'){
 return '<span class="'+cls+'" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]||paths.chip)+'</svg></span>';
}
export function signalChain(){
 return `<figure class="signal-chain"><div class="diagram-heading"><span>SSC · Signalverarbeitung</span><span>BLOCKDIAGRAMM</span></div><svg viewBox="0 0 480 180" role="img" aria-label="Vereinfachte Signalkette: Messbrücke, AFE und ADC, DSP, Sensorausgang">
 <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
 <rect class="diagram-boundary" x="121" y="18" width="235" height="120" rx="8" stroke-dasharray="4 4"/>
 <rect class="diagram-node" x="4" y="31" width="96" height="96" rx="6"/><rect class="diagram-node" x="132" y="31" width="94" height="96" rx="6"/><rect class="diagram-node" x="247" y="31" width="98" height="96" rx="6"/><rect class="diagram-node" x="378" y="31" width="98" height="96" rx="6"/>
 <path d="M100 79h32m-6-4 6 4-6 4m100-4h21m-6-4 6 4-6 4m104-4h33m-6-4 6 4-6 4"/>
 <g transform="translate(52 76)"><path d="M0-32v9m0 46v9M-31 0h8m46 0h8M0-23l-6 6m-11 11-6 6 6 6m11 11 6 6 6-6m11-11 6-6-6-6m-11-11-6-6"/><g fill="var(--diagram-surface)"><rect x="-3.5" y="-21" width="7" height="16" transform="rotate(45)"/><rect x="-3.5" y="-21" width="7" height="16" transform="rotate(-45)"/><rect x="-3.5" y="5" width="7" height="16" transform="rotate(45)"/><rect x="-3.5" y="5" width="7" height="16" transform="rotate(-45)"/></g><circle cx="0" cy="-23" r="1.6" fill="currentColor"/><circle cx="0" cy="23" r="1.6" fill="currentColor"/><circle cx="-23" cy="0" r="1.6" fill="currentColor"/><circle cx="23" cy="0" r="1.6" fill="currentColor"/></g>
 <path d="M143 66h13m-13 23h13m0-31 30 20-30 20zM186 78h10m0-20v40m7-31h12m-12 11h12m-12 11h12"/><path d="M160 66h5m-2.5-2.5v5m-2.5 20h5"/>
 <rect x="278" y="58" width="36" height="40" rx="3"/><path d="M285 52v6m11-6v6m11-6v6m-22 40v6m11-6v6m11-6v6M272 65h6m-6 13h6m-6 13h6m36-26h6m-6 13h6m-6 13h6"/><path d="m286 83 6-10 6 10 7-10"/>
 <path d="M391 99h70m-70 0V52" opacity=".65"/><path d="M398 90l15-12 13-4 14-12 14-8" stroke-width="2"/><circle cx="398" cy="90" r="2" fill="currentColor"/><circle cx="454" cy="54" r="2" fill="currentColor"/>
 </g><g class="diagram-label" text-anchor="middle"><text x="52" y="148">Messbrücke</text><text x="179" y="148">AFE / ADC</text><text x="296" y="148">DSP</text><text x="427" y="148">Ausgang</text></g>
 <g class="diagram-caption" text-anchor="middle"><text x="52" y="164">mV/V</text><text x="179" y="164">Rohdaten</text><text x="296" y="164">Kompensation</text><text x="427" y="164">Analog / Digital</text><text x="238" y="12">SENSOR SIGNAL CONDITIONER</text></g></svg><figcaption>Prinzipdarstellung · abhängig von SSC und Ausgangstyp</figcaption></figure>`;
}
