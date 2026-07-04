import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-sea-foam/20 text-ocean-deep border-sea-foam/30 [a&]:hover:bg-sea-foam/30",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-sand-light [a&]:hover:text-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        // 意味バリアント: 淡色bg＋濃色文字（AA準拠）。ブランドトークン同系の境界線を持つ
        beginner:
          "bg-forest-green/15 text-[oklch(0.35_0.10_150)] border-forest-green/30",
        free: "bg-sunset-coral/10 text-[oklch(0.45_0.16_25)] border-sunset-coral/25",
        season:
          "bg-sunset-gold/20 text-[oklch(0.50_0.10_70)] border-sunset-gold/40",
        // premium: 高級魚等のゴールド系（seasonと同系トーン、意味だけ分離）
        premium:
          "bg-sunset-gold/20 text-[oklch(0.50_0.10_70)] border-sunset-gold/40",
        // 状態系: 安全/注意/危険（safety-warning・難易度・○×表示で共用）
        success:
          "bg-forest-green/15 text-[oklch(0.35_0.10_150)] border-forest-green/30",
        warning:
          "bg-sunset-gold/20 text-[oklch(0.50_0.10_70)] border-sunset-gold/40",
        danger:
          "bg-destructive/10 text-[oklch(0.45_0.20_27)] border-destructive/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
