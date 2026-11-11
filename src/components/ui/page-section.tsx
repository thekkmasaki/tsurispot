import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ページ内セクションの外枠（2026-11 余白統一）。
 *
 * サウナイキタイ型: 枠線や背景の帯で区切らず、セクション間の余白だけで区切る。
 * - 上下余白: スマホ 40px / PC 64px（どのセクションも同じ）
 * - 幅: max-w-6xl（1,152px）。ヘッダーは max-w-7xl。
 */
export const SECTION_INNER = "mx-auto w-full max-w-6xl px-4 sm:px-6"

/** 見出しとコンテンツの間隔 */
export const SECTION_HEADING_GAP = "mb-5 sm:mb-8"

/**
 * カード一覧: スマホは横スクロール（1枚＋次のカードが少し見える）、PC はグリッド。
 * 縦に長くなりがちなスマホのトップを短くする（サウナイキタイのスマホ版と同じ型）。
 * 全カードは HTML に出たまま（横に並ぶだけ）なので SEO は変わらない。
 */
export const SCROLL_ROW =
  "-mx-4 grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide [&>*]:snap-start sm:mx-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"

export function PageSection({
  children,
  className,
  innerClassName,
  id,
  as: Tag = "section",
}: {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  id?: string
  as?: "section" | "div"
}) {
  return (
    <Tag id={id} className={cn("py-10 sm:py-16", className)}>
      <div className={cn(SECTION_INNER, innerClassName)}>{children}</div>
    </Tag>
  )
}
