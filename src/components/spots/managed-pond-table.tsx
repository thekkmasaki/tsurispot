import Link from "next/link";
import type { FishingSpot } from "@/types";
import {
  facilityLabel,
  feeShortText,
  openingHoursText,
  closedDaysText,
  municipality,
} from "@/lib/managed-pond";

/** 管理釣り場・釣り堀の比較表（料金・営業時間・定休日・魚）。データのない項目は「—」。 */
export function ManagedPondTable({ spots, caption }: { spots: FishingSpot[]; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">施設名</th>
            <th scope="col" className="px-3 py-2 font-medium">市区町村</th>
            <th scope="col" className="px-3 py-2 font-medium">種別</th>
            <th scope="col" className="px-3 py-2 font-medium">料金</th>
            <th scope="col" className="px-3 py-2 font-medium">営業時間</th>
            <th scope="col" className="px-3 py-2 font-medium">定休日</th>
            <th scope="col" className="px-3 py-2 font-medium">釣れる魚</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {spots.map((s) => (
            <tr key={s.slug}>
              <th scope="row" className="px-3 py-2 font-medium">
                <Link prefetch={false} href={`/spots/${s.slug}`} className="text-primary hover:underline">
                  {s.name}
                </Link>
              </th>
              <td className="px-3 py-2">{municipality(s)}</td>
              <td className="px-3 py-2">{facilityLabel(s)}</td>
              <td className="px-3 py-2">{feeShortText(s) ?? "—"}</td>
              <td className="px-3 py-2">{openingHoursText(s) ?? "—"}</td>
              <td className="px-3 py-2">{closedDaysText(s) ?? "—"}</td>
              <td className="px-3 py-2">
                {[...new Set(s.catchableFish.map((c) => c.fish.name))].slice(0, 3).join("・") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
