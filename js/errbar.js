// Club FC: on-screen error banner (9s, FEEDBACK 101). Any script error shows as a small red bar with the message and where it
// happened, so faults that only happen on a phone can be screenshotted. Tap the bar to hide it.
(function () {
  if (navigator.standalone) document.documentElement.classList.add('standalone');   // older iPhones: home-screen app without display-mode
  const seen = new Set();
  function show(msg, where) {
    const key = msg + where; if (seen.has(key)) return; seen.add(key);
    const go = () => { let bar = document.getElementById('errbar');
      if (!bar) { bar = document.createElement('div'); bar.id = 'errbar'; bar.addEventListener('click', () => bar.remove()); document.body.appendChild(bar); }
      const row = document.createElement('div'); row.textContent = '⚠ ' + msg + (where ? '  (' + where + ')' : ''); bar.appendChild(row); };
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
  }
  addEventListener('error', e => show(e.message || 'Error', e.filename ? e.filename.split('/').pop() + ':' + e.lineno : ''));
  addEventListener('unhandledrejection', e => show(String(e.reason && e.reason.message || e.reason), 'promise'));
  window.CFC_showError = show;
})();
