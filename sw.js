// ホーム画面用の外枠の Service Worker。
//
// 役目は 2 つ。
//   1. インストールの条件を満たす（キャッシュはしない。中身のアプリは毎回 GAS から読む）
//   2. Web Push を受けて通知を出す
//
// 通知はこの外枠のオリジン（GitHub Pages）に届く。アプリ本体は script.google.com の
// iframe の中なので、そちらでは受け取れない。
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});

// 中継から届いた通知を出す。本文は { title, body, url, tag } の JSON
self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {};
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'HISAKO', {
      body: String(data.body || ''),
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      // 同じ tag は上書きする。時刻ごとの通知が積み上がらないように
      tag: data.tag || 'hisako',
      renotify: true,
      data: { url: data.url || './' },
    })
  );
});

// 押したら、開いているアプリがあればそれを前に出す。無ければ開く
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var client = list[i];
        if (client.url.indexOf(self.registration.scope) !== 0 || !('focus' in client)) continue;
        // 開いている画面には行き先だけ伝える（読み込み直さない。3D の読み直しは重い）
        try {
          client.postMessage({ hisako: 'open', url: url });
        } catch (error) {
          // 伝えられなくても、前に出すだけはする
        }
        return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
