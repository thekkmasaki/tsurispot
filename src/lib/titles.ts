// 称号（バッジ）システム — 投稿数に応じたユーザー称号

export interface Title {
  label: string;
  emoji: string;
  className: string;
}

const TIERS: { min: number; label: string; emoji: string; className: string }[] = [
  { min: 200, label: "釣神",         emoji: "🌟", className: "bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold animate-pulse" },
  { min: 100, label: "伝説の釣り師", emoji: "👑", className: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold" },
  { min: 50,  label: "釣りの達人",   emoji: "💎", className: "bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold" },
  { min: 30,  label: "凄腕アングラー", emoji: "🔥", className: "bg-orange-500 text-white font-semibold" },
  { min: 20,  label: "マスター",     emoji: "⭐", className: "bg-purple-500 text-white font-semibold" },
  { min: 10,  label: "ベテラン",     emoji: "🏅", className: "bg-blue-500 text-white" },
  { min: 5,   label: "一人前",       emoji: "🐟", className: "bg-teal-500 text-white" },
  { min: 3,   label: "見習い釣り師", emoji: "🎣", className: "bg-green-500 text-white" },
  { min: 1,   label: "釣りデビュー", emoji: "🔰", className: "bg-gray-400 text-white" },
  { min: 0,   label: "新人釣り師", emoji: "🎒", className: "bg-gray-300 text-gray-700" },
];

/** 投稿数から称号を取得。ログイン済みなら必ず返る */
export function getTitle(reportCount: number): Title {
  for (const tier of TIERS) {
    if (reportCount >= tier.min) {
      return { label: tier.label, emoji: tier.emoji, className: tier.className };
    }
  }
  return { label: "新人釣り師", emoji: "🎒", className: "bg-gray-300 text-gray-700" };
}

/** 次のランクまでの情報を取得 */
export function getNextTier(reportCount: number): { label: string; emoji: string; remaining: number } | null {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (TIERS[i].min > reportCount) {
      return {
        label: TIERS[i].label,
        emoji: TIERS[i].emoji,
        remaining: TIERS[i].min - reportCount,
      };
    }
  }
  return null; // 最高ランク到達
}
