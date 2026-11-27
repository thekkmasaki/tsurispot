"use client";

import { useMemo, useState } from "react";
import type { GearModel, RakutenItem } from "@/lib/data/gear-compare/types";
import {
  buyLinks,
  effectivePrice,
  filterModels,
  formatRange,
  sortModels,
  type CompareSort,
} from "@/lib/gear-compare";
import { trackAffiliateClick } from "@/lib/affiliate-config";

const JIG_OPTIONS = [20, 30, 40, 60, 80, 100];
const BUDGET_OPTIONS = [10000, 15000, 20000];
const SORT_LABELS: Record<CompareSort, string> = {
  price: "価格が安い順",
  lureMax: "重いジグが投げられる順",
  length: "長い順",
  weight: "軽い順",
};

interface Props {
  categoryName: string;
  models: GearModel[];
  items: Record<string, RakutenItem>;
}

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export function CompareTable({ categoryName, models, items }: Props) {
  const [jigG, setJigG] = useState<number | null>(null);
  const [budgetYen, setBudgetYen] = useState<number | null>(null);
  const [sort, setSort] = useState<CompareSort>("price");

  const rows = useMemo(
    () => sortModels(filterModels(models, items, { jigG, budgetYen }), items, sort),
    [models, items, jigG, budgetYen, sort],
  );

  const onBuy = (m: GearModel, platform: "amazon" | "rakuten") =>
    trackAffiliateClick({
      productName: `${m.maker} ${m.model}`,
      productCategory: categoryName,
      platform,
      pageType: "gear",
    });

  const selectCls = "rounded-md border bg-background px-2 py-1.5 text-sm";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end gap-3 rounded-xl border bg-muted/30 p-3">
        <label className="flex flex-col gap-1 text-xs font-medium">
          使いたいジグの重さ
          <select className={selectCls} value={jigG ?? ""} onChange={(e) => setJigG(e.target.value ? Number(e.target.value) : null)}>
            <option value="">指定なし</option>
            {JIG_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}g
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          予算
          <select
            className={selectCls}
            value={budgetYen ?? ""}
            onChange={(e) => setBudgetYen(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">指定なし</option>
            {BUDGET_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {yen(y)}以下
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          並び順
          <select className={selectCls} value={sort} onChange={(e) => setSort(e.target.value as CompareSort)}>
            {(Object.keys(SORT_LABELS) as CompareSort[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {rows.length} / {models.length} 機種
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-muted/50 text-xs">
            <tr>
              <th className="sticky left-0 z-10 bg-muted px-3 py-2 text-left">機種</th>
              <th className="px-3 py-2 text-right">全長</th>
              <th className="px-3 py-2 text-right">継数</th>
              <th className="px-3 py-2 text-right">ルアー</th>
              <th className="px-3 py-2 text-right">PEライン</th>
              <th className="px-3 py-2 text-right">自重</th>
              <th className="px-3 py-2 text-right">価格</th>
              <th className="px-3 py-2 text-center">購入</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const item = items[m.id];
              const price = effectivePrice(m, item);
              const links = buyLinks(m, item);
              return (
                <tr key={m.id} className="border-t align-middle">
                  <th scope="row" className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-normal">
                    <span className="flex items-center gap-2">
                      {item?.imageUrl && (
                        // 楽天商品検索APIの画像URLをそのまま表示（規約上、自サーバーへの保存はしない）
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" width={48} height={48} loading="lazy" className="size-12 shrink-0 rounded object-contain" />
                      )}
                      <span>
                        <span className="block text-[11px] text-muted-foreground">
                          {m.maker} {m.series}
                        </span>
                        <span className="block font-bold">{m.model}</span>
                      </span>
                    </span>
                  </th>
                  <td className="px-3 py-2 text-right tabular-nums">{m.lengthFt ?? (m.lengthM != null ? `${m.lengthM}m` : "—")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.pieces != null ? `${m.pieces}本` : "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatRange(m.lureMinG, m.lureMaxG, "g")}
                    {m.jigMaxG != null && <span className="block text-[10px] text-muted-foreground">ジグMAX {m.jigMaxG}g</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatRange(m.peMin, m.peMax, "号")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.weightG != null ? `${m.weightG}g` : "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {price != null ? (
                      <>
                        {yen(price)}
                        <span className="block text-[10px] text-muted-foreground">{item ? "楽天参考（税込）" : "希望本体価格（税抜）"}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex flex-col gap-1">
                      <a
                        href={links.rakuten}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        onClick={() => onBuy(m, "rakuten")}
                        className="rounded-md bg-[#bf0000] px-2 py-1 text-center text-xs font-bold text-white hover:opacity-90"
                      >
                        楽天で見る
                      </a>
                      <a
                        href={links.amazon}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        onClick={() => onBuy(m, "amazon")}
                        className="rounded-md bg-[#ff9900] px-2 py-1 text-center text-xs font-bold text-black hover:opacity-90"
                      >
                        Amazonで探す
                      </a>
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  条件に合う機種がありません。条件をゆるめてください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
