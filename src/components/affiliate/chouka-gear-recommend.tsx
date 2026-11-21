import { ShoppingBag } from "lucide-react";
import { RecommendProductCard } from "@/components/affiliate/recommend-product-card";
import { pickChoukaGear, tallyMethods } from "@/lib/chouka-gear";

/** 日本時間の月（ISR はサーバー時刻で描画されるため JST に寄せる） */
function jstMonth(now = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", month: "numeric" }).format(now));
}

interface Props {
  /** 見出しの主語（例: "アオリイカ" / "南紀・白浜"） */
  subject: string;
  /** 今週の釣果行（釣り方列を集計する） */
  rows: { method: string }[];
  /** 魚種名（専用ギアの一致に使う） */
  fishNames: string[];
  className?: string;
}

/**
 * 「今週この釣り方で釣れている → その道具」の提案枠（/chouka/*）。
 * 釣り方の件数は週報の釣果表そのままの事実として示し、一致する商品が無ければ枠ごと出さない。
 */
export function ChoukaGearRecommend({ subject, rows, fishNames, className }: Props) {
  const tally = tallyMethods(rows);
  const products = pickChoukaGear({ methods: tally.map((t) => t.label), fishNames, month: jstMonth() });
  if (products.length === 0) return null;
  const top = tally.slice(0, 3);

  return (
    <section aria-labelledby="chouka-gear" className={className}>
      <div className="mb-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <h2 id="chouka-gear" className="flex items-center gap-2 text-base font-bold sm:text-lg">
          <ShoppingBag className="size-5 text-primary" />
          今週の{subject}の釣果に合った道具
        </h2>
        {top.length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            最新の釣果週報で報告があった釣り方：
            {/* 全部1件のときに「（1件）」を並べても情報にならないので、差があるときだけ件数を出す */}
            {top.map((t) => (top[0].count >= 2 ? `${t.label}（${t.count}件）` : t.label)).join("・")}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {products.map((p) => (
          <RecommendProductCard key={p.id} product={p} pageType="chouka" />
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        ※ 上記リンクはアフィリエイトリンクを含みます。購入による追加費用は発生しません。価格は変動する場合があります。
      </p>
    </section>
  );
}
