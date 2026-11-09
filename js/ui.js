// Club FC: pop-ups with a back history (Q10, Q17), centred modals and toasts.
(function (C) {
  const stack = [];   // [{title, render, mode: 'page' | 'popup' | 'modal', sc}]
  C.ui = {};
  // Round 6: every area is its own page (a Back arrow replaces the bottom menu). Small choices are popups, which sit
  // between the header and footer and leave both clear. Nothing slides up over the footer.
  const POPUPS = new Set(['Use a speed-up', 'Building Queue', 'Buildings', 'Release player', 'Delete a career', 'Delete all data', 'Signed!', 'Research', 'Choose player', 'New job', 'Keep a player', 'Staff on duty']);
  const modeOf = (title, opts) => { const pop = C.ui.asPopup; C.ui.asPopup = false; return opts.modal ? 'modal' : opts.popup || pop || POPUPS.has(title) ? 'popup' : 'page'; };

  // Open a page or popup. render() returns its body HTML and is re-run on refresh (live timers).
  C.ui.open = (title, render, opts = {}) => {
    stack.push({ title, render, mode: modeOf(title, opts) });
    try { history.pushState({ cfcSheet: stack.length }, ''); } catch (e) { /* file:// */ }
    draw();
  };
  // Replace the top one (used when one step leads to the next without a back step)
  C.ui.replace = (title, render, opts = {}) => { stack.pop(); stack.push({ title, render, mode: modeOf(title, opts) }); draw(); };
  C.ui.back = () => { if (!stack.length) return; stack.pop(); draw(true); };
  C.ui.closeAll = () => { stack.length = 0; draw(); };
  // close everything above the named page
  C.ui.popTo = title => { while (stack.length > 1 && stack[stack.length - 1].title !== title) stack.pop(); draw(true); };
  C.ui.isOpen = () => stack.length > 0;
  C.ui.refresh = () => { if (stack.length) draw(true); };

  const res = () => C.car && C.car() && C.resBar ? `<div class="res hres pgres">${C.resBar()}</div>` : '';
  const pageHTML = e => `<div class="page"><div class="pghd"><b>${C.esc(e.title)}</b>${res()}</div><div class="pgbody sbody">${e.render()}</div>
    <div class="pgft"><button class="backarrow" data-act="back" aria-label="Back"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M11 4 3 12l8 8v-5h10V9H11z" fill="#fff"/></svg></button></div></div>`;
  const popHTML = e => e.mode === 'modal' ? `<div class="pop-bg" data-act="bgclose">${e.render()}</div>`
    : `<div class="pop-bg" data-act="bgclose"><div class="pop"><div class="pophd"><b>${C.esc(e.title)}</b><button class="xbtn2" data-act="back" aria-label="Close">✕</button></div><div class="popbody sbody">${e.render()}</div></div></div>`;
  function draw(keep) {
    const host = C.$('#layer');
    // remember scroll positions, so timers and returning from a popup never jump the page
    const pgNow = host.querySelector('.pgbody'), popNow = host.querySelector('.popbody,.uc'), pgE = host._pg, popE = host._pop;
    if (pgNow && pgE) pgE.sc = pgNow.scrollTop; if (popNow && popE) popE.sc = popNow.scrollTop;
    if (!stack.length) { host.innerHTML = ''; host._pg = host._pop = null; return; }
    const top = stack[stack.length - 1]; let page = null;
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i].mode === 'page') { page = stack[i]; break; }
    const pop = top.mode === 'page' ? null : top;
    host.className = keep ? 'noanim' : '';   // only animate on first open: a refresh must not flash
    host.innerHTML = (page ? pageHTML(page) : '') + (pop ? popHTML(pop) : '');
    host._pg = page; host._pop = pop;
    const pg = host.querySelector('.pgbody'), pp = host.querySelector('.popbody,.uc');
    if (pg && page) pg.scrollTop = page.sc || 0; if (pp && pop) pp.scrollTop = pop.sc || 0;
  }

  // Android Back / browser back closes the top pop-up
  window.addEventListener('popstate', () => { if (stack.length) { stack.pop(); draw(true); } });

  let tt;
  // Nothing spends on a single tap: preview what it does and what it costs, then confirm (playtest round 3)
  C.confirm = (title, body, label, act, v) => C.ui.open(title, () => `${body}<div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Cancel</button><button class="btn pri" data-act="${act}" data-v="${C.esc(v)}" data-ok="1">${label}</button></div>`, { popup: true });
  C.toast = msg => {
    let t = C.$('#toast'); if (t) t.remove();
    C.$('#app').insertAdjacentHTML('beforeend', `<div id="toast">${msg}</div>`);
    clearTimeout(tt); tt = setTimeout(() => { const n = C.$('#toast'); if (n) n.remove(); }, 2400);
  };
})(window.CFC);
