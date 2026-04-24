import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  size?: "lg" | "md" | "sm"
  className?: string
}

const sizeClasses = {
  lg: "text-xl sm:text-2xl",
  md: "text-lg sm:text-xl",
  sm: "text-base sm:text-lg",
} as const

export function SectionHeading({
  icon,
  title,
  subtitle,
  size = "lg",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-primary shrink-0">{icon}</span>
        )}
        <h3
          className={cn(
            "font-display font-bold tracking-tight text-foreground",
            sizeClasses[size]
          )}
        >
          {title}
        </h3>
      </div>
      <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-primary/60 to-primary/10" />
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
