// Service Worker for Smart Orientation App - Production Version
const CACHE_NAME = 'smart-orientation-app-v1.0';
const STATIC_CACHE = 'static-v1.0';
const DYNAMIC_CACHE = 'dynamic-v1.0';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/css/main.css?v=1.8',
    '/src/js/app.js?v=1.7',
    '/src/assets/service-worker.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(function(cache) {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached resources with network fallback
self.addEventListener('fetch', function(event) {
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
    
    // Handle static assets (cache first)
    if (STATIC_ASSETS.includes(url.pathname) || url.searchParams.has('v')) {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(function(fetchResponse) {
                        if (fetchResponse.status === 200) {
                            const responseClone = fetchResponse.clone();
                            caches.open(STATIC_CACHE).then(function(cache) {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return fetchResponse;
                    });
                })
        );
        return;
    }
    
    // Handle API requests (network first)
    if (url.hostname === 'api.openweathermap.org') {
        event.respondWith(
            fetch(event.request)
                .then(function(response) {
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then(function(cache) {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(function() {
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Default strategy: cache first, network fallback
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                return response || fetch(event.request);
            })
            .catch(function() {
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('', { status: 404 });
            })
    );
}); 