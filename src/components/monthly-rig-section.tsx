"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Fish, Wrench, ExternalLink } from "lucide-react";
import type { MonthlyRigSet } from "@/lib/data/monthly-rigs";

/** 仕掛けアイテム名 → アフィリエイトリンクのマッピング */
const ITEM_AFFILIATE: { pattern: RegExp; name: string; url: string }[] = [
  { pattern: /ハリス/i, name: "ハリス（フロロ）", url: "https://amzn.to/408jI1f" },
  { pattern: /道糸.*ナイロン|ナイロン.*道糸|ナイロンライン/i, name: "ナイロンライン（東レ）", url: "https://amzn.to/4s1SPaX" },
  { pattern: /道糸.*PE|PE.*道糸|PEライン/i, name: "PEライン（東レ）", url: "https://amzn.to/4s45H0i" },
  { pattern: /フロロカーボン|フロロライン/i, name: "フロロカーボンライン", url: "https://amzn.to/4tKXyzu" },
  { pattern: /天秤|ジェット天秤/i, name: "ジェット天秤", url: "https://amzn.to/4l7BnQg" },
  { pattern: /おもり|オモリ|ガン玉|中通し/i, name: "おもりセット", url: "https://amzn.to/4cFGDbl" },
  { pattern: /スナップ/i, name: "スナップ", url: "https://amzn.to/4c9oMcU" },
  { pattern: /コマセ|アミ姫|オキアミ.*集魚/i, name: "マルキュー アミ姫", url: "https://amzn.to/4c6gaUn" },
];

/** 仕掛けセットの釣り方 → おすすめ道具のマッピング */
const METHOD_AFFILIATE: { pattern: RegExp; name: string; desc: string; url: string }[] = [
  { pattern: /サビキ|投げ|ちょい投げ|ウキ|フカセ|カゴ/i, name: "万能ロッド（シマノ）", desc: "堤防〜サーフまで対応", url: "https://amzn.to/4s4i64m" },
  { pattern: /ルアー|ジギング|エギング|アジング|メバリング/i, name: "万能ロッド（シマノ）", desc: "ルアーにも対応", url: "https://amzn.to/4s4i64m" },
];

function getItemAffiliates(items: { name: string; spec: string }[]): { name: string; url: string }[] {
  const matched = new Set<string>();
  const results: { name: string; url: string }[] = [];
  for (const item of items) {
    const text = `${item.name} ${item.spec}`;
    for (const aff of ITEM_AFFILIATE) {
      if (!matched.has(aff.url) && aff.pattern.test(text)) {
        matched.add(aff.url);
        results.push({ name: aff.name, url: aff.url });
      }
    }
  }
  return results.slice(0, 3);
}

function RigSetCard({ set }: { set: MonthlyRigSet }) {
  const [isOpen, setIsOpen] = useState(false);
  const affiliates = getItemAffiliates(set.items);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div className="size-9 shrink-0 overflow-hidden rounded-lg bg-primary/10">
            {set.fishSlug ? (
              <img src={`/images/fish/${set.fishSlug}.jpg`} alt={set.targetFish} className="size-full object-cover" loading="lazy" />
            ) : (
              <div className="flex size-full items-center justify-center text-primary">
                <Fish className="size-4" />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">{set.targetFish}狙い</span>
              <Badge variant="secondary" className="text-[10px]">
                {set.method}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {set.items.length}アイテム
            </p>
          </div>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <CardContent className="border-t px-4 pb-4 pt-3">
          <div className="flex gap-4">
            {/* 左: 仕掛けリスト */}
            <div className="min-w-0 flex-1">
              <ul className="space-y-2">
                {set.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="ml-1.5 text-muted-foreground">
                        {item.spec}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {set.guideLink && (
                  <Link
                    href={set.guideLink}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {set.guideLinkLabel || "詳しい釣り方ガイド"}
                    <ChevronRight className="size-3.5" />
                  </Link>
                )}
                {set.fishSlug && (
                  <Link
                    href={`/fish/${set.fishSlug}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {set.targetFish}の詳細
                    <ChevronRight className="size-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* 右: アフィリエイト */}
            {affiliates.length > 0 && (
              <div className="hidden w-44 shrink-0 space-y-2 border-l pl-4 sm:block">
                <p className="text-[10px] font-medium text-muted-foreground">おすすめアイテム</p>
                {affiliates.map((aff) => (
                  <a
                    key={aff.url}
                    href={aff.url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50/50 px-2.5 py-2 text-xs font-medium text-orange-900 transition-colors hover:bg-orange-100 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-200"
                  >
                    <ExternalLink className="size-3 shrink-0 text-orange-500" />
                    <span className="line-clamp-2 leading-tight">{aff.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* モバイル用: アフィリエイト */}
          {affiliates.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 border-t pt-3 sm:hidden">
              {affiliates.map((aff) => (
                <a
                  key={aff.url}
                  href={aff.url}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50/50 px-2.5 py-1 text-[11px] font-medium text-orange-900 transition-colors hover:bg-orange-100"
                >
                  <ExternalLink className="size-3 shrink-0 text-orange-500" />
                  {aff.name}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function MonthlyRigSection({
  monthName,
  rigs,
}: {
  monthName: string;
  rigs: MonthlyRigSet[];
}) {
  if (rigs.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Wrench className="size-5 text-primary" />
        {monthName}のおすすめ仕掛けセット
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {monthName}に狙える魚に最適な仕掛けセットを紹介します。タップで詳細を確認できます。
      </p>
      <div className="space-y-3">
        {rigs.map((set, i) => (
          <RigSetCard key={`${set.targetFish}-${i}`} set={set} />
        ))}
      </div>
    </section>
  );
}
