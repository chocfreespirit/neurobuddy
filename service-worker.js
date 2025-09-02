const CACHE = "neurobuddy-v1";
const ASSETS = [
  "/neurobuddy/",
  "/neurobuddy/index.html",
  "/neurobuddy/manifest.json",
  "/neurobuddy/icons/icon-192.png",
  "/neurobuddy/icons/icon-512.png"
];

// Install: pre-cache core files
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, then network; cache cross-origin too (opaque OK)
self.addEventListener("fetch", (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => cached); // fallback if offline and not cached yet
    })
  );
});
