var CACHE = 'hardik-pandey';
var URLS = [
  '/', '/index.html',
  '/about.html', '/projects.html', '/profiles.html',
  '/cloud.html', '/contact.html', '/404.html',
  '/privacy.html', '/terms.html',
  '/roles/cyber.html', '/roles/ml.html',
  '/manifest.json',
  '/icons/icon-192x192.png', '/icons/icon-512x512.png',
  '/favicon.svg',
  '/images/og-image.webp'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(URLS);
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      var fetchPromise = fetch(e.request).then(function (resp) {
        if (resp && resp.ok)
          caches.open(CACHE).then(function (cache) { cache.put(e.request, resp.clone()); });
        return resp;
      }).catch(function () {});
      return hit || fetchPromise;
    })
  );
});
