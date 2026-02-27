import { CheckSquare, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PackingChecklistProps {
  spotType: "port" | "beach" | "rocky" | "river" | "pier" | "breakwater";
  hasConvenienceStore: boolean;
  hasToilet: boolean;
  hasFishingShop: boolean;
  hasRentalRod: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  safetyLevel?: "safe" | "caution" | "danger";
  isNightFishing: boolean;
}

interface AffiliateLink {
  label: string;
  url: string;
}

interface ChecklistItem {
  name: string;
  note?: string;
  level: "normal" | "warning" | "danger";
  badgeText?: string;
  affiliate?: AffiliateLink;
}

function buildChecklist(props: PackingChecklistProps) {
  const {
    spotType,
    hasConvenienceStore,
    hasToilet,
    hasFishingShop,
    hasRentalRod,
    difficulty,
    safetyLevel,
    isNightFishing,
  } = props;

  const essentials: ChecklistItem[] = [
    {
      name: "釣り竿・リール",
      level: "normal",
      ...(hasRentalRod
        ? { badgeText: "現地レンタル可" }
        : { affiliate: { label: "ロッド", url: "https://amzn.to/4s4i64m" } }),
    },
    {
      name: "仕掛け・エサ",
      level: "normal",
      ...(hasFishingShop
        ? { badgeText: "現地購入可" }
        : { affiliate: { label: "おもりセット", url: "https://amzn.to/4cFGDbl" } }),
    },
    { name: "クーラーボックス", note: "魚を持ち帰る場合", level: "normal" },
    { name: "タオル", level: "normal" },
    { name: "ゴミ袋", note: "自分のゴミは持ち帰り", level: "normal" },
    { name: "ハサミ", note: "糸を切る用", level: "normal" },
  ];

  const conditional: ChecklistItem[] = [];

  if (
    spotType === "rocky" ||
    safetyLevel === "caution" ||
    safetyLevel === "danger"
  ) {
    conditional.push({
      name: "ライフジャケット",
      note: "必須",
      level: "danger",
    });
  }

  if (!hasConvenienceStore) {
    conditional.push({
      name: "飲み物・食べ物",
      note: "周辺に店がありません",
      level: "warning",
    });
  }

  if (!hasToilet) {
    conditional.push({
      name: "携帯トイレ",
      note: "トイレがありません",
      level: "warning",
    });
  }

  if (spotType === "rocky") {
    conditional.push({
      name: "滑りにくい靴",
      note: "スパイクシューズ推奨",
      level: "warning",
    });
  }

  if (spotType === "beach") {
    conditional.push({
      name: "長靴またはサンダル",
      level: "normal",
    });
    conditional.push({
      name: "日焼け止め・帽子",
      note: "日陰なし",
      level: "warning",
    });
  }

  if (spotType === "river") {
    conditional.push({
      name: "ウェーダーまたは長靴",
      level: "normal",
    });
    conditional.push({
      name: "虫除けスプレー",
      level: "normal",
    });
  }

  if (isNightFishing) {
    conditional.push({ name: "ヘッドライト", level: "warning" });
    conditional.push({ name: "反射ベスト", level: "warning" });
  }

  if (difficulty === "advanced") {
    conditional.push({
      name: "携帯電話",
      note: "緊急時用・電波確認",
      level: "warning",
    });
  }

  const convenient: ChecklistItem[] = [
    { name: "フィッシュグリップ", note: "魚を掴む道具", level: "normal" },
    { name: "プライヤー", note: "針外し", level: "normal" },
    { name: "バケツ", note: "海水汲み用", level: "normal" },
    { name: "レジャーシート", level: "normal" },
    { name: "日焼け止め・帽子", note: "屋外全般", level: "normal" },
    { name: "絆創膏・消毒液", level: "normal" },
    {
      name: "モバイルバッテリー",
      note: "スマホ充電切れ防止",
      level: "normal",
      affiliate: { label: "Anker", url: "https://amzn.to/4s2zhmT" },
    },
    {
      name: "フィッシングバッグ",
      note: "道具の持ち運びに",
      level: "normal",
      affiliate: { label: "大容量40L", url: "https://amzn.to/4aOYPgo" },
    },
  ];

  return { essentials, conditional, convenient };
}

function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  const bgClass =
    item.level === "danger"
      ? "bg-red-50 border-red-200"
      : item.level === "warning"
        ? "bg-amber-50 border-amber-200"
        : "bg-white border-transparent";

  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${bgClass}`}
    >
      <CheckSquare className="size-4 shrink-0 text-muted-foreground" />
      <span className="font-medium">{item.name}</span>
      {item.note && (
        <span className="text-xs text-muted-foreground">
          {(item.level === "danger" || item.level === "warning") && (
            <AlertTriangle className="mr-0.5 inline size-3 text-amber-500" />
          )}
          {item.note}
        </span>
      )}
      {item.badgeText && (
        <Badge className="ml-auto bg-green-600 hover:bg-green-600 text-[10px] px-1.5 py-0">
          {item.badgeText}
        </Badge>
      )}
      {item.affiliate && (
        <a
          href={item.affiliate.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="ml-auto inline-flex shrink-0 items-center gap-1 rounded bg-[#FF9900] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#E88B00] transition-colors"
        >
          {item.affiliate.label}
          <ExternalLink className="size-2.5" />
        </a>
      )}
    </div>
  );
}

export function PackingChecklist(props: PackingChecklistProps) {
  const { essentials, conditional, convenient } = buildChecklist(props);

  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-4">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <CheckSquare className="size-5" />
          持ち物チェックリスト
        </h3>

        {/* 必須アイテム */}
        <div>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            必須
          </p>
          <div className="space-y-1.5">
            {essentials.map((item) => (
              <ChecklistItemRow key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* 条件付きアイテム */}
        {conditional.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              このスポットで特に必要
            </p>
            <div className="space-y-1.5">
              {conditional.map((item) => (
                <ChecklistItemRow key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* あると便利 */}
        <div>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            あると便利
          </p>
          <div className="space-y-1.5">
            {convenient.map((item) => (
              <ChecklistItemRow key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* ヒント */}
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          <Info className="size-4 shrink-0 mt-0.5" />
          <span>
            初めての方は印刷して持っていくと安心です
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
