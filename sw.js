// Club FC offline cache. Bump VERSION when you publish a new build.
const PREFIX = 'clubfc-v110';
const VERSION = 'clubfc-v110-net1';
const FILES = ['./', './index.html', './manifest.webmanifest', './css/style.css',
  './js/errbar.js', './js/util.js', './js/economy-config.js', './js/data.js', './js/art-scenes.js', './img/manifest.json', './js/speedup.js', './js/cpass.js', './js/testscen.js', './js/cycle.js', './js/b109.js', './js/program.js', './js/state.js', './js/build.js', './js/names.js', './js/art-faces.js', './js/players.js', './js/squad.js', './js/recruit.js', './js/engine.js', './js/season.js', './js/tactics.js', './js/match.js', './js/staff.js', './js/playbook.js', './js/career.js', './js/liveops.js', './js/medical.js', './js/home.js', './js/icons.js', './js/campus-meta.js', './js/campus-env.js', './js/stadium-paint.js', './js/tower-paint.js', './js/art-campus.js', './js/ui.js', './js/jobs.js', './js/help.js', './js/ad.js', './js/screens.js', './js/meta.js', './js/map.js', './js/progress.js', './js/gear.js', './js/academic.js', './js/levelup.js', './js/research.js', './js/main.js',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

// Network first, so a new upload shows up as soon as the page is opened online.
// The cache is only the offline fallback. Each build only touches its own caches (several builds can share a github.io address).
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 1.02.05 (QA-14): art (images and fonts) is served from this build's cache straight away, and refreshed in the background.
// A build's art never changes inside a build, and every new revision changes VERSION, which clears the old cache.
// Code and pages stay network-first, so an upload still shows at once.
const ART = /\.(webp|png|jpe?g|gif|svg|woff2?)$/i;
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  if (ART.test(new URL(e.request.url).pathname)) {
    e.respondWith(caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
      if (hit) { e.waitUntil(net.catch(() => { })); return hit; }
      return net;
    })));
    return;
  }
  e.respondWith(fetch(e.request, { cache: 'no-cache' })
    .then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true }))));
});
