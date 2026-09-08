"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

/**
 * モバイル下部固定UIの調停（BottomLayerCoordinator）
 *
 * 背景: 下部に固定UIが最大6層（MobileNav / MobileStickyAd / PWAヒント /
 * 比較バー / Cookieバナー / 位置情報バナー）重なり、広告と同座標に一時UIが
 * 被さると AdSense の「広告にコンテンツを重ねる」ポリシー違反リスク＋
 * 誤クリックを誘発していた。
 *
 * 仕組み:
 * - 各一時UIは「表示したい」状態を useBottomLayer(id, wantsVisible) で申告する
 * - 同時にアクティブな場合は優先度最上位の1つだけが表示許可される
 *   （他は非表示のまま待機し、上位が消えたら繰り上げで表示される）
 * - 広告と同座標のまま残す一時UI(compare/location)が表示中は MobileStickyAd をサスペンド
 *   （useBottomAdSuspended で参照。広告の上に何かが被さる状態を根絶）
 * - 常時出る一時UI(cookie/pwa)はサスペンドせず、座標を広告の上へずらして共存させる
 *   （サスペンド＝display:none は広告リクエスト自体を止めるため。下の AD_SUSPENDING_LAYERS 参照）
 */

/** 調停対象の一時UI。優先度はここで一元管理する */
export type BottomLayerId = "cookie" | "compare" | "location" | "pwa";

const LAYER_PRIORITY: Record<BottomLayerId, number> = {
  cookie: 100, // 法的同意が最優先
  compare: 80, // ユーザーの能動操作の結果
  location: 60,
  pwa: 40,
};

interface BottomLayerContextValue {
  register: (id: BottomLayerId) => void;
  unregister: (id: BottomLayerId) => void;
  /** 現在表示を許可されているレイヤー（申告中の最上位1つ） */
  activeId: BottomLayerId | null;
}

const BottomLayerContext = createContext<BottomLayerContextValue | null>(null);

export function BottomLayerProvider({ children }: { children: React.ReactNode }) {
  // 「表示したい」と申告中のレイヤー集合（表示許可の有無とは独立）
  const [requested, setRequested] = useState<ReadonlySet<BottomLayerId>>(
    () => new Set()
  );

  const register = useCallback((id: BottomLayerId) => {
    setRequested((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unregister = useCallback((id: BottomLayerId) => {
    setRequested((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const activeId = useMemo(() => {
    let best: BottomLayerId | null = null;
    for (const id of requested) {
      if (best === null || LAYER_PRIORITY[id] > LAYER_PRIORITY[best]) {
        best = id;
      }
    }
    return best;
  }, [requested]);

  const value = useMemo(
    () => ({ register, unregister, activeId }),
    [register, unregister, activeId]
  );

  return (
    <BottomLayerContext.Provider value={value}>
      {children}
    </BottomLayerContext.Provider>
  );
}

/**
 * 一時UI側で呼ぶフック。
 * 各コンポーネント既存の表示条件（sessionStorage等）はそのまま活かし、
 * その結果を wantsVisible として申告 → 許可された時だけ描画する。
 *
 * @returns 表示許可（true の時だけ描画する）
 */
export function useBottomLayer(
  id: BottomLayerId,
  wantsVisible: boolean
): boolean {
  const ctx = useContext(BottomLayerContext);
  const register = ctx?.register;
  const unregister = ctx?.unregister;

  useEffect(() => {
    if (!wantsVisible || !register || !unregister) return;
    register(id);
    return () => unregister(id);
  }, [id, wantsVisible, register, unregister]);

  // Provider外（テスト等）ではフォールバックとして従来通り自身の判断で表示
  if (!ctx) return wantsVisible;
  return wantsVisible && ctx.activeId === id;
}

/**
 * 広告をサスペンド（display:none）する一時UI。
 *
 * 【重要】ここに登録した一時UIが表示中は MobileStickyAd が display:none になる。
 * display:none は offsetWidth=0 → ad-unit.tsx の MIN_AD_WIDTH ガードにより
 * adsbygoogle.push({}) 自体が実行されない ＝ 広告リクエストが出ない ＝ 収益ゼロ。
 * **常時出る一時UIをここに入れてはいけない。**
 *
 * 実際に 2026-07-05〜08-27 の53日間、cookie(新規の1PV目) と pwa(2PV目以降) がここに
 * 含まれていたため、mobile_sticky の広告表示が 1PVあたり 0.49→0.007 まで落ちた。
 * この2つは座標を広告の上へずらして共存させる方式へ変更した（bottom を 199px+safe-area に）。
 *
 * compare / location は発生が限定的（compare=比較に追加した時のみ、location=トップのみ）で、
 * かつ広告と同座標のままなので、従来どおりサスペンドで重なりを回避する。
 */
const AD_SUSPENDING_LAYERS: ReadonlySet<BottomLayerId> = new Set<BottomLayerId>([
  "compare",
  "location",
]);

/**
 * MobileStickyAd 側で呼ぶフック。
 * AD_SUSPENDING_LAYERS のいずれかが表示中のときだけ true（広告をサスペンドすべき状態）。
 * dismissed フラグとは別の一時非表示であり、上位UIが消えれば広告は自動復帰する。
 */
export function useBottomAdSuspended(): boolean {
  const ctx = useContext(BottomLayerContext);
  if (ctx === null || ctx.activeId === null) return false;
  return AD_SUSPENDING_LAYERS.has(ctx.activeId);
}
