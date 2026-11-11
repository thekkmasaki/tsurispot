import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * ページ内セクションの外枠（2026-11 余白統一・サウナイキタイのスマホ版を実測して合わせた）。
 *
 * 手本の実測値（390px幅）:
 * - 左右の余白 20px、セクション間 約60px、見出し24px太字＋説明13px（見出しの下）
 * - 白地が基本。ところどころ全幅の薄いグレー帯で区切る（枠線は使わない）
 * - 一覧は縦積み（記事・グッズは2列、施設やバナーは1列）。横スクロールは使わない
 * - 各セクションの最後に、全幅・高さ約50px・角丸8pxの青い「もっと見る」ボタン
 */
export const SECTION_INNER = "mx-auto w-full max-w-6xl px-5 sm:px-6"

/** 見出しとコンテンツの間隔 */
export const SECTION_HEADING_GAP = "mb-5 sm:mb-8"

/** 写真つきカード（記事・魚など）: スマホ2列、PC3列 */
export const CARD_GRID_2 = "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 lg:grid-cols-3"

/** 文字中心のカード（スポットなど）: スマホ1列、PC2〜3列 */
export const CARD_LIST = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"

export function PageSection({
  children,
  className,
  innerClassName,
  id,
  tone = "white",
  as: Tag = "section",
}: {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  id?: string
  /** white=白地 / gray=全幅の薄いグレー帯（中のカードは白） */
  tone?: "white" | "gray"
  as?: "section" | "div"
}) {
  return (
    <Tag
      id={id}
      className={cn("py-12 sm:py-16", tone === "gray" ? "bg-muted" : "bg-background", className)}
    >
      <div className={cn(SECTION_INNER, innerClassName)}>{children}</div>
    </Tag>
  )
}

/** セクション末尾の「もっと見る」ボタン（スマホは全幅、PCは中央に固定幅） */
export function SectionMore({
  href,
  label = "もっと見る",
  className,
}: {
  href: string
  label?: string
  className?: string
}) {
  return (
    <Link
      prefetch={false}
      href={href}
      className={cn(
        "mt-6 flex h-[52px] w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:mx-auto sm:mt-10 sm:w-80",
        className
      )}
    >
      {label}
    </Link>
  )
}
