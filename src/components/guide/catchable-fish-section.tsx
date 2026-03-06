import Link from "next/link";
import { Fish } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DIFFICULTY_LABELS } from "@/types";
import type { FishSpecies } from "@/types";
import { getFishForGuideSlug } from "@/lib/data/fishing-methods";
import { FishImage } from "@/components/ui/spot-image";

interface CatchableFishSectionProps {
  /** ガイドのslug（sabiki, choinage等） */
  guideSlug: string;
  /** セクションタイトル（デフォルト: "この釣り方で釣れる魚"） */
  title?: string;
  /** 表示する最大件数（デフォルト: 12） */
  maxItems?: number;
}

export function CatchableFishSection({
  guideSlug,
  title = "この釣り方で釣れる魚",
  maxItems = 12,
}: CatchableFishSectionProps) {
  const fish = getFishForGuideSlug(guideSlug, maxItems);
  if (fish.length === 0) return null;

  return (
    <section className="mt-10 sm:mt-14">
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <Fish className="size-6 text-primary" />
        {title}
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        この釣り方で狙える代表的な魚種です。詳しい釣り方や旬の時期は各ページをご覧ください。
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fish.map((f) => (
          <FishMiniCard key={f.slug} fish={f} />
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          href="/fish"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          すべての魚種を見る &rarr;
        </Link>
      </div>
    </section>
  );
}

function FishMiniCard({ fish }: { fish: FishSpecies }) {
  return (
    <Link href={`/fish/${fish.slug}`} className="group">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="relative">
          <FishImage
            src={fish.imageUrl}
            alt={fish.name}
            category={fish.category}
            height="h-24"
          />
        </div>
        <CardContent className="flex flex-col gap-1 p-2.5 sm:p-3">
          <p className="text-sm font-semibold group-hover:text-primary">
            {fish.name}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {DIFFICULTY_LABELS[fish.difficulty]}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {fish.sizeCm}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
