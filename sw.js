// DailyLog service worker: aplikasi tetap bisa dibuka tanpa internet.
// Ganti angka VERSI setiap kali index.html diperbarui.
const VERSI = 'dailylog-v5';
const INTI = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(INTI)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  // Hanya file situs sendiri. Supabase dan Google Fonts dibiarkan lewat jaringan biasa.
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  // Jaringan dulu supaya pembaruan langsung terbaca; cadangan dari cache saat offline.
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok && res.status === 200) { const salin = res.clone(); caches.open(VERSI).then(c => c.put(r, salin)); }
      return res;
    }).catch(() => caches.match(r).then(h => h || caches.match('index.html')))
  );
});
