"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Fish, Wrench } from "lucide-react";
import type { MonthlyRigSet } from "@/lib/data/monthly-rigs";

function RigSetCard({ set }: { set: MonthlyRigSet }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Fish className="size-4" />
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

          {set.guideLink && (
            <Link
              href={set.guideLink}
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {set.guideLinkLabel || "詳しい釣り方ガイド"}
              <ChevronRight className="size-3.5" />
            </Link>
          )}

          {set.fishSlug && (
            <Link
              href={`/fish/${set.fishSlug}`}
              className="ml-4 mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {set.targetFish}の詳細
              <ChevronRight className="size-3.5" />
            </Link>
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
