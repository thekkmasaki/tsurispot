import type { Metadata } from "next";
import Link from "next/link";
import { tackleShops } from "@/lib/data/shops";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  Store,
} from "lucide-react";

export const metadata: Metadata = {
  title: "釣具店を探す - 全国の釣具店情報",
  description:
    "全国の釣具店を探せます。活きエサの在庫情報やレンタル竿の有無、営業時間など、釣りに行く前に知りたい情報をまとめて確認できます。",
  openGraph: {
    title: "釣具店を探す - 全国の釣具店情報 | ツリスポ",
    description:
      "全国の釣具店を探せます。エサの在庫やレンタル竿の情報をチェック。",
    type: "website",
    url: "https://tsurispot.com/shops",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/shops",
  },
};

export default function ShopsListPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/"
        className="mb-5 inline-flex min-h-[44px] items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        トップに戻る
      </Link>

      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2">
          <Store className="size-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            釣具店を探す
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          掲載中の釣具店一覧です。エサの在庫やサービス内容をチェックして、釣りの準備に役立てましょう。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tackleShops.map((shop) => (
          <Link key={shop.id} href={`/shops/${shop.slug}`}>
            <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold leading-tight group-hover:text-primary">
                    {shop.name}
                  </h2>
                  {shop.isPremium && (
                    <Badge className="shrink-0 bg-amber-500 text-white hover:bg-amber-500 text-[10px]">
                      PR
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>
                    {shop.region.prefecture} {shop.region.areaName}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                  {shop.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {shop.hasLiveBait && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      活きエサ
                    </Badge>
                  )}
                  {shop.hasFrozenBait && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      冷凍エサ
                    </Badge>
                  )}
                  {shop.hasRentalRod && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      レンタル竿
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{shop.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3" />
                    <span>{shop.businessHours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 掲載案内 CTA */}
      <div className="mt-10 rounded-xl border border-dashed p-5 text-center">
        <p className="text-sm font-medium">釣具店オーナーの方へ</p>
        <p className="mt-1 text-xs text-muted-foreground">
          ツリスポへの掲載で、近くの釣り人にお店をアピールしませんか？
        </p>
        <Link
          href="/partner"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          掲載のご案内はこちら →
        </Link>
      </div>
    </div>
  );
}
