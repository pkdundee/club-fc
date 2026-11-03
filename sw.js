// Club FC offline cache. Bump VERSION when you publish a new build.
const PREFIX = 'clubfc2-p9k';
const VERSION = 'clubfc2-p9k-net1';
const FILES = ['./', './index.html', './manifest.webmanifest', './css/style.css',
  './js/util.js', './js/data.js', './js/art-scenes.js', './img/manifest.json', './js/state.js', './js/build.js', './js/names.js', './js/art-faces.js', './js/players.js', './js/squad.js', './js/recruit.js', './js/engine.js', './js/season.js', './js/tactics.js', './js/match.js', './js/staff.js', './js/playbook.js', './js/career.js', './js/liveops.js', './js/medical.js', './js/home.js', './js/art-campus.js', './js/ui.js', './js/jobs.js', './js/help.js', './js/ad.js', './js/screens.js', './js/meta.js', './js/map.js', './js/progress.js', './js/gear.js', './js/main.js',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

// Network first, so a new upload shows up as soon as the page is opened online.
// The cache is only the offline fallback. Each build only touches its own caches (several builds can share a github.io address).
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' })
    .then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true }))));
});
