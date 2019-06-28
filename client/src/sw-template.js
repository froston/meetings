if ('function' === typeof importScripts) {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js')
  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded')

    workbox.core.setCacheNameDetails({
      prefix: 'meetings',
      suffix: 'v1',
      precache: 'meetings-precache',
      runtime: 'meetings-runtime'
    })

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([])

    const fs = ['common', 'dashboard', 'login', 'nav', 'schedules', 'students', 'tasks']

    workbox.precaching.precacheAndRoute([
      ...fs.map(f => `/locales/es/${f}.json`),
      ...fs.map(f => `/locales/en/${f}.json`),
      ...fs.map(f => `/locales/cs/${f}.json`)
    ])

    /* custom cache rules*/
    workbox.routing.registerNavigationRoute('/index.html', {
      blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/]
    })

    workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg)$/,
      workbox.strategies.cacheFirst({
        cacheName: 'images',
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
          })
        ]
      })
    )

    workbox.routing.registerRoute(
      new RegExp('/api/.*'),
      new workbox.strategies.NetworkFirst({
        cacheName: 'api-cache '
      })
    )
  } else {
    console.log('Workbox could not be loaded. No Offline support')
  }
}
