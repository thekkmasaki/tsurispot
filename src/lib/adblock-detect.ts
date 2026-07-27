/**
 * 広告ブロッカー検知ユーティリティ（クライアント専用）
 *
 * 2系統の OR で「広告ブロッカーが有効か」を判定する:
 *  1. bait 法    — フィルタリストが隠す典型クラス名の不可視要素を挿入し、
 *                  高さ0/display:none にされたら cosmetic フィルタ（uBO/AdBlock）ありと判定。
 *  2. script 法  — adsbygoogle.js が実際にロード完了したか（window.adsbygoogle.loaded）を確認。
 *                  ネットワーク遮断型ブロッカーはこちらで捕捉する。
 *
 * 誤検知回避: ad-unit.tsx が `window.adsbygoogle = window.adsbygoogle || []` で配列を先に
 * 初期化するため、配列の存在だけでは「ロード済み」と判定できない。ライブラリが読み込まれた
 * 時にだけ立つ `loaded` フラグで判定する。
 */

/** bait 要素が広告ブロッカーに隠されているか（cosmetic フィルタ検知） */
function isBaitBlocked(): boolean {
  if (typeof document === "undefined") return false;
  const bait = document.createElement("div");
  // フィルタリストが要素隠蔽の対象にする代表的なクラス名を並べる
  bait.className = "adsbox ad-banner ad-placement pub_300x250 text-ad";
  bait.setAttribute("aria-hidden", "true");
  bait.style.cssText =
    "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;";
  document.body.appendChild(bait);
  const style = window.getComputedStyle(bait);
  const blocked =
    bait.offsetParent === null ||
    bait.offsetHeight === 0 ||
    bait.clientHeight === 0 ||
    style.display === "none" ||
    style.visibility === "hidden";
  bait.remove();
  return blocked;
}

/** adsbygoogle.js がロード完了しているか（ネットワーク遮断型の検知） */
function isScriptBlocked(): boolean {
  if (typeof window === "undefined") return false;
  // adsbygoogle は ad-unit.tsx で Record<string, unknown>[] として宣言済みのため、
  // ライブラリ読込時にだけ立つ loaded フラグはローカル cast で読む（global宣言の衝突回避）。
  const ads = (window as unknown as { adsbygoogle?: { loaded?: boolean } }).adsbygoogle;
  return ads?.loaded !== true;
}

/**
 * 広告ブロッカーが有効かを判定する。
 * script 法は adsbygoogle.js の lazyOnload 完了を待つ必要があるため、既定で 3.5 秒待機する。
 */
export function detectAdBlock(waitMs = 3500): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    // bait は DOM 反映後に読み取りたいので次フレームで一次判定
    requestAnimationFrame(() => {
      const baitBlocked = isBaitBlocked();
      if (baitBlocked) {
        resolve(true);
        return;
      }
      // cosmetic では引っかからないネットワーク遮断型に備え、スクリプトのロード完了を待って再判定
      window.setTimeout(() => {
        resolve(isScriptBlocked());
      }, waitMs);
    });
  });
}
