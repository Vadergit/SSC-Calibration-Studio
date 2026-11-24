// Local SVG icons and a conceptual signal-chain diagram. No external assets.
const paths={
 chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
 usb:'<path d="M12 21V4m-4 4 4-4 4 4m-4 9-5-5v-2m5 4 5-5V7"/><circle cx="7" cy="8" r="2"/><rect x="15" y="3" width="4" height="4" rx=".5"/>',
 scope:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M6 13h3l2-5 3 8 2-3h2"/>',
 sliders:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="var(--paper)"/><circle cx="15" cy="12" r="2" fill="var(--paper)"/><circle cx="10" cy="18" r="2" fill="var(--paper)"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 save:'<path d="M4 4h13l3 3v13H4zM8 4v6h8V4M8 20v-7h8v7"/>',
 chart:'<path d="M4 4v16h16M7 15l4-5 3 3 5-7"/>',
 bridge:'<path d="M12 2 22 12 12 22 2 12Z"/><path d="M7 7l10 10M17 7 7 17" opacity=".45"/><circle cx="12" cy="2" r="1"/><circle cx="22" cy="12" r="1"/><circle cx="12" cy="22" r="1"/><circle cx="2" cy="12" r="1"/>',
 file:'<path d="M5 3h9l5 5v13H5zM14 3v5h5M8 12h8m-8 4h8"/>',
 layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
 wrench:'<path d="M14 6a5 5 0 0 0-6 6l-5 5a2.5 2.5 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-4 2-2-2 2-4Z"/>',
 box:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8m-8 3h8m-8 3h5"/>'
};
export function technicalIcon(name,cls='tech-icon'){
 return '<span class="'+cls+'" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]||paths.chip)+'</svg></span>';
}
export function signalChain(){
 return `<figure class="signal-chain"><svg viewBox="0 0 440 140" role="img" aria-label="Vereinfachte Signalkette: Messbrücke, AFE und ADC, DSP, Sensorausgang">
 <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
 <rect class="diagram-node" x="5" y="29" width="94" height="81" rx="8"/><rect class="diagram-node" x="124" y="29" width="89" height="81" rx="8"/><rect class="diagram-node" x="238" y="29" width="80" height="81" rx="8"/><rect class="diagram-node" x="343" y="29" width="92" height="81" rx="8"/>
 <path d="M99 69h25m-5-4 5 4-5 4m94-4h25m-5-4 5 4-5 4m85-4h25m-5-4 5 4-5 4"/>
 <path d="M52 40 77 65 52 90 27 65Z M52 35v5m0 50v5M27 65h-9m59 0h9" stroke-width="1.8"/>
 <path d="M136 53h12m-12 24h12m0-31 25 19-25 19zM173 65h12m0-15v30m5-24h9m-9 9h9m-9 9h9"/>
 <rect x="258" y="48" width="40" height="36" rx="3"/><path d="M267 43v5m11-5v5m11-5v5m-22 36v5m11-5v5m11-5v5M253 57h5m-5 9h5m-5 9h5m40-18h5m-5 9h5m-5 9h5"/>
 <path d="M355 81h67m-67 0V46m4 29 13-12 12 3 15-13 17-5" stroke-width="1.8"/>
 </g><g class="diagram-label" text-anchor="middle"><text x="52" y="125">Messbrücke</text><text x="168" y="125">AFE / ADC</text><text x="278" y="125">DSP</text><text x="389" y="125">Ausgang</text></g>
 <text class="diagram-caption" x="220" y="16" text-anchor="middle">SSC · vereinfachte Signalkette</text></svg></figure>`;
}
