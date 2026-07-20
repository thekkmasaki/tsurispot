"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getBucket, type ExperimentKey, type Variant } from "@/lib/ab-test";

/**
 * A/B実験のバリアント別に children を出し分ける汎用ゲート。
 *
 * SSR/初回描画は何も描画せず（ハイドレーション一致）、マウント後に getBucket で
 * バケットを確定してから variant が一致した場合のみ children を描画する。
 * ranking-client.tsx の ranking_infeed 実装パターンの汎用化。
 *
 * 注意: children はマウント後に挿入されるため、ビューポート内（ATF）で使うと
 * CLS を発生させる。below-the-fold の配置か、固定高さの親で包んで使うこと。
 */
export function AdExperimentGate({
  experiment,
  variant,
  children,
}: {
  experiment: ExperimentKey;
  /** このバリアントに割当てられたユーザーにのみ children を描画する */
  variant: Variant;
  children: ReactNode;
}) {
  const [bucket, setBucket] = useState<Variant | null>(null);

  useEffect(() => {
    setBucket(getBucket(experiment));
  }, [experiment]);

  if (bucket !== variant) return null;
  return <>{children}</>;
}
