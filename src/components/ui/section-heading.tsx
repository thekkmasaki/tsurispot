import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  /** 見出しレベル。置換元のセマンティクスを維持する（デフォルト h2） */
  as?: "h2" | "h3"
  /** lg=セクション大見出し、md=サブセクション見出し */
  size?: "lg" | "md"
  /** 見出し右端の「すべて見る」リンク（スマホでも同じ位置に出す） */
  action?: { href: string; label: string }
  className?: string
}

/**
 * セクション見出し（2026-11 余白・見出し統一）。
 * サウナイキタイ型: 大きな太字 + 小さな説明。PC は説明を見出しの横、スマホは下に置く。
 * 右端に「すべて見る」を置き、スマホ専用の別ボタンを不要にする。
 */
const sizeClasses = {
  lg: "text-2xl font-black sm:text-[28px]",
  md: "text-lg font-bold sm:text-xl",
} as const

export function SectionHeading({
  icon,
  title,
  subtitle,
  as: Tag = "h2",
  size = "lg",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="min-w-0 sm:flex sm:items-baseline sm:gap-4">
        <div className="flex items-center gap-2">
          {icon && <span className="shrink-0 text-primary">{icon}</span>}
          <Tag
            className={cn(
              "font-display leading-tight tracking-tight text-pretty text-foreground",
              sizeClasses[size]
            )}
          >
            {title}
          </Tag>
        </div>
        {subtitle && (
          <p className="mt-1.5 text-[13px] text-foreground/80 sm:mt-0 sm:text-sm">{subtitle}</p>
        )}
      </div>
      {action && (
        <Link
          prefetch={false}
          href={action.href}
          className="hidden shrink-0 items-center gap-0.5 pb-0.5 text-sm font-bold text-primary hover:underline sm:inline-flex"
        >
          {action.label}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
