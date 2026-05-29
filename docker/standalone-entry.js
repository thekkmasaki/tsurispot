// App Runner / standalone 用エントリ。
//
// 目的: Next.js App Router が全応答に付与する
//   Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch
// を、ドキュメント要求（=RSC/プリフェッチ ヘッダを持たない GET）に限り
//   Vary: Accept-Encoding
// に正規化する。Cloudflare は Accept-Encoding 以外の Vary を持つ応答をキャッシュしない
// （cf-cache-status: DYNAMIC）ため、これを直さないと公開 HTML がエッジキャッシュされず
// 全 PV が App Runner に届いて vCPU/egress 課金が増え続ける。
//
// middleware では Vary を「追記」しかできず除去不可・next.config の headers() も同様。
// Next の base-http/node.js は this._res.setHeader('Vary', ...)（= Node の
// http.ServerResponse.prototype.setHeader）でヘッダを書くため、ここを包めば確実に傍受できる。
//
// 安全策:
//   - RSC/プリフェッチ要求（rsc / next-router-prefetch ヘッダ有り）は一切触らない
//     → クライアントナビゲーション無影響。Cloudflare 側でも RSC 要求は明示バイパス済み。
//   - 例外は握りつぶして必ず元の setHeader にフォールバック → 応答を壊さない。
//   - 起動に失敗しても App Runner はヘルスチェック未通過の新コンテナにトラフィックを流さない。
const http = require("http");

const originalSetHeader = http.ServerResponse.prototype.setHeader;
http.ServerResponse.prototype.setHeader = function setHeader(name, value) {
  try {
    if (typeof name === "string" && name.toLowerCase() === "vary") {
      const req = this.req;
      const headers = req && req.headers;
      const isRsc =
        !!headers &&
        (headers["rsc"] !== undefined ||
          headers["next-router-prefetch"] !== undefined);
      const isGet = !req || req.method === "GET" || req.method === "HEAD";
      if (!isRsc && isGet) {
        return originalSetHeader.call(this, name, "Accept-Encoding");
      }
    }
  } catch {
    // 何かあっても元の挙動にフォールバック
  }
  return originalSetHeader.call(this, name, value);
};

// standalone の本体サーバを起動（自己実行スクリプト）
require("./server.js");
