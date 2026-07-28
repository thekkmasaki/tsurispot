/**
 * 広告ブロッカー検知ユーティリティ（クライアント専用）
 *
 * 2系統の OR で「広告ブロッカーが有効か」を判定する:
 *  1. bait 法    — フィルタリストが実際に隠す形の不可視要素を挿入し、隠蔽されたら
 *                  cosmetic フィルタありと判定。現行 EasyList/uBO は汎用の
 *                  「クラス名」隠蔽ルールを持たないため（監査 F4 で実 easylist.txt を
 *                  grep して確認）、実在するルールを踏む:
 *                    - ID ルール: ###adsbox / ###ad-placement / ###text-ad
 *                    - 属性ルール: ##ins.adsbygoogle[data-ad-client]
 *  2. script 法  — adsbygoogle.js 自身の load/error イベント（adsense-script-state）で判定。
 *                  壁時計での待機は一切しない。lazyOnload（window load 後+idle）の
 *                  時間軸に対する固定タイマーは、遅い回線の正常ユーザーを
 *                  「ブロック」と誤計上するため全廃した（監査 F4）。
 *
 * スクリプト状態が確定する前に離脱した場合、Promise は解決されない＝イベントを送らない。
 * これにより ad_blocked 集計は真に「下限値」となる（誤陽性を含まない）。
 */

import { getAdSenseScriptState, subscribeAdSenseScriptState } from "./adsense-script-state";

/** bait 要素が広告ブロッカーに隠されているか（cosmetic フィルタ検知） */
function isBaitBlocked(): boolean {
  if (typeof document === "undefined" || !document.body) return false;

  // ID ルール（###adsbox 等）を踏む div bait
  const divBait = document.createElement("div");
  divBait.id = "adsbox";
  divBait.className = "adsbox ad-banner ad-placement pub_300x250 text-ad";
  divBait.setAttribute("aria-hidden", "true");
  divBait.style.cssText =
    "position:absolute;left:-9999px;top:-9999px;display:block;width:10px;height:10px;pointer-events:none;";

  // 属性ルール ##ins.adsbygoogle[data-ad-client] を踏む ins bait。
  // data-adsbygoogle-status を先付けして adsbygoogle.js の処理対象から外す
  // （スクリプトは処理済み属性のある <ins> をスキップするため、広告リクエストは発生しない）。
  const insBait = document.createElement("ins");
  insBait.className = "adsbygoogle";
  insBait.setAttribute("data-ad-client", "ca-pub-0000000000000000");
  insBait.setAttribute("data-adsbygoogle-status", "done");
  insBait.setAttribute("aria-hidden", "true");
  insBait.style.cssText =
    "position:absolute;left:-9999px;top:-9999px;display:block;width:10px;height:10px;pointer-events:none;";

  document.body.appendChild(divBait);
  document.body.appendChild(insBait);

  const hidden = (el: HTMLElement): boolean => {
    const style = window.getComputedStyle(el);
    return (
      el.offsetParent === null ||
      el.offsetHeight === 0 ||
      style.display === "none" ||
      style.visibility === "hidden"
    );
  };
  const blocked = hidden(divBait) || hidden(insBait);

  divBait.remove();
  insBait.remove();
  return blocked;
}

/**
 * 広告ブロッカーが有効かを判定する。
 * bait 陽性なら即 true。bait 陰性なら adsbygoogle.js の load/error 確定を待って判定する
 * （確定前に離脱した場合は解決しない＝呼び出し側でイベント未送信になる。意図した挙動）。
 */
export function detectAdBlock(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(false);
      return;
    }
    // bait は DOM 反映後に読み取りたいので次フレームで判定
    // （cosmetic フィルタの汎用ルールは stylesheet として document_start に注入済みのため即適用される）
    requestAnimationFrame(() => {
      if (isBaitBlocked()) {
        resolve(true);
        return;
      }
      // ネットワーク遮断型: スクリプト自身の load/error イベントで確定させる（タイマー不使用）
      const state = getAdSenseScriptState();
      if (state !== "loading") {
        resolve(state === "blocked");
        return;
      }
      const unsubscribe = subscribeAdSenseScriptState((s) => {
        unsubscribe();
        resolve(s === "blocked");
      });
    });
  });
}
