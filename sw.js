// RAPID System · service worker: membuat aplikasi bisa dipasang di HP dan terbuka cepat.
// Data (SPK, status) SELALU diambil langsung dari server; hanya tampilan aplikasi yang disimpan.
const VERSI = 'rapid-v1.1-2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;            // server Apps Script, Google Fonts, dll: tidak disentuh
  if (r.mode === 'navigate') {                                                // halaman: selalu versi terbaru, cadangan bila offline
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSI).then(x => x.put('./index.html', c)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => {                                 // ikon, foto: cepat dari simpanan, diperbarui di belakang
    const net = fetch(r).then(res => { if (res.ok) caches.open(VERSI).then(x => x.put(r, res.clone())); return res; }).catch(() => hit);
    return hit || net;
  }));
});
