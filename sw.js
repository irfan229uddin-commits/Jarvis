// Service worker: basic precache + runtime caching for audio
const CACHE = 'jarvis-static-v1';
const PRECACHE_URLS = ['/', '/index.html', '/app.js', '/manifest.json', '/icons/icon-192.svg', '/icons/icon-512.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE_URLS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  // Serve same-origin GET requests from cache first
  if (req.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then(res => res || fetch(req).then(fetchRes => {
      // cache documents and scripts
      if (['document','script','style','image'].includes(req.destination)) {
        const copy = fetchRes.clone(); caches.open(CACHE).then(c => c.put(req, copy));
      }
      return fetchRes;
    })).catch(()=>caches.match('/index.html')));
  }
});
