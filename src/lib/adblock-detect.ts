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

export interface AdBlockDetection {
  blocked: boolean;
  /**
   * 判定経路。集計を層別に読むためのディメンション:
   *  - bait   = cosmetic フィルタ検知（確実にブロッカー。ただし ABP の Acceptable Ads 構成では
   *             実広告が一部表示されつつ bait 陽性になり得る点に留意）
   *  - script = スクリプト取得の成否（陽性はブロッカー/DNSフィルタ/ネットワーク断の合算=上限値）
   */
  method: "bait" | "script";
}

/**
 * 広告ブロッカーが有効かを判定する。
 * bait 陽性なら即確定。bait 陰性なら adsbygoogle.js の load/error 確定を待って判定する
 * （確定前に離脱した場合は解決しない＝呼び出し側でイベント未送信になる。意図した挙動）。
 *
 * 検知範囲の注記: uBlock Origin 系の汎用 cosmetic フィルタは非同期の DOM surveyor で
 * 適用されるため、同一フレームで挿入→判定→除去する本 bait には掛からないことが多い。
 * ただし uBO はネットワーク遮断も行うため script 経路（onError）で確実に捕捉される。
 * bait 経路は ABP/AdGuard 型（document_start に stylesheet 注入=同期適用）を主に担う。
 */
export function detectAdBlock(): Promise<AdBlockDetection> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve({ blocked: false, method: "script" });
      return;
    }
    // bait は DOM 反映後に読み取りたいので次フレームで判定
    requestAnimationFrame(() => {
      if (isBaitBlocked()) {
        resolve({ blocked: true, method: "bait" });
        return;
      }
      // ネットワーク遮断型: スクリプト自身の load/error イベントで確定させる（タイマー不使用）
      const state = getAdSenseScriptState();
      if (state !== "loading") {
        resolve({ blocked: state === "blocked", method: "script" });
        return;
      }
      const unsubscribe = subscribeAdSenseScriptState((s) => {
        unsubscribe();
        resolve({ blocked: s === "blocked", method: "script" });
      });
    });
  });
}
