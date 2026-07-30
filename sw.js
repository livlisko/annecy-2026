/* =====================================================================
   Annecy 2026 — service worker.
   Precaches the app shell + all trip data so the itinerary, lodging,
   flights and activity list work with no signal. The live Leaflet map
   needs network tiles and is NOT claimed to work offline — the Map
   screen falls back to an offline place list instead.
   ===================================================================== */
const VERSION = 'a26-v20';
const CORE = 'core-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;

// The critical shell + data + lodging imagery, available fully offline.
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css?v=20',
  './data.js?v=20',
  './app.js?v=20',
  './manifest.webmanifest',
  './assets/fonts/inter-latin.woff2',
  './assets/fonts/inter-latin-ext.woff2',
  './assets/fonts/fraunces-latin.woff2',
  './assets/fonts/fraunces-latin-ext.woff2',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/wiki/hero-lake.jpg',
  './assets/wiki/forclaz.jpg',
  './assets/wiki/lake-swim.jpg',
  './assets/wiki/duingt.jpg',
  './assets/wiki/lake-beach.jpg',
  './assets/wiki/annecy-market.jpg',
  './assets/wiki/glieres.jpg',
  './assets/wiki/lake-sunset.jpg',
  './assets/wiki/les-gets-mtb.jpg',
  './assets/wiki/veyrier.jpg',
  './assets/art/annecy-twilight-v3.jpg',
  './assets/art/annecy-waterfront-v3.jpg',
  './assets/orientation/orientation_relief_card.jpg'
];

self.addEventListener('install', (e) => {
  // Cache the core; don't fail the whole install if one optional asset 404s.
  e.waitUntil(
    caches.open(CORE).then((c) => Promise.all(
      CORE_ASSETS.map((u) => c.add(u).catch(() => {}))
    ))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CORE && k !== RUNTIME).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Let the page trigger an immediate update when the user taps "Refresh".
self.addEventListener('message', (e) => {
  if (e.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigations → app shell (hash routing means one document offline too).
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // Same-origin app code/data/images: cache-first, then network (and cache).
  if (sameOrigin) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(RUNTIME).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // Self-hosted fonts are same-origin; Leaflet CDN is stale-while-revalidate
  // so a repeat map visit is quick. Map TILES are deliberately not cached.
  if (/unpkg\.com/.test(url.host)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
