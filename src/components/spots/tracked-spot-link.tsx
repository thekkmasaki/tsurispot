"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackInternalLink, type InternalLinkContentType } from "@/lib/analytics";

interface TrackedSpotLinkProps {
  href: string;
  contentType: InternalLinkContentType;
  /** 遷移先の slug。GA4 の item_id に入る */
  itemId: string;
  /** 設置箇所の識別子（例: spot_detail_nearby）。GA4 の link_placement に入る */
  linkPlacement: string;
  /** 同一モジュール内の並び順（0 始まり）。カルーセル vs グリッドの比較に使う */
  position?: number;
  className?: string;
  title?: string;
  "aria-label"?: string;
  prefetch?: boolean;
  children: ReactNode;
}

/**
 * クリックを GA4 に送る回遊リンク
 *
 * useSearchParams は使わない（Suspense 境界なしで呼ぶとページ全体が CSR へ
 * バックアウトし、SSR HTML から本文・広告が消える。2026-07 の #273 参照）。
 * href はサーバー側で確定した値をそのまま受け取るだけなので SSR に影響しない。
 */
export function TrackedSpotLink({
  href,
  contentType,
  itemId,
  linkPlacement,
  position,
  className,
  title,
  prefetch = false,
  children,
  ...rest
}: TrackedSpotLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={className}
      title={title}
      aria-label={rest["aria-label"]}
      onClick={() => trackInternalLink({ contentType, itemId, linkPlacement, position })}
    >
      {children}
    </Link>
  );
}
