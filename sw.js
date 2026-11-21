/* ==========================================================================
   Service Worker — Maraluxe Bar Menu
   Strategy: Cache-First, Network-Fallback with Dynamic Font Caching
   ========================================================================== */

const CACHE_NAME = 'maraluxe-bar-menu-v2';

const APP_SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './assets.js',
  './menu-data.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// Pre-cache core application shell during install
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL_FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// Purge outdated cache versions and claim immediate control
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Cache-First, Network-Fallback fetch handler
self.addEventListener('fetch', function (event) {
  const request = event.request;

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Ignore non-http/https schemes (e.g. chrome-extension://)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (!isSameOrigin && !isGoogleFont) {
    return;
  }

  // Same-origin (menu, prices, scripts): network-first so price updates show immediately,
  // falling back to cache when offline. Fonts: cache-first.
  const networkFirst = isSameOrigin;

  function fetchAndCache() {
    return fetch(request).then(function (networkResponse) {
      if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, responseToCache);
        });
      }
      return networkResponse;
    });
  }

  event.respondWith(
    networkFirst
      ? fetchAndCache().catch(function (fetchError) {
          return caches.match(request).then(function (cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            throw fetchError;
          });
        })
      : caches.match(request).then(function (cachedResponse) {
          return cachedResponse || fetchAndCache();
        })
  );
});