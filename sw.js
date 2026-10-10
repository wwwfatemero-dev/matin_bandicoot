// سرویس‌ورکر متین باندیکوت: بعد از اولین بار، بازی بدون اینترنت هم باز می‌شه
const CACHE = 'matin-bandicoot-v1';
const FILES = ['./', './index.html', './three.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(FILES.map((f) => c.add(f).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(r, { ignoreSearch: true }).then((hit) => {
        const net = fetch(r).then((res) => {
          if (res && res.ok) c.put(r, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
