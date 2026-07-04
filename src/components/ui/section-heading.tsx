import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  /** 見出しレベル。置換元のセマンティクスを維持する（デフォルト h2） */
  as?: "h2" | "h3"
  /** lg=セクション大見出し、md=サブセクション見出し */
  size?: "lg" | "md"
  className?: string
}

const sizeClasses = {
  lg: "text-xl sm:text-2xl",
  md: "text-base sm:text-lg",
} as const

export function SectionHeading({
  icon,
  title,
  subtitle,
  as: Tag = "h2",
  size = "lg",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-primary shrink-0">{icon}</span>
        )}
        <Tag
          className={cn(
            "font-display font-bold tracking-tight text-pretty text-foreground",
            sizeClasses[size]
          )}
        >
          {title}
        </Tag>
      </div>
      <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-primary/60 to-primary/10" />
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
