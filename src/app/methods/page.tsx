import type { Metadata } from "next";
import Link from "next/link";
import {
  Anchor,
  Fish,
  Target,
  Waves,
  Grip,
  CircleDot,
  Crosshair,
  Compass,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "釣り方・釣法ガイド - 8つの釣法を徹底解説",
  description:
    "サビキ釣り・アジング・エギング・ショアジギングなど、人気の釣法8種類を初心者向けにわかりやすく解説。必要なタックル、釣り方の手順、コツまで網羅。自分に合った釣り方を見つけよう。",
  openGraph: {
    title: "釣り方・釣法ガイド - 8つの釣法を徹底解説",
    description:
      "人気の釣法8種類を初心者向けに徹底解説。タックル・手順・コツまで網羅。",
    type: "website",
    url: "https://tsurispot.jp/methods",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.jp/methods",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://tsurispot.jp",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "釣り方・釣法ガイド",
      item: "https://tsurispot.jp/methods",
    },
  ],
};

interface MethodSummary {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  targetFish: string[];
  icon: React.ReactNode;
}

const DIFFICULTY_MAP = {
  beginner: { label: "初心者", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  intermediate: { label: "中級者", className: "bg-sky-100 text-sky-700 hover:bg-sky-100" },
  advanced: { label: "上級者", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
};

const methods: MethodSummary[] = [
  {
    slug: "sabiki",
    name: "サビキ釣り",
    nameEn: "Sabiki",
    description: "初心者の定番。堤防からアジ・サバ・イワシを手軽に狙える、最もおすすめの釣法です。",
    difficulty: "beginner",
    targetFish: ["アジ", "サバ", "イワシ"],
    icon: <Anchor className="size-6 text-sky-600" />,
  },
  {
    slug: "ajing",
    name: "アジング",
    nameEn: "Ajing",
    description: "極小ジグヘッドとワームでアジを狙うライトゲーム。繊細なアタリを楽しむ奥深い釣り。",
    difficulty: "intermediate",
    targetFish: ["アジ", "メバル", "カマス"],
    icon: <Target className="size-6 text-indigo-600" />,
  },
  {
    slug: "eging",
    name: "エギング",
    nameEn: "Eging",
    description: "エギ（餌木）でアオリイカを狙う大人気のルアーフィッシング。シャクリのテクニックが鍵。",
    difficulty: "intermediate",
    targetFish: ["アオリイカ", "コウイカ", "ヤリイカ"],
    icon: <Waves className="size-6 text-purple-600" />,
  },
  {
    slug: "mebaring",
    name: "メバリング",
    nameEn: "Mebaring",
    description: "ジグヘッド＋ワームでメバルを狙うライトゲーム。夜の常夜灯周りが狙い目。",
    difficulty: "intermediate",
    targetFish: ["メバル", "カサゴ", "アジ"],
    icon: <CircleDot className="size-6 text-teal-600" />,
  },
  {
    slug: "shore-jigging",
    name: "ショアジギング",
    nameEn: "Shore Jigging",
    description: "岸からメタルジグをフルキャスト。ブリやカンパチなどの青物を豪快に狙う。",
    difficulty: "advanced",
    targetFish: ["イナダ", "ワカシ", "ソウダガツオ"],
    icon: <Crosshair className="size-6 text-red-600" />,
  },
  {
    slug: "choi-nage",
    name: "ちょい投げ",
    nameEn: "Light Surf",
    description: "軽いオモリで近距離に投げる手軽な釣り。キスやハゼを砂浜や堤防から狙える。",
    difficulty: "beginner",
    targetFish: ["キス", "ハゼ", "カレイ"],
    icon: <Compass className="size-6 text-amber-600" />,
  },
  {
    slug: "uki-zuri",
    name: "ウキ釣り",
    nameEn: "Float Fishing",
    description: "ウキで仕掛けを流し、多彩な魚種を狙う万能釣法。アタリがウキに出るのでわかりやすい。",
    difficulty: "beginner",
    targetFish: ["クロダイ", "メジナ", "アジ"],
    icon: <Fish className="size-6 text-emerald-600" />,
  },
  {
    slug: "ana-zuri",
    name: "穴釣り",
    nameEn: "Hole Fishing",
    description: "テトラポッドや岩の隙間にブラクリ仕掛けを落として根魚を狙う。ポイント選びが勝負。",
    difficulty: "beginner",
    targetFish: ["カサゴ", "メバル", "ソイ"],
    icon: <Grip className="size-6 text-stone-600" />,
  },
];

export default function MethodsIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100">
              <Anchor className="size-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              釣り方・釣法ガイド
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            初心者からベテランまで、8つの人気釣法をわかりやすく解説します
          </p>
        </div>

        {/* 難易度の凡例 */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {Object.entries(DIFFICULTY_MAP).map(([key, { label, className }]) => (
            <div key={key} className="flex items-center gap-1.5">
              <Badge className={`text-xs ${className}`}>{label}</Badge>
              <span className="text-xs text-muted-foreground">向け</span>
            </div>
          ))}
        </div>

        {/* 釣法カード一覧 */}
        <div className="grid gap-4 sm:grid-cols-2">
          {methods.map((method) => (
            <Link key={method.slug} href={`/methods/${method.slug}`}>
              <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                        {method.icon}
                      </div>
                      <div>
                        <h2 className="text-base font-bold group-hover:text-primary sm:text-lg">
                          {method.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {method.nameEn}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`shrink-0 text-xs ${DIFFICULTY_MAP[method.difficulty].className}`}
                    >
                      {DIFFICULTY_MAP[method.difficulty].label}
                    </Badge>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {method.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {method.targetFish.map((fish) => (
                      <Badge
                        key={fish}
                        variant="outline"
                        className="text-xs"
                      >
                        {fish}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 関連ページ */}
        <div className="mt-12 rounded-xl border bg-muted/30 p-6">
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
              href="/fish"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">魚種図鑑</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣れる魚の旬・食べ方を紹介
              </p>
            </Link>
            <Link
              href="/seasonal"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">季節別釣りガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                春夏秋冬のおすすめ釣り
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
