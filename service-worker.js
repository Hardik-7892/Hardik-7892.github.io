/* Hardik Pandey PWA — stale-while-revalidate with full offline shell.
   Same-origin GET only; hero models are revalidated, not precached. */
var CACHE = 'hardik-pandey-v3';

var URLS = [
  '/', '/index.html', '/about.html', '/experience.html', '/projects.html', '/profiles.html',
  '/cloud.html', '/contact.html', '/roles.html', '/404.html', '/privacy.html', '/terms.html',
  '/roles/cyber.html', '/roles/ml.html', '/roles/software.html',
  '/css/tokens.css', '/css/components.css', '/css/layout.css', '/css/animations.css',
  '/css/carousel.css', '/css/particle-hero-widget.css', '/css/roles.css',
  '/js/theme-init.js', '/js/data.js', '/js/shared.js', '/js/main.js', '/js/page-init.js',
  '/js/experience.js', '/js/roles.js',
  '/js/3d-loader.js', '/js/cloud-badges.js', '/js/cloud-bg.js', '/js/cloud-globe.js',
  '/js/cyber-globe.js', '/js/ml-network.js', '/js/ml-pipeline.js',
  '/js/particle-hero-mount.js', '/js/particle-hero-widget.js',
  '/js/visitor-info.js', '/js/gc-count.js',
  '/assets/fonts/dm-sans.woff2', '/assets/fonts/honk.woff2',
  '/assets/fonts/jetbrains-mono.woff2', '/assets/fonts/syne.woff2',
  '/images/og-image.webp', '/images/light_theme_profile.webp',
  '/images/light_theme_profile.png', '/images/dark_theme_profile.webp',
  '/manifest.json', '/favicon.svg',
  '/icons/icon-192x192.png', '/icons/icon-512x512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(URLS.map(function (u) {
        return cache.add(u).catch(function () {});
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(Promise.all([
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    }),
    self.clients.claim(),
    self.registration.navigationPreload.enable().catch(function () {})
  ]));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request).then(function (hit) {
      var preload = (e.preloadResponse || Promise.resolve(null)).catch(function () { return null; });
      var network = preload.then(function (pre) {
        if (pre && pre.ok) return pre;
        return fetch(e.request);
      }).then(function (resp) {
        if (resp && resp.ok) {
          var clone = resp.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(e.request, clone).catch(function () {});
          }).catch(function () {});
        }
        return resp;
      }).catch(function () {
        if (e.request.mode === 'navigate') return caches.match('/index.html');
        return Response.error();
      });

      if (hit) {
        network.catch(function () {});
        return hit;
      }
      return network;
    })
  );
});
