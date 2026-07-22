/* Lac d'Annecy — service worker. App-shell cache for offline + fast loads. */
const VERSION = 'a26-v8';
const CORE = 'core-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;

const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './app.js',
  './manifest.webmanifest',
  './assets/fonts/inter-latin.woff2',
  './assets/fonts/inter-latin-ext.woff2',
  './assets/fonts/fraunces-latin.woff2',
  './assets/fonts/fraunces-latin-ext.woff2',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/wiki/hero-lake.jpg',
  './assets/orientation/orientation_relief_card.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CORE).then((c) => c.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CORE && k !== RUNTIME).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigations: serve the app shell (hash routing means one document).
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Same-origin static: cache-first, then network (and cache the result).
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

  // Fonts + Leaflet CDN: stale-while-revalidate. (Skip map tiles to avoid bloat.)
  if (/fonts\.(googleapis|gstatic)\.com|unpkg\.com/.test(url.host)) {
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
