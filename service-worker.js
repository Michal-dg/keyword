const CACHE_NAME = 'keyword-cache-v1';
// Lista plików do przechowania w cache
const urlsToCache = [
  '/',
  '/index.html',
  '/words_db_en.js',
  '/stories_db_en.js',
  '/images/default-header.jpg',
  '/images/default-card-bg.jpg',
  'https://cdn.tailwindcss.com' // Możesz też cache'ować zasoby z CDN
];

// Instalacja Service Workera i dodanie plików do cache
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Obsługa zapytań - najpierw szukaj w cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jeśli zasób jest w cache, zwróć go
        if (response) {
          return response;
        }
        // W przeciwnym razie, pobierz z sieci
        return fetch(event.request);
      }
    )
  );
});