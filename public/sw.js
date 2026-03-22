const CACHE_NAME = "tsurispot-v2";
const STATIC_ASSETS = [
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

// フェッチ: 静的アセットのみキャッシュ、HTMLページはキャッシュしない
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 外部リクエスト・APIはスルー
  if (!url.origin.startsWith(self.location.origin)) return;
  if (url.pathname.startsWith("/api/")) return;

  // Next.jsのRSCリクエスト（クライアントナビゲーション）はスルー
  if (event.request.headers.get("RSC") === "1") return;
  if (event.request.headers.get("Next-Router-State-Tree")) return;

  // HTMLページリクエスト（Accept: text/html）はネットワークのみ、キャッシュしない
  const accept = event.request.headers.get("Accept") || "";
  if (accept.includes("text/html")) return;

  // 静的アセット（画像・フォント・CSS・JS）のみキャッシュ
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    /\.(ico|svg|png|jpg|webp|avif|woff2?)$/.test(url.pathname);

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
