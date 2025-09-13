// Nazwa pamięci podręcznej (cache) - zmień ją, gdy aktualizujesz pliki
const CACHE_NAME = 'keyword-cache-v2';

// Lista plików, które mają być zapisane w pamięci podręcznej
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/words_db_en.js',
  '/stories_db_en.js',
  '/icons/icon-192x192.png',
  '/images/default-header.jpg',
  '/images/default-card-bg.jpg',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Instalacja Service Workera i zapisanie plików w pamięci podręcznej
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const cachePromises = urlsToCache.map(urlToCache => {
          // WAŻNA ZMIANA: Dodajemy { mode: 'no-cors' } dla zasobów z innych domen
          const request = new Request(urlToCache, { mode: 'no-cors' });
          return fetch(request).then(response => cache.put(request, response));
        });
        return Promise.all(cachePromises);
      })
  );
});

// Aktywacja Service Workera i usuwanie starych pamięci podręcznych
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Przechwytywanie zapytań sieciowych
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jeśli zasób jest w pamięci podręcznej, zwróć go
        if (response) {
          return response;
        }
        // W przeciwnym razie, pobierz z sieci
        return fetch(event.request);
      }
    )
  );
});