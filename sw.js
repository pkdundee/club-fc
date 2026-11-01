// Club FC offline cache. Bump VERSION when you publish a new build.
const VERSION = 'clubfc2-p9-h';
const FILES = ['./', './index.html', './manifest.webmanifest', './css/style.css',
  './js/util.js', './js/data.js', './js/art-scenes.js', './img/manifest.json', './js/state.js', './js/build.js', './js/names.js', './js/art-faces.js', './js/players.js', './js/squad.js', './js/recruit.js', './js/engine.js', './js/season.js', './js/tactics.js', './js/match.js', './js/staff.js', './js/playbook.js', './js/career.js', './js/liveops.js', './js/art-campus.js', './js/ui.js', './js/jobs.js', './js/help.js', './js/ad.js', './js/screens.js', './js/main.js',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Serve from cache straight away, refresh the cache in the background.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
