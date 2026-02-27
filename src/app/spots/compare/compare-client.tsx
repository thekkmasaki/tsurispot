"use client";

import Link from "next/link";
import { Star, Check, X, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FishingSpot, SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import { SpotImage } from "@/components/ui/spot-image";
import { setCompareList } from "@/components/spots/compare-bar";

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto size-5 text-green-600" />
  ) : (
    <X className="mx-auto size-5 text-muted-foreground/40" />
  );
}

export function CompareClient({ spots }: { spots: FishingSpot[] }) {
  if (spots.length < 2) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">比較するには2つ以上のスポットを選択してください。</p>
        <Link href="/spots">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="size-4" />
            スポット一覧に戻る
          </Button>
        </Link>
      </div>
    );
  }

  const rows: { label: string; render: (s: FishingSpot) => React.ReactNode }[] = [
    {
      label: "タイプ",
      render: (s) => <Badge variant="secondary">{SPOT_TYPE_LABELS[s.spotType]}</Badge>,
    },
    {
      label: "難易度",
      render: (s) => DIFFICULTY_LABELS[s.difficulty],
    },
    {
      label: "評価",
      render: (s) => (
        <span className="inline-flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          {s.rating.toFixed(1)}
        </span>
      ),
    },
    {
      label: "料金",
      render: (s) => (
        <Badge className={s.isFree ? "bg-orange-500 hover:bg-orange-500" : "bg-gray-500 hover:bg-gray-500"}>
          {s.isFree ? "無料" : "有料"}
        </Badge>
      ),
    },
    { label: "駐車場", render: (s) => <BoolCell value={s.hasParking} /> },
    { label: "トイレ", render: (s) => <BoolCell value={s.hasToilet} /> },
    { label: "コンビニ", render: (s) => <BoolCell value={s.hasConvenienceStore} /> },
    { label: "釣具店", render: (s) => <BoolCell value={s.hasFishingShop} /> },
    { label: "レンタル竿", render: (s) => <BoolCell value={s.hasRentalRod} /> },
    {
      label: "釣れる魚",
      render: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.catchableFish.slice(0, 5).map((cf) => (
            <Badge key={cf.fish.id} variant="outline" className="text-xs">
              {cf.fish.name}
            </Badge>
          ))}
          {s.catchableFish.length > 5 && (
            <Badge variant="outline" className="text-xs">+{s.catchableFish.length - 5}</Badge>
          )}
        </div>
      ),
    },
    {
      label: "エリア",
      render: (s) => `${s.region.prefecture} ${s.region.areaName}`,
    },
  ];

  return (
    <>
      {/* Desktop: horizontal table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-28 border-b p-3 text-left text-muted-foreground" />
              {spots.map((s) => (
                <th key={s.id} className="border-b p-3 text-center">
                  <Link href={`/spots/${s.slug}`} className="group">
                    <SpotImage
                      src={(s.mainImageUrl?.startsWith("http") || s.mainImageUrl?.startsWith("/images/spots/wikimedia/")) ? s.mainImageUrl : undefined}
                      alt={s.name}
                      spotType={s.spotType}
                      height="h-28"
                    />
                    <p className="mt-2 font-semibold group-hover:text-primary">{s.name}</p>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-b-0">
                <td className="p-3 text-sm font-medium text-muted-foreground">{row.label}</td>
                {spots.map((s) => (
                  <td key={s.id} className="p-3 text-center">{row.render(s)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-4 sm:hidden">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{row.label}</p>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${spots.length}, 1fr)` }}>
              {spots.map((s) => (
                <div key={s.id} className="text-center text-sm">
                  <p className="mb-1 truncate text-xs font-medium">{s.name}</p>
                  {row.render(s)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/spots">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            スポット一覧に戻る
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={() => setCompareList([])}
          className="text-muted-foreground"
        >
          比較リストをクリア
        </Button>
      </div>
    </>
  );
}
