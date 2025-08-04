// Service Worker for Smart Orientation App
const CACHE_NAME = 'smart-orientation-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  './index.html',
  '/src/css/main.css',
  './src/css/main.css',
  '/src/js/app.js',
  './src/js/app.js',
  '/src/assets/service-worker.js',
  './src/assets/service-worker.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle favicon requests
  if (url.pathname === '/favicon.ico') {
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📱</text></svg>`;
    return event.respondWith(
      new Response(svgIcon, {
        headers: { 'Content-Type': 'image/svg+xml' }
      })
    );
  }
  
  // Ignore Chrome DevTools requests
  if (url.pathname.includes('.well-known/appspecific/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return empty response for failed requests
        return new Response('', { status: 404 });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 