const CACHE_NAME = 'leo-assistant-v2.0';
const ASSETS_TO_CACHE = [
  '/leoassistant/',
  '/leoassistant/index.html',
  '/leoassistant/css/core.css',
  '/leoassistant/css/animations.css',
  '/leoassistant/css/responsive.css',
  '/leoassistant/js/core.js',
  '/leoassistant/js/auth.js',
  '/leoassistant/js/offline.js',
  '/leoassistant/js/neuro.js',
  '/leoassistant/icons/icon-192.png',
  '/leoassistant/icons/icon-512.png',
  '/leoassistant/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Установка');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Кеширование файлов');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация
self.addEventListener('activate', event => {
  console.log('[Service Worker] Активация');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Удаление старого кеша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  // Для API запросов - сеть, потом кеш
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Для остальных - кеш, потом сеть
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // Офлайн-страница
            if (event.request.destination === 'document') {
              return caches.match('/leoassistant/offline.html');
            }
          });
      })
  );
});

// Фоновая синхронизация
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('[Service Worker] Фоновая синхронизация');
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Здесь будет синхронизация данных
  const offlineData = await getOfflineData();
  // Отправка на сервер...
}

// Push уведомления
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'Новое уведомление от Leo Assistant',
    icon: '/leoassistant/icons/icon-192.png',
    badge: '/leoassistant/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Leo Assistant', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/leoassistant/')
    );
  }
});
