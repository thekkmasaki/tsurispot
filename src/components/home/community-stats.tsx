import { Users, FileText, Heart, MapPin } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";

/**
 * Phase 6: Active community を見せる showcase セクション (ui-ux-pro-max skill 推論)
 *
 * ロジック:
 * - 数字は production スケールで小さくても「community 形成中」 と見せる
 * - 嘘・誇張は禁止 (CLAUDE.md ルール) なので、 サイト全体の実数とスポット数を表示
 * - 「ユーザー数」は Cognito 21 + LINE 5 (= 26 人) を「26+ 人の釣り人」 として表示
 *
 * 数値更新ルール: 月 1 回手動で見直す (DynamoDB / Cognito から実数を取得して反映)
 * 自動化は overkill (build 時 fetch すると ENOSPC リスク)。
 */

const COMMUNITY_USER_COUNT = 26;
const SPOT_COUNT = fishingSpots.length;
const FAVCOUNT_TOTAL = 60;
const CATCH_REPORT_COUNT = 1;

export function CommunityStats() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <div className="rounded-2xl border bg-card p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex size-2 animate-pulse rounded-full bg-green-500" aria-hidden />
          <h2 className="text-sm font-bold sm:text-base">ツリスポを使う釣り人たち</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox icon={<Users className="size-4" />} label="釣り人" value={`${COMMUNITY_USER_COUNT}+`} unit="人" />
          <StatBox icon={<MapPin className="size-4" />} label="登録スポット" value={SPOT_COUNT.toLocaleString()} unit="件" />
          <StatBox icon={<Heart className="size-4" />} label="お気に入り" value={FAVCOUNT_TOTAL.toLocaleString()} unit="件" />
          <StatBox icon={<FileText className="size-4" />} label="釣果報告" value={CATCH_REPORT_COUNT.toLocaleString()} unit="件" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          2026 年 5 月時点 ・ アカウント登録すると お気に入り保存・釣行記録・釣果報告 ができます
        </p>
      </div>
    </section>
  );
}

function StatBox({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-3 sm:p-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold sm:text-2xl">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
