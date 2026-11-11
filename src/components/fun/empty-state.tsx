import Link from "next/link";
import type { ReactNode } from "react";
import { Sakanacchi } from "./sakanacchi";

/**
 * 空の状態（データ・投稿がまだ無い場所）の共通表示。
 * 空欄や「ありません」だけを出さず、さかなっち＋次の行動（投稿など）へ誘導する。
 */
type Props = {
  title: string;
  description?: ReactNode;
  action?: { href: string; label: string };
  className?: string;
};

export function EmptyState({ title, description, action, className }: Props) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-dashed px-4 py-5 sm:px-5 ${className ?? ""}`}
    >
      <Sakanacchi size={64} className="shrink-0" />
      <div className="min-w-0">
        <p className="font-display font-bold">{title}</p>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        {action && (
          <Link
            prefetch={false}
            href={action.href}
            className="mt-1.5 inline-block text-sm font-bold text-primary hover:underline"
          >
            {action.label} →
          </Link>
        )}
      </div>
    </div>
  );
}
