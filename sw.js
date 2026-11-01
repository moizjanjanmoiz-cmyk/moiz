// Network-only shopping: never cache accounts, orders, API responses, or checkout.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate' || event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mega Bazar — Offline</title><body style="font-family:system-ui;text-align:center;padding:60px 24px"><h1>You are offline</h1><p>Connect to the internet to browse Mega Bazar and place orders.</p><a href="/">Try again</a></body></html>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
