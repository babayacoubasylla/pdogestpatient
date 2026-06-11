const CACHE = 'clinique-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Installation
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => { }))
    );
});

// Activation
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch : ne mettre en cache QUE les requêtes GET
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    if (!e.request.url.startsWith('http')) return;

    e.respondWith(
        fetch(e.request)
            .then((res) => {
                // Ne mettre en cache que les réponses valides
                if (res && res.status === 200 && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(CACHE).then((c) => c.put(e.request, clone)).catch(() => { });
                }
                return res;
            })
            .catch(() => caches.match(e.request).then((r) => r || caches.match('/')))
    );
});

// Push notifications
self.addEventListener('push', (e) => {
    const data = e.data?.json() || { title: 'Clinique', body: 'Nouvelle notification' };
    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon-192.png',
        })
    );
});