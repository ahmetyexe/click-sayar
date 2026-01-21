// Service Worker - PWA için offline desteği ve caching

const CACHE_NAME = 'click-sayar-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json'
];

// Install olayı
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('Cache açılırken hata:', error);
            })
    );
    self.skipWaiting();
});

// Activate olayı
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
    self.clients.claim();
});

// Fetch olayı - Network first, Cache fallback
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Başarılı yanıtı cache'e kaydet
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // Network başarısız, cache'den döndür
                return caches.match(event.request)
                    .then((response) => {
                        return response || new Response('Offline - Sayfayı cache\'ten açmak başarısız oldu', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});
