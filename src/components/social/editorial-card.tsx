"use client";

import Link from "next/link";
import { Newspaper, BookOpen, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { EditorialCard as EditorialCardData } from "@/lib/editorial-feed";

const KIND_META = {
  weekly: { icon: Newspaper, label: "週報" },
  blog: { icon: BookOpen, label: "記事" },
  guide: { icon: CalendarDays, label: "ガイド" },
} as const;

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// タイムラインに混ざる「編集部」コンテンツカード（週報・記事・月別ガイド）
export function EditorialCard({ card }: { card: EditorialCardData }) {
  const meta = KIND_META[card.kind] ?? KIND_META.blog;
  const Icon = meta.icon;

  return (
    <Card className="border-sky-200/60 bg-sky-50/40 py-3 dark:border-sky-900/40 dark:bg-sky-950/20">
      <CardContent className="px-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-700 px-2 py-0.5 font-bold text-white">
            ツリスポ編集部
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon className="size-3.5" aria-hidden="true" />
            {meta.label}
          </span>
          {card.date && <span>{formatDate(card.date)}</span>}
        </div>
        <Link prefetch={false} href={card.href} className="group mt-2 block">
          <p className="text-sm font-bold leading-snug group-hover:underline">{card.title}</p>
          {card.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {card.description}
            </p>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
