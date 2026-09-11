// ホーム画面用の外枠の Service Worker。
// インストールの条件を満たすためだけに置く。キャッシュはしない。
// 中身のアプリは毎回 GAS から読み込むので、古い画面を出さないほうがよい。
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
