var CACHE = 'hardik-pandey-v1';
var URLS = [
  '/',
  '/about.html',
  '/projects.html',
  '/profiles.html',
  '/cloud.html',
  '/contact.html',
  '/404.html',
  '/roles/cyber.html',
  '/roles/ml.html',
  '/css/tokens.css',
  '/css/components.css',
  '/css/layout.css',
  '/css/animations.css',
  '/css/carousel.css',
  '/js/shared.js',
  '/js/main.js',
  '/js/data.js',
  '/js/cloud-badges.js',
  '/js/cloud-bg.js',
  '/js/cloud-globe.js',
  '/js/cyber-globe.js',
  '/js/ml-network.js',
  '/js/ml-pipeline.js',
  '/js/visitor-info.js',
  '/assets/fonts/dm-sans.woff2',
  '/assets/fonts/syne.woff2',
  '/assets/fonts/jetbrains-mono.woff2',
  '/assets/fonts/honk.woff2',
  '/images/light_theme_profile.webp',
  '/images/dark_theme_profile.webp',
  '/images/og-image.png',
  '/images/light_theme_profile.png',
  '/images/dark_theme_profile.png',
  '/favicon.svg',
  '/privacy.html',
  '/terms.html',
  '/manifest.json',
  '/js/particle-hero-widget.js',
  '/css/particle-hero-widget.css'
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
      return hit || fetch(e.request);
    })
  );
});
