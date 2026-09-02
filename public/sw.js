/* CocoaGuard AI — hand-rolled service worker.
 * After one online visit, the TF.js model + advice + OSM tiles are offline-ready.
 * Bump CACHE on redeploy; the activate handler purges stale caches. */
const CACHE = 'cocoa-guard-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(['/', '/scan', '/map', '/dashboard']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  const cacheFirst = () =>
    caches.match(request).then(
      (r) =>
        r ||
        fetch(request).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy))
          return res
        }),
    )

  // Model + static JS/CSS chunks: cache-first.
  if (url.pathname.startsWith('/models/') || url.pathname.startsWith('/_next/static/')) {
    e.respondWith(cacheFirst())
    return
  }

  // OSM tiles: cache-first.
  if (url.hostname.includes('tile.openstreetmap.org')) {
    e.respondWith(cacheFirst())
    return
  }

  // App pages + API GETs: network-first, fall back to cache when offline.
  e.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(request, copy))
        return res
      })
      .catch(() => caches.match(request).then((r) => r || caches.match('/'))),
  )
})
