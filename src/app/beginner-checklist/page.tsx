"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Shield,
  Lightbulb,
  UtensilsCrossed,
  RotateCcw,
  Check,
  Circle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductList } from "@/components/affiliate/product-list";
import { getBeginnerEssentials } from "@/lib/data/products";

const STORAGE_KEY = "tsurispot-checklist";

interface AffiliateRec {
  badge: string;
  badgeColor: string;
  name: string;
  desc: string;
  url: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  note?: string;
  affiliate?: AffiliateRec;
}

interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  items: ChecklistItem[];
}

const categories: ChecklistCategory[] = [
  {
    id: "essential",
    title: "必須の道具",
    icon: <Package className="size-5" />,
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50 dark:bg-blue-950",
    items: [
      {
        id: "rod", label: "竿（ロッド）", note: "サビキセットなら竿・リール・仕掛け込みで3,000円前後",
        affiliate: {
          badge: "慣れてきたら",
          badgeColor: "bg-purple-100 text-purple-700",
          name: "シマノ ホリデーパック",
          desc: "振出式コンパクトロッド。持ち運びやすく、堤防からちょい投げ・サビキ・ウキ釣りまで幅広く対応。初心者セットを卒業したい人に最適。",
          url: "https://amzn.to/4c7dgi1",
        },
      },
      { id: "reel", label: "リール", note: "スピニングリールが初心者向け" },
      { id: "tackle", label: "仕掛け（針・オモリ・ウキ）", note: "対象魚に合わせた仕掛けを用意" },
      { id: "line", label: "予備の釣り糸", note: "ライントラブルに備えて" },
      { id: "bait", label: "エサ（オキアミ・アオイソメなど）", note: "現地の釣具店で購入も可" },
      { id: "bucket", label: "バケツ", note: "海水を汲む用。折りたたみ式が便利" },
      { id: "cooler", label: "クーラーボックス＋氷", note: "釣った魚の鮮度を保つため" },
      { id: "scissors", label: "ハサミ・プライヤー", note: "糸を切る・針を外す必須アイテム" },
      { id: "towel", label: "タオル（2〜3枚）", note: "魚を掴む用・手拭き用" },
      { id: "bag", label: "ゴミ袋", note: "使った仕掛けやゴミは必ず持ち帰る" },
    ],
  },
  {
    id: "safety",
    title: "安全用品",
    icon: <Shield className="size-5" />,
    colorClass: "text-red-600",
    bgClass: "bg-red-50 dark:bg-red-950",
    items: [
      { id: "lifejacket", label: "ライフジャケット", note: "堤防・磯では必須。レンタルできる施設も" },
      { id: "shoes", label: "滑りにくい靴", note: "スパイクシューズや長靴がおすすめ" },
      { id: "hat", label: "帽子", note: "日差し対策と、飛んできた針から頭を守る" },
      { id: "sunscreen", label: "日焼け止め", note: "海辺は紫外線が強い。こまめに塗り直す" },
      { id: "sunglasses", label: "偏光サングラス", note: "水面の反射を抑え、水中が見やすくなる" },
      { id: "firstaid", label: "絆創膏・消毒液", note: "針で刺したときや魚のヒレでケガした時に" },
      { id: "headlight", label: "ヘッドライト", note: "朝マヅメ・夕マヅメの薄暗い時間帯に" },
    ],
  },
  {
    id: "convenient",
    title: "あると便利なもの",
    icon: <Lightbulb className="size-5" />,
    colorClass: "text-green-600",
    bgClass: "bg-green-50 dark:bg-green-950",
    items: [
      { id: "chair", label: "折りたたみ椅子", note: "長時間の釣りでも快適に" },
      {
        id: "net", label: "タモ（玉網）", note: "大きな魚を取り込むときに必要",
        affiliate: {
          badge: "大物対策",
          badgeColor: "bg-green-100 text-green-700",
          name: "SANLIKE ランディングネット",
          desc: "9段階伸縮で堤防からの大物取り込みに対応。折りたたみ式で持ち運びやすく、ラバーネットで魚を傷つけにくい。",
          url: "https://amzn.to/4tOTONg",
        },
      },
      { id: "stringer", label: "ストリンガー", note: "魚を生かしたまま海中に繋ぎ止める道具" },
      { id: "scale", label: "フィッシュグリップ", note: "魚を安全に掴むための道具" },
      {
        id: "knife", label: "ナイフ", note: "魚を締める・さばくときに使用",
        affiliate: {
          badge: "あると便利",
          badgeColor: "bg-blue-100 text-blue-700",
          name: "ダイワ フィッシュナイフ 2型",
          desc: "ステンレス刃で錆びにくく、安全ロック付きで持ち運びも安心。魚を締める・血抜き・さばくのに最適。",
          url: "https://amzn.to/3ZQsYqx",
        },
      },
      { id: "rainwear", label: "レインウェア", note: "急な雨や波しぶき対策に" },
      { id: "gloves", label: "フィッシンググローブ", note: "手を保護し、滑り止め効果も" },
      { id: "bugspray", label: "虫除けスプレー", note: "夏場は特に必須" },
      { id: "charger", label: "モバイルバッテリー", note: "スマホの充電切れ防止に" },
    ],
  },
  {
    id: "food",
    title: "食べ物・飲み物",
    icon: <UtensilsCrossed className="size-5" />,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50 dark:bg-amber-950",
    items: [
      { id: "water", label: "水・スポーツドリンク", note: "熱中症対策に最低1リットルは用意" },
      { id: "snack", label: "おにぎり・パン等の軽食", note: "片手で食べられるものが便利" },
      { id: "thermos", label: "温かい飲み物（冬場）", note: "魔法瓶でコーヒーやお茶を持参" },
      { id: "candy", label: "飴・チョコ等", note: "手軽にエネルギー補給" },
    ],
  },
];

function ChecklistPageContent() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setChecked(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setMounted(true);
  }, []);

  const saveChecked = useCallback((newChecked: Record<string, boolean>) => {
    setChecked(newChecked);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newChecked));
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleItem = useCallback(
    (id: string) => {
      const newChecked = { ...checked, [id]: !checked[id] };
      saveChecked(newChecked);
    },
    [checked, saveChecked]
  );

  const resetAll = useCallback(() => {
    saveChecked({});
  }, [saveChecked]);

  const allItems = categories.flatMap((c) => c.items);
  const totalCount = allItems.length;
  const checkedCount = allItems.filter((item) => checked[item.id]).length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  if (!mounted) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣り初心者の持ち物チェックリスト
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            釣りに行く前にチェックして忘れ物を防止しよう
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center sm:mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
          釣り初心者の持ち物チェックリスト
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
          釣りに行く前にチェックして忘れ物を防止しよう
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 rounded-xl border bg-white p-4 shadow-sm dark:bg-card">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">
            準備状況：{checkedCount} / {totalCount} アイテム
          </p>
          <div className="flex items-center gap-2">
            {progress === 100 && (
              <Badge variant="default" className="bg-green-600">
                準備完了
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="h-8 gap-1 text-xs text-muted-foreground"
            >
              <RotateCcw className="size-3" />
              リセット
            </Button>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklists */}
      <div className="space-y-6">
        {categories.map((category) => {
          const catChecked = category.items.filter(
            (item) => checked[item.id]
          ).length;
          const catTotal = category.items.length;

          return (
            <Card key={category.id} className="gap-0 overflow-hidden py-0">
              <CardHeader
                className={`${category.bgClass} flex-row items-center gap-3 py-4`}
              >
                <div className={category.colorClass}>{category.icon}</div>
                <CardTitle className="text-base">{category.title}</CardTitle>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {catChecked}/{catTotal}
                </Badge>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {category.items.map((item) => {
                  const isChecked = !!checked[item.id];
                  return (
                    <div key={item.id} className="divide-y-0">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                          isChecked ? "bg-muted/30" : ""
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-3" />
                            </div>
                          ) : (
                            <Circle className="size-5 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              isChecked
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {item.label}
                          </p>
                          {item.note && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </button>
                      {item.affiliate && (
                        <div className="border-t bg-muted/20 px-4 py-3">
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <Badge className={`${item.affiliate.badgeColor} mb-1 text-[10px] hover:${item.affiliate.badgeColor.split(" ")[0]}`}>
                                {item.affiliate.badge}
                              </Badge>
                              <p className="text-xs font-bold">{item.affiliate.name}</p>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                {item.affiliate.desc}
                              </p>
                            </div>
                            <a
                              href={item.affiliate.url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 shrink-0 inline-flex items-center rounded-md bg-[#FF9900] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#E88B00]"
                            >
                              Amazonで見る
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tip box */}
      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
          チェック状態はブラウザに自動保存されます。次回訪問時も引き続き確認できます。
        </p>
      </div>

      {/* おすすめの道具 */}
      <div className="mt-8">
        <ProductList
          products={getBeginnerEssentials()}
          title="おすすめの道具"
          description="チェックリストの中でも、特に人気の高いおすすめアイテムを厳選しました。"
          maxItems={6}
        />
      </div>


      {/* Internal links */}
      <div className="mt-8 rounded-xl border bg-muted/30 p-6">
        <h2 className="mb-4 text-lg font-bold">関連ページ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/guide"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">釣りの始め方ガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">
              初心者向けステップバイステップ解説
            </p>
          </Link>
          <Link
            href="/glossary"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">釣り用語集</p>
            <p className="mt-1 text-xs text-muted-foreground">
              釣りの基本用語を学ぶ
            </p>
          </Link>
          <Link
            href="/seasonal"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">季節別釣りガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">
              今の季節のおすすめ釣り
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BeginnerChecklistPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "釣り初心者の持ち物チェックリスト - 忘れ物防止",
            description:
              "釣りに必要な持ち物をカテゴリ別にチェックリストで紹介。インタラクティブなチェック機能で忘れ物を防止。",
            url: "https://tsurispot.com/beginner-checklist",
            publisher: {
              "@type": "Organization",
              name: "ツリスポ",
              url: "https://tsurispot.com",
            },
          }),
        }}
      />
      <ChecklistPageContent />
    </>
  );
}
