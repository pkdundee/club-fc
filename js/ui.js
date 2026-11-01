// Club FC: pop-ups with a back history (Q10, Q17), centred modals and toasts.
(function (C) {
  const stack = [];   // [{title, render, modal}]
  C.ui = {};

  // Open a pop-up. render() returns its body HTML and is re-run on refresh (live timers).
  C.ui.open = (title, render, opts = {}) => {
    stack.push({ title, render, modal: !!opts.modal });
    try { history.pushState({ cfcSheet: stack.length }, ''); } catch (e) { /* file:// */ }
    draw();
  };
  // Replace the top pop-up (used when one step leads to the next without a back step)
  C.ui.replace = (title, render, opts = {}) => { stack.pop(); stack.push({ title, render, modal: !!opts.modal }); draw(); };
  C.ui.back = () => { if (!stack.length) return; stack.pop(); draw(); };
  C.ui.closeAll = () => { stack.length = 0; draw(); };
  C.ui.isOpen = () => stack.length > 0;
  C.ui.refresh = () => { if (stack.length) draw(true); };

  function draw(keepScroll) {
    const host = C.$('#layer');
    const prev = host.querySelector('.sheet,.uc');
    const top = keepScroll && prev ? prev.scrollTop : 0;
    if (!stack.length) { host.innerHTML = ''; return; }
    const cur = stack[stack.length - 1];
    if (cur.modal) {
      host.innerHTML = `<div class="modal-bg" data-act="bgclose">${cur.render()}</div>`;
    } else {
      host.innerHTML = `<div class="sheet-bg" data-act="bgclose"><div class="sheet">
        <div class="grab"></div>
        <div class="shdr">${stack.length > 1 ? '<button data-act="back">‹ Back</button>' : '<span class="ph"></span>'}
          <span class="t">${C.esc(cur.title)}</span><button class="x" data-act="close" aria-label="Close">✕</button></div>
        <div class="sbody">${cur.render()}</div></div></div>`;
      swipeToClose(host.querySelector('.sheet'));
    }
    if (keepScroll) { const n = host.querySelector('.sheet,.uc'); if (n) n.scrollTop = top; }
  }

  // Swipe down on the grab bar or header to go back
  function swipeToClose(el) {
    let y0 = null;
    const zone = [el.querySelector('.grab'), el.querySelector('.shdr')];
    zone.forEach(z => z && z.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, { passive: true }));
    el.addEventListener('touchmove', e => { if (y0 == null) return; const dy = e.touches[0].clientY - y0; if (dy > 0) el.style.transform = `translateY(${dy}px)`; }, { passive: true });
    el.addEventListener('touchend', e => { if (y0 == null) return; const dy = (e.changedTouches[0].clientY - y0); y0 = null; el.style.transform = ''; if (dy > 90) C.ui.back(); });
  }

  // Android Back / browser back closes the top pop-up
  window.addEventListener('popstate', () => { if (stack.length) { stack.pop(); draw(); } });

  let tt;
  C.toast = msg => {
    let t = C.$('#toast'); if (t) t.remove();
    C.$('#app').insertAdjacentHTML('beforeend', `<div id="toast">${msg}</div>`);
    clearTimeout(tt); tt = setTimeout(() => { const n = C.$('#toast'); if (n) n.remove(); }, 2400);
  };
})(window.CFC);
