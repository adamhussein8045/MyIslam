const VERSION = 'myislam-v2';
const SHELL = `${VERSION}-shell`;
const PAGES = `${VERSION}-mushaf`;
const base = new URL(self.registration.scope).pathname;
const routes = ['', 'quran/', 'prayer-times/', 'qibla/', 'settings/'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(routes.map(p => base + p))));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('myislam-') && ![SHELL, PAGES].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const mushaf = url.pathname.includes('/mushaf/') || url.pathname.includes('/__l5e/assets-v1/');
  if (mushaf) {
    event.respondWith(caches.open(PAGES).then(async cache => {
      const hit = await cache.match(request); if (hit) return hit;
      const response = await fetch(request);
      if (response.ok) { await cache.put(request, response.clone()); const keys = await cache.keys(); if (keys.length > 40) await cache.delete(keys[0]); }
      return response;
    }));
  } else if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(async response => {
      if (response.ok) { const cache = await caches.open(SHELL); await cache.put(request, response.clone()); }
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match(base + '')) || Response.error()));
  } else if (url.pathname.startsWith(base + 'assets/') || url.pathname.startsWith(base + 'icons/')) {
    event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(async response => {
      if (response.ok) { const cache = await caches.open(SHELL); await cache.put(request, response.clone()); } return response;
    })));
  }
});