const CACHE_NAME = "tsurispot-v1";
const STATIC_ASSETS = [
  "/",
  "/spots",
  "/fish",
  "/map",
  "/catchable-now",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

// インストール: 静的アセットをキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// アクティベート: 古いキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// フェッチ: ネットワーク優先、失敗時にキャッシュを返す
self.addEventListener("fetch", (event) => {
  // API呼び出しや外部リクエストはキャッシュしない
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/") ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功したらキャッシュを更新
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュから返す
        return caches.match(event.request);
      })
  );
});
