/* ==========================================================================
   Service Worker — Maraluxe Bar Menu
   Strategy: Cache-First, Network-Fallback with Dynamic Font Caching
   ========================================================================== */

const CACHE_NAME = 'maraluxe-bar-menu-v1';

const APP_SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './assets.js',
  './menu-data.js',
  './app.js'
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

  event.respondWith(
    caches.match(request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(function (networkResponse) {
        if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0)) {
          return networkResponse;
        }

        const isSameOrigin = url.origin === self.location.origin;
        const isGoogleFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

        if (isSameOrigin || isGoogleFont) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(function (fetchError) {
        // Fallback for HTML page navigation when offline
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        throw fetchError;
      });
    })
  );
});
