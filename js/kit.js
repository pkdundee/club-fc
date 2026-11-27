// Club FC 1.10 (SCOPE_1.10 A, B; QA-135 to QA-137): the UI kit's icons, drawn once and used everywhere.
// Approved sheets: v1-planning/icons/ICON_SHEET_v3.html (v3.3) and ICON_SHEET_v4.2_campus.html. Emoji stay only in text.
(function (C) {
  let N = 0; const uid = () => 'k' + (N++);
  const W = 'fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"';
  // ---------- flat glyphs (24-unit, white with "C" for the inner details) ----------
  const GL={
 home:`<path d="M4.5 11.5L12 5l7.5 6.5V19.5h-5v-5h-5v5h-5z" fill="#fff"/>`,
 match:`<path d="M5 18V8.5h14V18" ${W}/><path d="M5 8.5l2.5-3h9l2.5 3" ${W} stroke-width="1.8"/><circle cx="12" cy="15.5" r="2.6" fill="#fff"/>`,
 tactics:`<rect x="6" y="4.5" width="12" height="16" rx="1.6" fill="#fff"/><path d="M8.6 8.5l2 2M10.6 8.5l-2 2" stroke="C" stroke-width="1.5" stroke-linecap="round"/><circle cx="14.6" cy="16" r="1.5" fill="none" stroke="C" stroke-width="1.5"/><path d="M10 12.5c1.8 1 3 2 4 3" stroke="C" stroke-width="1.4" stroke-dasharray="1.6 1.4" fill="none"/>`,
 campus:`<path d="M3.5 10L12 4.5 20.5 10z" fill="#fff"/><rect x="5" y="11" width="14" height="7.5" fill="#fff"/><path d="M7.8 12.5v4.5M10.6 12.5v4.5M13.4 12.5v4.5M16.2 12.5v4.5" stroke="C" stroke-width="1.4"/><path d="M3.5 20h17" ${W}/>`,
 squad:`<path d="M8.5 4.5L4 7l1.8 4 1.7-1v9.5h9V10l1.7 1L20 7l-4.5-2.5c-.7 1.5-2 2.4-3.5 2.4S9.2 6 8.5 4.5z" fill="#fff"/><text x="12" y="16.6" text-anchor="middle" font-family="Teko" font-weight="600" font-size="7" fill="C">10</text>`,
 recruit:`<circle cx="6.3" cy="9" r="2.3" fill="#fff" opacity=".75"/><path d="M2.5 17.5c.3-3 1.8-4.8 3.8-4.8s3.5 1.8 3.8 4.8z" fill="#fff" opacity=".75"/><circle cx="17.7" cy="9" r="2.3" fill="#fff" opacity=".75"/><path d="M13.9 17.5c.3-3 1.8-4.8 3.8-4.8s3.5 1.8 3.8 4.8z" fill="#fff" opacity=".75"/><circle cx="12" cy="7.6" r="3" fill="#fff" stroke="C" stroke-width="1.2"/><path d="M6.8 19.5c.4-4 2.5-6.3 5.2-6.3s4.8 2.3 5.2 6.3z" fill="#fff" stroke="C" stroke-width="1.2"/>`,
 staff:`<path d="M3 16c0-5.6 3.2-9 7.6-9s7 3.3 7.2 9z" fill="#fff"/><circle cx="10.6" cy="6.9" r="1.2" fill="#fff"/><path d="M10.6 7.5c-.6 2.5-.8 5.2-.6 8.4" stroke="C" stroke-width="1.2" fill="none"/><path d="M15.5 13.8c2.6-.3 5 .2 6.3 1.4.3.4 0 .9-.5.9H15z" fill="#fff"/><path d="M3 16h15" stroke="C" stroke-width="1.2"/><path d="M5.6 11.6c.6-1.8 1.8-3 3.2-3.6" stroke="C" stroke-width="1.1" fill="none" stroke-linecap="round"/>`,
 playbook:`<path d="M4.5 6.3c2.6-1.3 4.9-1.3 7.5 0v12c-2.6-1.3-4.9-1.3-7.5 0zM12 6.3c2.6-1.3 4.9-1.3 7.5 0v12c-2.6-1.3-4.9-1.3-7.5 0z" fill="#fff"/><path d="M14.4 12.5l1.5 1.5 2.6-2.8" stroke="C" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
 medical:`<rect x="4" y="7.5" width="16" height="12" rx="2" fill="#fff"/><path d="M9.5 7.5V5.5h5v2" ${W} stroke-width="1.8"/><path d="M11 10h2v2.6h2.6v2H13v2.6h-2v-2.6H8.4v-2H11z" fill="C"/>`,
 events:`<rect x="5" y="11" width="14" height="9" rx="1" fill="#fff"/><rect x="4" y="8" width="16" height="3.6" rx="1" fill="#fff"/><path d="M12 8v12" stroke="C" stroke-width="2"/><path d="M12 8c-1.6-3-5-3.3-4.3-1.1.4 1 2.5 1.1 4.3 1.1zM12 8c1.6-3 5-3.3 4.3-1.1-.4 1-2.5 1.1-4.3 1.1z" fill="#fff"/>`,
 inbox:`<rect x="3.5" y="6.5" width="17" height="12" rx="1.8" fill="#fff"/><path d="M4 7.5l8 6 8-6" stroke="C" stroke-width="1.6" fill="none"/>`,
 inventory:`<path d="M9 8V6.5a3 3 0 0 1 6 0V8" ${W}/><rect x="5" y="8" width="14" height="12" rx="2.5" fill="#fff"/><rect x="9" y="12" width="6" height="3.6" rx="1" fill="C"/>`,
 store:`<path d="M3 5h2.6l2 9h9.6l1.8-6.5H6.6" ${W}/><path d="M7 7.5h11.8L17 14H8.4z" fill="#fff"/><circle cx="9" cy="18" r="1.6" fill="#fff"/><circle cx="16" cy="18" r="1.6" fill="#fff"/>`,
};
GL.hammer=`<g transform="translate(12 12) scale(1.55)"><path d="M-4.5 4.5 L1.6 -1.6" stroke="#fff" stroke-width="2.9" stroke-linecap="round"/><path d="M0 -4.6 L4.6 0 L2.1 2.5 L-2.5 -2.1Z" fill="#fff" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></g>`;   // 1.10.01 (QA-150): the map's chunky mallet

  const COL = { home: '#2b5ea7', match: '#16a34a', tactics: '#047857', campus: '#b91c1c', squad: '#2563eb', recruit: '#7c3aed', staff: '#0891b2', playbook: '#1d4ed8', medical: '#22c55e', events: '#f59e0b', inbox: '#3b82f6', inventory: '#1e40af', store: '#ea580c' };
  const SH = { '#2b5ea7': '#1e3a8a', '#16a34a': '#14532d', '#047857': '#064e3b', '#b91c1c': '#7f1d1d', '#2563eb': '#1e3a8a', '#7c3aed': '#4c1d95', '#0891b2': '#164e63', '#1d4ed8': '#1e3a8a', '#22c55e': '#15803d', '#f59e0b': '#b45309', '#3b82f6': '#1d4ed8', '#1e40af': '#172554', '#ea580c': '#9a3412' };
  const g = (k, fg, inner) => (GL[k] || '').replace(/#fff/g, fg).replace(/"C"/g, '"' + inner + '"');
  // Home grid: a solid colour badge with a white glyph
  C.kBadge = (k, s = 44) => { const c = COL[k] || '#475569'; return `<svg class="kb" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><rect x="1.5" y="2.4" width="21" height="21" rx="5.5" fill="${SH[c] || '#1e293b'}"/><rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="${c}"/>${g(k, '#fff', c)}</svg>`; };
  // tab bar: the glyph alone, in the current colour (the college colour when selected)
  C.kGlyph = (k, s = 26) => `<svg class="kg" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${(GL[k] || '').replace(/#fff/g, 'currentColor').replace(/"C"/g, '"#fff"')}</svg>`;
  // campus side buttons
  C.kQueue = (k, n) => `<svg class="kside" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="2" width="22" height="22" rx="5.5" fill="#94a3b8"/><rect x="1" y="1" width="22" height="22" rx="5.5" fill="#e2e8f0"/><g transform="translate(4.6 .4) scale(.62)">${g(k, '#334155', '#e2e8f0')}</g><text x="12" y="22" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="6.6" fill="#0f172a">${n}</text></svg>`;
  C.kTileBtn = (k, bg, dk) => `<svg class="kside" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="2" width="22" height="22" rx="5.5" fill="${dk}"/><rect x="1" y="1" width="22" height="22" rx="5.5" fill="${bg}" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/><g transform="translate(2 2) scale(.84)">${g(k, '#fff', bg)}</g></svg>`;
  C.kListCircle = () => `<svg class="kside" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12.9" r="10.6" fill="#1e293b"/><circle cx="12" cy="12" r="10.6" fill="#475569" stroke="#fff" stroke-width="1.4"/><g transform="translate(3.2 3) scale(.72)">${GL.hammer}</g><g transform="translate(14.5 14.5)"><circle cx="4.6" cy="4.6" r="4.9" fill="#3b82f6" stroke="#fff" stroke-width="1.2"/><path d="M2.4 3h4.6M2.4 4.8h4.6M2.4 6.6h4.6" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/></g></svg>`;
  C.kStoreCircle = (s = 26) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><circle cx="12" cy="12.8" r="10.6" fill="#9a3412"/><circle cx="12" cy="12" r="10.6" fill="#f5a524" stroke="#fff" stroke-width="1.2"/><g transform="translate(2.6 2.6) scale(.78)">${g('store', '#fff', '#f5a524')}</g></svg>`;
  C.kClip = () => `<svg class="kside" viewBox="0 0 100 100" aria-hidden="true"><rect x="4" y="9" width="92" height="88" rx="20" fill="#b45309"/><rect x="4" y="4" width="92" height="88" rx="20" fill="#f5a524" stroke="#fff" stroke-opacity=".35" stroke-width="3"/><rect x="20" y="16" width="60" height="70" rx="8" fill="#fff" stroke="#0f172a" stroke-width="5"/><rect x="35" y="9" width="30" height="16" rx="4" fill="#93c5fd" stroke="#0f172a" stroke-width="5"/><path d="M32 52l12 12 24-26" stroke="#16a34a" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  // Program Power: the gold shield
  C.kPow = (s = 20) => { const a = uid(); return `<svg class="kpow" viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true"><defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a6"/><stop offset="1" stop-color="#f2a20c"/></linearGradient></defs><path d="M50 10l34 12v26c0 22-15 36-34 44C31 84 16 70 16 48V22z" fill="#b45309" transform="translate(0 4)"/><path d="M50 10l34 12v26c0 22-15 36-34 44C31 84 16 70 16 48V22z" fill="url(#${a})" stroke="#92400e" stroke-width="5" stroke-linejoin="round"/><path d="M50 30l6 12.5 13.5 1.6-10 9.3 2.7 13.4L50 60l-12.2 6.8 2.7-13.4-10-9.3L44 42.5z" fill="#fff" stroke="#b45309" stroke-width="2.5" stroke-linejoin="round"/></svg>`; };
  // currencies (top bar, costs)
  C.kCash = (s = 18) => `<svg class="kcur" viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true"><rect x="4" y="22" width="92" height="56" rx="9" fill="#22a35a" stroke="#14532d" stroke-width="6"/><circle cx="50" cy="50" r="16" fill="#ecfdf5"/><text x="50" y="60" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="26" fill="#166534">$</text></svg>`;
  C.kCP = (s = 18) => `<svg class="kcur" viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="#14b8a6" stroke="#115e59" stroke-width="7"/><path d="M50 22l8.4 17.8 19.6 2.2-14.6 13.4 4 19.4L50 65l-17.4 9.8 4-19.4L22 42l19.6-2.2z" fill="#fff"/></svg>`;
  C.kCoin = (s = 18) => { const a = uid(); return `<svg class="kcur" viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true"><defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a6"/><stop offset="1" stop-color="#f2a20c"/></linearGradient></defs><circle cx="50" cy="50" r="42" fill="url(#${a})" stroke="#92400e" stroke-width="7"/><text x="50" y="66" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="46" fill="#b45309">C</text></svg>`; };
  // ---------- item tiles (v3.3): art + rarity background + label band + quantity ----------
  const RAR={grey:['#c3cad5','#8a94a6','#e2e8f0','#64748b'],green:['#43c774','#1d8a49','#86efac','#15803d'],blue:['#47a7ec','#1c6db6','#93c5fd','#1d4ed8'],purple:['#b46ae9','#7633b4','#d8b4fe','#6b21a8'],gold:['#f6a43c','#d26d16','#fde68a','#b45309']};
// a complete tile: background + band + art + quantity
function tile(r,art,label,qty){const g=uid(),R=RAR[r];
 return `<svg class="ktile" viewBox="0 0 100 100"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${R[0]}"/><stop offset="1" stop-color="${R[1]}"/></linearGradient></defs>
 <rect x="1" y="3" width="98" height="96" rx="7" fill="#0f172a" opacity=".25"/><rect x="1" y="1" width="98" height="95" rx="7" fill="url(#${g})"/>
 <rect x="1" y="1" width="98" height="95" rx="7" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>
 ${label?`<path d="M1 8a7 7 0 0 1 7-7h84a7 7 0 0 1 7 7v15H1z" fill="#fff" opacity=".3"/><text x="50" y="18" text-anchor="middle" font-family="Teko" font-weight="600" font-size="19" fill="#fff" stroke="#0f172a" stroke-width="2.6" paint-order="stroke">${label}</text>`:''}
 <g transform="translate(0 ${label?5:0})">${art()}</g>
 ${qty!=null?`<text x="93" y="91" text-anchor="end" font-family="Teko" font-weight="600" font-size="25" fill="#fff" stroke="#0f172a" stroke-width="3.2" paint-order="stroke">${qty}</text>`:''}</svg>`;}
const lg=(id,a,b,v=1)=>`<linearGradient id="${id}" x1="0" y1="0" x2="${v?0:1}" y2="${v?1:0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
// ---------- art ----------
function chev(sub){return()=>{const a=uid();return `<defs>${lg(a,'#fff3a8','#f5a70b')}</defs>
 <path d="M12 30l25 21-25 21z" fill="url(#${a})" stroke="#b45309" stroke-width="2.5" stroke-linejoin="round"/>
 <path d="M35 30l25 21-25 21z" fill="url(#${a})" stroke="#b45309" stroke-width="2.5" stroke-linejoin="round"/>
 <path d="M15 35l16 13.5" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><path d="M38 35l16 13.5" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
 ${sub?SUB[sub]():''}`;};}
// type badges: flat round badges from the extended set (same look as the tap ring), top right of the tile
const tb=(c,d,g)=>`<g transform="translate(60 22)"><circle cx="16" cy="17.6" r="15" fill="${d}"/><circle cx="16" cy="16" r="15" fill="${c}" stroke="#fff" stroke-width="2.4"/><g transform="translate(4.5 4.5) scale(.96)">${g}</g></g>`;
const SUB={
 build:()=>tb('#64748b','#334155',`<path d="M5 20L14 11" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><path d="M11.5 4.5h7.5l2.5 3.2-4.6 2.6-2.4-2.4h-3z" fill="#fff"/>`),
 research:()=>tb('#0d9488','#115e59',`<path d="M9 4.5h6M10 4.5v6l-5 9h14l-5-9v-6" fill="#fff"/><path d="M7.6 16.5h8.8" stroke="#0d9488" stroke-width="1.6"/>`),
 train:()=>tb('#e8772e','#b0521a',`<path d="M12 4.5l5.5 14h-11z" fill="#fff"/><path d="M8.2 14.5h7.6" stroke="#e8772e" stroke-width="1.8"/><path d="M4.5 19.5h15" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`),
 heal:()=>tb('#22c55e','#15803d',`<path d="M9.5 4.5h5v5h5v5h-5v5h-5v-5h-5v-5h5z" fill="#fff"/>`),
};
const coins=()=>{const a=uid();return `<defs>${lg(a,'#fff1a6','#f2a20c')}</defs>${[64,52,40].map((y,i)=>`<ellipse cx="${50+(i-1)*4}" cy="${y+6}" rx="24" ry="9" fill="#b45309"/><ellipse cx="${50+(i-1)*4}" cy="${y}" rx="24" ry="9" fill="url(#${a})" stroke="#b45309" stroke-width="2"/>`).join('')}<text x="54" y="44" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="11" fill="#b45309">C</text>`;};
const cash=()=>{const a=uid();return `<defs>${lg(a,'#a7f3c7','#22a35a')}</defs><rect x="18" y="40" width="58" height="30" rx="4" fill="#15803d" transform="rotate(-8 47 55)"/><rect x="22" y="32" width="58" height="30" rx="4" fill="url(#${a})" stroke="#166534" stroke-width="2"/><circle cx="51" cy="47" r="9" fill="#ecfdf5" stroke="#166534" stroke-width="1.8"/><text x="51" y="51.5" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="12" fill="#166534">$</text>`;};
const cp=()=>{const a=uid(),b=uid();return `<defs>${lg(a,'#99f6e4','#0d9488')}${lg(b,'#fff','#ccfbf1')}</defs><circle cx="50" cy="54" r="27" fill="#0f766e"/><circle cx="50" cy="50" r="27" fill="url(#${a})" stroke="#115e59" stroke-width="2"/><path d="M50 32l5.5 11.5 12.5 1.5-9.3 8.6 2.5 12.4L50 60l-11.2 6 2.5-12.4L32 45l12.5-1.5z" fill="url(#${b})" stroke="#115e59" stroke-width="1.6" stroke-linejoin="round"/>`;};
const medal=()=>{const a=uid(),b=uid();return `<defs>${lg(a,'#fff3a8','#f0a21a')}${lg(b,'#fca5a5','#dc2626',0)}</defs><path d="M34 18h12l6 20h-12zM66 18H54l-6 20h12z" fill="url(#${b})" stroke="#7f1d1d" stroke-width="1.8" stroke-linejoin="round"/><path d="M50 34l20 8v16c0 10-8 17-20 22-12-5-20-12-20-22V42z" fill="url(#${a})" stroke="#92400e" stroke-width="2.2" stroke-linejoin="round"/><path d="M50 46l3.5 7 7.8 1-5.7 5.3 1.4 7.7L50 63.3l-7 3.7 1.4-7.7-5.7-5.3 7.8-1z" fill="#fff8d6" stroke="#b45309" stroke-width="1.5" stroke-linejoin="round"/>`;};
const book=()=>{const a=uid();return `<defs>${lg(a,'#fb7185','#be123c')}</defs><path d="M22 28h46a6 6 0 0 1 6 6v42H28a6 6 0 0 1-6-6z" fill="url(#${a})" stroke="#881337" stroke-width="2.2"/><path d="M28 70h46v6H28a3 3 0 0 1 0-6z" fill="#fff" stroke="#881337" stroke-width="1.6"/><path d="M28 64h46v6" fill="#f1f5f9" stroke="#881337" stroke-width="1.2"/><path d="M48 37l3 6.3 7 .8-5.1 4.8 1.3 6.9L48 52.4l-6.2 3.4 1.3-6.9-5.1-4.8 7-.8z" fill="#fde68a" stroke="#92400e" stroke-width="1.5" stroke-linejoin="round"/>`;};
const xp=()=>{const a=uid();return `<defs>${lg(a,'#86efac','#16a34a')}</defs><rect x="20" y="28" width="60" height="42" rx="7" fill="#166534" transform="translate(0 4)"/><rect x="20" y="28" width="60" height="42" rx="7" fill="url(#${a})" stroke="#14532d" stroke-width="2.2"/><text x="50" y="60" text-anchor="middle" font-family="Teko" font-weight="600" font-size="32" fill="#fff" stroke="#14532d" stroke-width="2.5" paint-order="stroke">XP</text>`;};
const medkit=()=>{const a=uid();return `<defs>${lg(a,'#fff','#e2e8f0')}</defs><path d="M40 30v-6h20v6" fill="none" stroke="#475569" stroke-width="4"/><rect x="20" y="30" width="60" height="44" rx="7" fill="url(#${a})" stroke="#475569" stroke-width="2.2"/><path d="M45 39h10v8h8v10h-8v8H45v-8h-8V47h8z" fill="#22c55e" stroke="#15803d" stroke-width="1.6"/>`;};
const rot=(x,y,k=1)=>{const a=uid();return `<defs>${lg(a,'#86efac','#16a34a')}</defs><g transform="translate(${x} ${y}) scale(${k})"><circle cx="0" cy="0" r="17" fill="#fff" stroke="#0f172a" stroke-width="2"/><path d="M-9.5-3a10 10 0 0 1 17-5.5l2.5-2.5v8.5H1.5l2.8-2.8A6 6 0 0 0-5.3-3z" fill="url(#${a})" stroke="#14532d" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.5 3a10 10 0 0 1-17 5.5L-10 11V2.5h8.5L-4.3 5.3A6 6 0 0 0 5.3 3z" fill="url(#${a})" stroke="#14532d" stroke-width="1.4" stroke-linejoin="round"/></g>`;};
const ticket=()=>{const a=uid();return `<defs>${lg(a,'#fff','#dbe3ee')}</defs><path d="M33 24l-15 8 5 12 7-3v32h34V41l7 3 5-12-15-8c-2 5-6 8-14 8s-12-3-14-8z" fill="url(#${a})" stroke="#334155" stroke-width="2.2" stroke-linejoin="round"/><text x="47" y="63" text-anchor="middle" font-family="Teko" font-weight="600" font-size="24" fill="#1e3a8a">10</text>${rot(68,64,.85)}`;};
// containers, coloured by rarity
function crate(r){const R=RAR[r];return()=>{const a=uid(),b=uid();return `<defs>${lg(a,'#d6a16a','#8a5a2b')}${lg(b,R[2],R[3])}</defs>
 <path d="M50 22l30 13v30L50 80 20 65V35z" fill="#5b3a1a"/><path d="M50 22l30 13-30 13-30-13z" fill="#e2b27e" stroke="#4a2e12" stroke-width="2" stroke-linejoin="round"/>
 <path d="M20 35l30 13v32L20 66z" fill="url(#${a})" stroke="#4a2e12" stroke-width="2" stroke-linejoin="round"/><path d="M80 35L50 48v32l30-14z" fill="#9a6532" stroke="#4a2e12" stroke-width="2" stroke-linejoin="round"/>
 <path d="M20 41l30 13M50 54l30-13M20 60l30 13M50 73l30-13" stroke="url(#${b})" stroke-width="7"/><path d="M50 48v32" stroke="url(#${b})" stroke-width="7"/>
 <circle cx="35" cy="57" r="6" fill="#ecfdf5" stroke="#166534" stroke-width="1.5"/><text x="35" y="60.5" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="9" fill="#166534">$</text>`;};}
function chest(r){const R=RAR[r];return()=>{const a=uid(),b=uid();return `<defs>${lg(a,R[2],R[3])}${lg(b,'#fff3a8','#e8a317')}</defs>
 <rect x="18" y="46" width="64" height="32" rx="4" fill="url(#${a})" stroke="#0f172a" stroke-width="2.2"/>
 <path d="M18 46c0-14 10-22 32-22s32 8 32 22z" fill="url(#${a})" stroke="#0f172a" stroke-width="2.2"/>
 <path d="M22 44c1-10 9-16 28-16" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55" fill="none"/>
 <path d="M18 46h64" stroke="url(#${b})" stroke-width="5"/><path d="M30 26v52M70 26v52" stroke="url(#${b})" stroke-width="5"/>
 <rect x="42" y="40" width="16" height="18" rx="3" fill="url(#${b})" stroke="#0f172a" stroke-width="1.8"/><path d="M50 44l1.7 3.4 3.7.5-2.7 2.6.7 3.7-3.4-1.8-3.4 1.8.7-3.7-2.7-2.6 3.7-.5z" fill="#fff" stroke="#b45309" stroke-width="1"/>`;};}
function bag(r){const R=RAR[r];return()=>{const a=uid();return `<defs>${lg(a,R[2],R[3])}</defs>
 <path d="M34 38c0-9 7-14 16-14s16 5 16 14" fill="none" stroke="#0f172a" stroke-width="4"/>
 <path d="M16 46c0-6 4-9 10-9h48c6 0 10 3 10 9v20c0 7-4 11-11 11H27c-7 0-11-4-11-11z" fill="url(#${a})" stroke="#0f172a" stroke-width="2.2"/>
 <path d="M16 54h68" stroke="#fff" stroke-width="3" opacity=".8"/><rect x="40" y="48" width="20" height="12" rx="3" fill="#fff" stroke="#0f172a" stroke-width="1.6"/>
 <path d="M45 54h10M50 50v8" stroke="${R[3]}" stroke-width="2.4" stroke-linecap="round"/><path d="M22 44c3-3 8-3 12-3" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;};}

  C.kRar = RAR;
  C.kArt = { chev, coins, cash, cp, medal, book, xp, medkit, ticket, crate, chest, bag };
  // 1.11.01: Clinic Credit (icon sheet v6, approved 27 Nov): a clipboard with a green + (green = recovery and care; red only for injury)
  C.kClinic = () => { const a = uid(); return `<defs>${lg(a, '#fff', '#dbe3ee')}</defs><rect x="24" y="18" width="52" height="64" rx="7" fill="url(#${a})" stroke="#334155" stroke-width="3"/><rect x="38" y="12" width="24" height="12" rx="4" fill="#94a3b8" stroke="#334155" stroke-width="3"/><path d="M45 38h10v9h9v10h-9v9H45v-9h-9V47h9z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>`; };
  C.kArt.clinic = C.kClinic;
  C.kTile = (r, art, label, qty) => tile(RAR[r] ? r : 'grey', typeof art === 'function' ? art : (() => ''), label, qty);
  // statuses (shaded round badges)
  const badge3=(c1,c2,dk,g)=>{const a=uid();return `<svg class="kst" viewBox="0 0 100 100"><defs><radialGradient id="${a}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><circle cx="50" cy="54" r="40" fill="${dk}"/><circle cx="50" cy="50" r="40" fill="url(#${a})" stroke="#fff" stroke-width="4"/><path d="M26 36a30 30 0 0 1 22-14" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45" fill="none"/>${g}</svg>`;};
const face=(m)=>`<circle cx="38" cy="44" r="5" fill="#fff"/><circle cx="62" cy="44" r="5" fill="#fff"/><path d="${m}" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>`;
const STATUS=[
 ['Injured',badge3('#fca5a5','#dc2626','#991b1b',`<path d="M42 26h16v16h16v16H58v16H42V58H26V42h16z" fill="#fff"/>`)],
 ['Knock',badge3('#fde68a','#f59e0b','#b45309',`<g transform="rotate(-35 50 50)"><rect x="18" y="39" width="64" height="22" rx="11" fill="#fff"/><rect x="40" y="41" width="20" height="18" fill="#fde68a"/></g>`)],
 ['Fit',badge3('#bbf7d0','#22c55e','#15803d',`<path d="M32 51l12 12 24-26" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)],
 ['Yellow card',`<svg class="kst" viewBox="0 0 100 100"><rect x="28" y="16" width="44" height="66" rx="6" fill="#a16207" transform="translate(0 4) rotate(8 50 50)"/><rect x="28" y="16" width="44" height="66" rx="6" fill="#facc15" stroke="#fff" stroke-width="3" transform="rotate(8 50 50)"/></svg>`],
 ['Red card',`<svg class="kst" viewBox="0 0 100 100"><rect x="28" y="16" width="44" height="66" rx="6" fill="#7f1d1d" transform="translate(0 4) rotate(8 50 50)"/><rect x="28" y="16" width="44" height="66" rx="6" fill="#ef4444" stroke="#fff" stroke-width="3" transform="rotate(8 50 50)"/></svg>`],
 ['Substitution',badge3('#bbf7d0','#22c55e','#15803d',`<g transform="translate(50 50) scale(1.9)"><path d="M-9.5-3a10 10 0 0 1 17-5.5l2.5-2.5v8.5H1.5l2.8-2.8A6 6 0 0 0-5.3-3z" fill="#fff"/><path d="M9.5 3a10 10 0 0 1-17 5.5L-10 11V2.5h8.5L-4.3 5.3A6 6 0 0 0 5.3 3z" fill="#fff"/></g>`)],
 ['Morale: good',badge3('#bbf7d0','#22c55e','#15803d',face('M34 60c5 9 11 13 16 13s11-4 16-13'))],
 ['Morale: okay',badge3('#fde68a','#f59e0b','#b45309',face('M36 66h28'))],
 ['Morale: low',badge3('#fca5a5','#ef4444','#991b1b',face('M34 72c5-9 11-12 16-12s11 3 16 12'))],
 ['Locked',badge3('#e2e8f0','#64748b','#334155',`<rect x="30" y="46" width="40" height="30" rx="5" fill="#fff"/><path d="M38 46v-8a12 12 0 0 1 24 0v8" stroke="#fff" stroke-width="7" fill="none"/><rect x="47" y="55" width="6" height="11" rx="3" fill="#64748b"/>`)],
];
  // building tap ring glyphs (24-unit, white), from the approved ring
  const RW = 'fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  C.kRingG = {
    info: `<circle cx="12" cy="6.6" r="2.3" fill="#fff"/><rect x="10.1" y="10" width="3.8" height="9" rx="1.6" fill="#fff"/>`,
    up: `<path d="M12 3.8l7.2 7.4h-4.4v8.4H9.2v-8.4H4.8z" fill="#fff" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>`,
    speed: `<path d="M3.6 5.4l8 6.6-8 6.6zM12 5.4l8 6.6-8 6.6z" fill="#fff" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>`,
    train: `<path d="M12 5l5 13H7z" fill="#fff"/><path d="M8.6 14h6.8" stroke="#e8772e" stroke-width="1.6"/><path d="M5 18.5h14" ${RW}/>`,
    book: `<path d="M5 6.5c2.5-1.2 4.7-1.2 7 0v11c-2.3-1.2-4.5-1.2-7 0zM12 6.5c2.3-1.2 4.5-1.2 7 0v11c-2.5-1.2-4.7-1.2-7 0z" fill="#fff"/>`,
    recruit: `<circle cx="7" cy="9.2" r="2" fill="#fff" opacity=".8"/><circle cx="17" cy="9.2" r="2" fill="#fff" opacity=".8"/><path d="M3.5 17c.3-2.6 1.6-4 3.5-4s3.2 1.4 3.5 4zM13.5 17c.3-2.6 1.6-4 3.5-4s3.2 1.4 3.5 4z" fill="#fff" opacity=".8"/><circle cx="12" cy="8" r="2.7" fill="#fff"/><path d="M7.4 19c.4-3.5 2.2-5.5 4.6-5.5s4.2 2 4.6 5.5z" fill="#fff"/>`,
    med: `<path d="M10 5.5h4v4.5h4.5v4H14v4.5h-4V14H5.5v-4H10z" fill="#fff"/>`,
    staff: `<path d="M3.5 15.5c0-5.4 3.1-8.7 7.4-8.7s6.8 3.2 7 8.7z" fill="#fff"/><path d="M15 13.4c2.5-.3 4.8.2 6 1.4.3.4 0 .8-.5.8H14.5z" fill="#fff"/>`,
    kit: `<path d="M8.5 5.5L5 7.5l1.5 3.5 2-1V18.5h7V10l2 1L19 7.5l-3.5-2c-.6 1.4-2 2.2-3.5 2.2S9.1 6.9 8.5 5.5z" fill="#fff"/>`,
    report: `<rect x="5" y="5" width="14" height="14" rx="2" fill="#fff"/><path d="M8 15.5v-3M11 15.5v-6M14 15.5v-4.5M17 15.5V8" stroke="#e8772e" stroke-width="1.8" stroke-linecap="round"/>`,
  };
  C.kRingCol = { blue: '#3b82f6', orange: '#e8772e', green: '#22c55e', lgreen: '#4ade80' };
  C.kStatus = Object.fromEntries(STATUS.map(([n, s]) => [n, s]));
})(window.CFC);
