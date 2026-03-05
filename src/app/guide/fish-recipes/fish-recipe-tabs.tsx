"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Award, ChefHat, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface FishRecipe {
  name: string;
  time: string;
  difficulty: 1 | 2 | 3;
  isRecommended?: boolean;
  ingredients: string[];
  steps: string[];
  tips?: string;
}

interface FishRecipeData {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  preparation: string;
  recipes: FishRecipe[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function DifficultyBadge({ level }: { level: 1 | 2 | 3 }) {
  const config = {
    1: {
      label: "簡単",
      stars: "★☆☆",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    2: {
      label: "普通",
      stars: "★★☆",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    3: {
      label: "本格",
      stars: "★★★",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  }[level];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${config.className}`}
    >
      {config.stars} {config.label}
    </span>
  );
}

function TimeBadge({ time }: { time: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <Clock className="size-3" />
      {time}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Recipe Card                                                       */
/* ------------------------------------------------------------------ */

function RecipeCard({ recipe }: { recipe: FishRecipe }) {
  return (
    <Card className="relative overflow-hidden">
      {recipe.isRecommended && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-amber-500 px-2 py-1">
          <span className="flex items-center gap-1 text-[10px] font-bold text-white">
            <Award className="size-3" />
            編集長おすすめ
          </span>
        </div>
      )}
      <CardContent className="pt-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h4 className="text-base font-bold">{recipe.name}</h4>
          <DifficultyBadge level={recipe.difficulty} />
          <TimeBadge time={recipe.time} />
        </div>

        {/* 材料（2人分） */}
        <div className="mb-4">
          <h5 className="mb-2 text-sm font-medium text-foreground">
            材料（2人分）
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {recipe.ingredients.map((item, i) => (
              <span
                key={i}
                className="inline-block rounded-md bg-slate-50 px-2 py-1 text-xs text-muted-foreground dark:bg-slate-900"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 手順 */}
        <div className="mb-3">
          <h5 className="mb-2 text-sm font-medium text-foreground">手順</h5>
          <ol className="space-y-2">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* コツ・ポイント */}
        {recipe.tips && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <span className="inline-flex items-center gap-1 font-medium">
              <Lightbulb className="size-3.5" />
              コツ：
            </span>{" "}
            {recipe.tips}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Fish Tab Content                                                  */
/* ------------------------------------------------------------------ */

function FishContent({ fish }: { fish: FishRecipeData }) {
  return (
    <div className="space-y-4">
      {/* 下処理 */}
      <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
        <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
          <ChefHat className="size-4 text-primary" />
          {fish.name}の下処理
        </h3>
        <p className="text-sm text-muted-foreground">{fish.preparation}</p>
      </div>

      {/* 魚詳細ページへのリンク */}
      <div className="text-sm">
        <Link
          href={`/fish/${fish.slug}`}
          className="text-primary hover:underline"
        >
          {fish.name}の詳しい情報を見る &rarr;
        </Link>
      </div>

      {/* レシピカード */}
      <div className="grid gap-4 sm:grid-cols-1">
        {fish.recipes.map((recipe) => (
          <RecipeCard key={recipe.name} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Tabs Component                                               */
/* ------------------------------------------------------------------ */

export function FishRecipeTabs({
  fishData,
}: {
  fishData: FishRecipeData[];
}) {
  const [activeId, setActiveId] = useState(fishData[0]?.id ?? "");

  const activeFish = fishData.find((f) => f.id === activeId) ?? fishData[0];

  return (
    <div>
      {/* タブボタン */}
      <div className="mb-6 flex flex-wrap gap-2">
        {fishData.map((fish) => (
          <button
            key={fish.id}
            onClick={() => setActiveId(fish.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              activeId === fish.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            <span>{fish.emoji}</span>
            <span>{fish.name}</span>
          </button>
        ))}
      </div>

      {/* アクティブな魚のコンテンツ */}
      {activeFish && <FishContent fish={activeFish} />}
    </div>
  );
}
