import * as React from "react"
import { Waves } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentDividerProps {
  variant?: "wave" | "line" | "dots"
  className?: string
}

export function ContentDivider({
  variant = "line",
  className,
}: ContentDividerProps) {
  if (variant === "wave") {
    return (
      <div className={cn("flex items-center gap-3 py-4", className)}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <Waves className="size-4 text-muted-foreground/40" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-2 py-4", className)}>
        <span className="size-1.5 rounded-full bg-muted-foreground/30" />
        <span className="size-1.5 rounded-full bg-muted-foreground/30" />
        <span className="size-1.5 rounded-full bg-muted-foreground/30" />
      </div>
    )
  }

  // Default: line
  return (
    <div className={cn("py-4", className)}>
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  )
}
