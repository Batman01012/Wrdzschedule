/* Wardy Qudrat PWA - Service Worker for GitHub Pages */
const VERSION = 'wardy-v1.0.0';
const CACHE_NAME = `${VERSION}-shell`;

/* List everything needed to run offline (app shell) */
const APP_SHELL = [
  './',               // index.html
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

/* Install: cache the app shell */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

/* Activate: clean old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => !k.startsWith(VERSION))
        .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* Fetch strategy:
   - Navigation requests: network-first, fall back to cached index.html
   - Same-origin GET assets: cache-first, then network (and cache fresh copy)
*/
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET & same-origin
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) {
    return;
  }

  // Handle navigations (SPA-style offline)
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          // Optionally: cache the fresh index
          const cache = await caches.open(CACHE_NAME);
          cache.put('./index.html', fresh.clone());
          return fresh;
        } catch {
          // Offline fallback
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match('./index.html')) ||
                 (await cache.match('./')) ||
                 new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        // cache a copy if ok
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
