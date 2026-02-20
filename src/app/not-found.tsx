import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Fish, MapPin, Home, Waves } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 sm:py-32">
      {/* 波アイコン */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-blue-100">
        <Waves className="size-10 text-blue-500" />
      </div>

      {/* メッセージ */}
      <h1 className="mb-3 text-center text-2xl font-bold tracking-tight sm:text-3xl">
        お探しの釣りスポットは
        <br className="sm:hidden" />
        見つかりませんでした
      </h1>
      <p className="mb-10 max-w-md text-center text-sm text-muted-foreground sm:text-base">
        ページが移動または削除された可能性があります。
        <br />
        以下のリンクからお探しの情報を見つけてください。
      </p>

      {/* ナビゲーションカード */}
      <div className="grid w-full max-w-lg gap-4 sm:grid-cols-3">
        <Link href="/" className="group">
          <Card className="h-full border transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 transition-colors group-hover:bg-emerald-200">
                <Home className="size-6 text-emerald-600" />
              </div>
              <span className="text-sm font-medium">トップページ</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/spots" className="group">
          <Card className="h-full border transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-200">
                <MapPin className="size-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium">スポット一覧</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/map" className="group">
          <Card className="h-full border transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-cyan-100 transition-colors group-hover:bg-cyan-200">
                <Fish className="size-6 text-cyan-600" />
              </div>
              <span className="text-sm font-medium">地図で探す</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* フォールバックボタン */}
      <div className="mt-8">
        <Link href="/">
          <Button variant="outline" size="lg" className="min-h-[44px]">
            トップページに戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
