import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  /** h1直下のリード文（任意） */
  lead?: React.ReactNode
  /** タイトル左に表示するアイコン（任意） */
  icon?: React.ReactNode
  className?: string
}

/**
 * 一覧ページ等のh1見出しを統一するページヘッダー。
 * font-display（Zen Maru Gothic）でブランドの見出し体系に揃える。
 */
export function PageHeader({ title, lead, icon, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2">
        {icon}
        <h1 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
      </div>
      {lead && (
        <p className="text-sm text-muted-foreground sm:text-base">{lead}</p>
      )}
    </div>
  )
}
