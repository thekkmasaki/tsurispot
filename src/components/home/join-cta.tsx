import Link from "next/link";
import { ArrowRight, Heart, ClipboardCheck, Camera, Bell } from "lucide-react";

/**
 * Phase 6: Hero 直下 Green Join CTA (ui-ux-pro-max skill 推論)
 *
 * 設計判断:
 * - 色: Green (#16A34A) で他の青系から際立たせる (Skill 推奨)
 * - ログイン後に何ができるかを箇条書きで明示 (UX guideline 「information clarity」)
 * - Google login への直接導線 (1 タップ登録、 hurdle 最小)
 * - sticky にすると footer 等で邪魔なので、 hero 直下の通常 banner として配置
 */
export function JoinCTA() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-3 sm:py-4">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold sm:text-lg">無料登録で釣り体験を強化</h2>
            <ul className="mt-2 grid grid-cols-2 gap-1 text-xs text-white/90 sm:gap-2 sm:text-sm">
              <li className="inline-flex items-center gap-1.5">
                <Heart className="size-3.5 shrink-0" />
                お気に入り保存
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ClipboardCheck className="size-3.5 shrink-0" />
                釣行記録
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Camera className="size-3.5 shrink-0" />
                釣果報告
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Bell className="size-3.5 shrink-0" />
                釣果通知
              </li>
            </ul>
          </div>
          <Link prefetch={false}
            href="/login"
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white px-5 py-3 text-sm font-bold text-green-700 transition-colors hover:bg-green-50 min-h-[44px]"
          >
            Google で 1 タップ登録
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
