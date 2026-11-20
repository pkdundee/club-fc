// Club FC: two-tone outlined icons for the main screen buttons (9q, FEEDBACK 75). Our own simple drawings: white shapes
// with a dark outline and a light second tone, drawn as SVG so they stay crisp at any size.
(function (C) {
  const O = 'stroke="#0f172a" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';
  const P = {
    hammer: `<path d="M4 20l8.5-8.5" ${O} stroke-width="3.6"/><path d="M4 20l8.5-8.5" stroke="#fde68a" stroke-width="1.6" stroke-linecap="round"/><path d="M10 5.5l3-2.5 6.5 6.5-2.5 3-2-2-1.5 1.5-3.5-3.5 1.5-1.5z" fill="#fff" ${O}/>`,
    list: `<rect x="4" y="3.5" width="16" height="17" rx="2.5" fill="#fff" ${O}/><path d="M8 8.5h8M8 12h8M8 15.5h5" ${O}/>`,
    book: `<path d="M4 5.5c3-1.5 5.5-1.5 8 0v14c-2.5-1.5-5-1.5-8 0z" fill="#fff" ${O}/><path d="M12 5.5c2.5-1.5 5-1.5 8 0v14c-3-1.5-5.5-1.5-8 0z" fill="#dbeafe" ${O}/>`,
    mail: `<rect x="3" y="6" width="18" height="13" rx="2" fill="#fff" ${O}/><path d="M3.5 7l8.5 6.5L20.5 7" fill="#dbeafe" ${O}/>`,
    bag: `<path d="M5 9h14l-1.2 11H6.2z" fill="#fff" ${O}/><path d="M9 9V7a3 3 0 0 1 6 0v2" fill="none" ${O}/><rect x="9.5" y="12.5" width="5" height="3" rx="1" fill="#fde68a" ${O}/>`,
    help: `<circle cx="12" cy="12" r="9" fill="#fff" ${O}/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.6.3-.9.8-.9 1.4v.6" fill="none" ${O}/><circle cx="12" cy="17" r="1" fill="#0f172a"/>`,
    gift: `<rect x="4" y="10" width="16" height="10" rx="1.5" fill="#fff" ${O}/><rect x="3" y="7" width="18" height="4" rx="1" fill="#fde68a" ${O}/><path d="M12 7v13" ${O}/><path d="M12 7c-1.5-3-5-3-5-1s3.5 1 5 1c1.5 0 5 1 5-1s-3.5-2-5 1z" fill="#fff" ${O}/>`,
    cal: `<rect x="4" y="5" width="16" height="15" rx="2" fill="#fff" ${O}/><rect x="4" y="5" width="16" height="4.5" rx="2" fill="#fca5a5" ${O}/><path d="M8 3.5v3M16 3.5v3" ${O}/><path d="M8 13h2M12 13h2M8 16.5h2" ${O}/>`,
    door: `<rect x="6" y="3.5" width="12" height="17" rx="1.5" fill="#fff" ${O}/><circle cx="14.6" cy="12.5" r="1.1" fill="#0f172a"/>`,
    cart: `<path d="M3 4.5h2.5l2 10h10l2-7H7" fill="none" ${O}/><path d="M7.5 14.5h10l2-7H6.2z" fill="#fff" ${O}/><circle cx="9" cy="18.5" r="1.6" fill="#fff" ${O}/><circle cx="16.5" cy="18.5" r="1.6" fill="#fff" ${O}/>`,
    clip: `<rect x="5" y="4.5" width="14" height="17" rx="2.5" fill="#fff" ${O}/><rect x="8.5" y="2.5" width="7" height="4" rx="1.2" fill="#bae6fd" ${O}/><path d="M8.5 13.5l2.5 2.5 4.8-5" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    radio: `<path d="M10 2.5v4" ${O}/><rect x="6.5" y="6" width="11" height="15" rx="2.5" fill="#fff" ${O}/><rect x="9" y="8.5" width="6" height="4" rx="1" fill="#bae6fd" ${O}/><path d="M9 15.5h6M9 18h6" ${O}/>`,
    target: `<circle cx="12" cy="12" r="8.5" fill="#fff" ${O}/><circle cx="12" cy="12" r="5" fill="#fecaca" ${O}/><circle cx="12" cy="12" r="1.8" fill="#0f172a"/>`
  };
  // 1.02 (FEEDBACK 145, 147, 169): ONE present image everywhere: the task bar's 🎁. Change it here to change it everywhere.
  C.giftIco = (s = 18) => `<span class="gifti" style="font-size:${s}px" aria-hidden="true">🎁</span>`;
  // the same present on the campus map (SVG): a soft halo so it reads on any ground, then the 🎁 itself
  C.giftSVG = (r = 12) => `<circle r="${r}" fill="#fff" fill-opacity=".9" stroke="#0f172a" stroke-width="2"/><text y="${(r * .38).toFixed(1)}" text-anchor="middle" font-size="${(r * 1.35).toFixed(1)}">🎁</text>`;
  // 1.02 (FEEDBACK 150): points-track chests. Not reached: grey and closed. Ready: colored and closed. Claimed: open, empty, with a tick.
  C.chestSVG = (state, s = 30) => { const g = state === 'idle', wood = g ? '#94a3b8' : '#b45309', band = g ? '#cbd5e1' : '#fbbf24', O = 'stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"';
    const body = `<rect x="4" y="13" width="24" height="13" rx="2" fill="${wood}" ${O}/><rect x="4" y="17" width="24" height="3" fill="${band}" ${O}/>`;
    if (state !== 'open') return `<svg viewBox="0 0 32 30" width="${s}" height="${s * 30 / 32}" aria-hidden="true">${body}<g class="lid"><path d="M4 13v-3a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v3z" fill="${wood}" ${O}/><rect x="13.5" y="10" width="5" height="6" rx="1" fill="${band}" ${O}/></g></svg>`;
    return `<svg viewBox="0 0 32 30" width="${s}" height="${s * 30 / 32}" aria-hidden="true"><path d="M5 13h22v3H5z" fill="#3f2a14"/>${body}<g class="lid"><path d="M5 12l2-9a4 4 0 0 1 4-3h10a4 4 0 0 1 4 3l2 9z" fill="${wood}" ${O}/></g><circle cx="25" cy="23" r="5.5" fill="#16a34a" stroke="#fff" stroke-width="1.5"/><path d="M22.6 23l1.7 1.7 3.2-3.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`; };
  C.ico = (n, s = 24) => n === 'gift' ? C.giftIco(Math.round(s * .9)) : `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n] || ''}</svg>`;
})(window.CFC);
