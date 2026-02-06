const CACHE_NAME = 'aac-comunicador-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activar service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Si falla el fetch, intentar cargar desde cache o retornar error
          return caches.match('/index.html');
        });
      })
      .catch(() => {
        // Manejar errores de cache
        return new Response('Offline', { status: 503 });
      })
  );
});
