const CACHE = "jodoh-app-v1";
const SHELL = [
  "./", "index.html", "manifest.webmanifest", "../media/logo.svg",
  "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png",
  ...["w2","w3","w4","w5","w6","w7","w8","m3","m4","m5","m6","m7","m8","m9"].map(n => `img/${n}.jpg`)
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first for the page (so updates land), cache first for everything else.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      caches.open(CACHE).then(c => c.put("index.html", r.clone()));
      return r;
    }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
