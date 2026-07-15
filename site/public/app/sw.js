/* Mini Basket service worker — network-first for egne assets, offline fallback kun for navigationer */
const CACHE = 'minibasket-v9';
const ASSETS = ['./', './app.js', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Rør aldrig cross-origin requests (Supabase API, CDN, fonts) — lad browseren håndtere dem
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then((r) => {
          if (r) return r;
          // Index-fallback KUN for sidenavigationer — aldrig for data/asset-requests
          if (req.mode === 'navigate') return caches.match('./');
          return Response.error();
        })
      )
  );
});
