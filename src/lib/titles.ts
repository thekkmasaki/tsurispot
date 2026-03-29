export interface Title {
  label: string;
  emoji: string;
  className: string;
  headerClass: string;
}

const TIERS: (Title & { min: number })[] = [
  { min: 200, label: "釣神",           emoji: "🌟", className: "bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold animate-pulse", headerClass: "from-red-500/90 via-amber-500/80 to-yellow-400/70" },
  { min: 100, label: "伝説の釣り師",   emoji: "👑", className: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold",            headerClass: "from-yellow-400/80 via-amber-400/70 to-orange-300/60" },
  { min: 50,  label: "釣りの達人",     emoji: "💎", className: "bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold",               headerClass: "from-pink-400/70 via-rose-300/60 to-fuchsia-300/50" },
  { min: 30,  label: "凄腕アングラー", emoji: "🔥", className: "bg-orange-500 text-white font-semibold",                                        headerClass: "from-orange-400/70 via-amber-300/60 to-yellow-200/50" },
  { min: 20,  label: "マスター",       emoji: "⭐", className: "bg-purple-500 text-white font-semibold",                                        headerClass: "from-purple-400/60 via-violet-300/50 to-indigo-200/40" },
  { min: 10,  label: "ベテラン",       emoji: "🏅", className: "bg-blue-500 text-white",                                                        headerClass: "from-blue-300/50 via-sky-200/40 to-cyan-100/30" },
  { min: 5,   label: "一人前",         emoji: "🐟", className: "bg-teal-500 text-white",                                                        headerClass: "from-teal-200/40 via-cyan-100/30 to-white/80" },
  { min: 3,   label: "見習い釣り師",   emoji: "🎣", className: "bg-green-500 text-white",                                                       headerClass: "from-green-100/40 via-emerald-50/30 to-white/80" },
  { min: 1,   label: "釣りデビュー",   emoji: "🔰", className: "bg-gray-400 text-white",                                                        headerClass: "from-gray-100/40 via-slate-50/30 to-white/80" },
  { min: 0,   label: "新人釣り師",     emoji: "🎒", className: "bg-gray-300 text-gray-700",                                                     headerClass: "from-white/95 via-white/90 to-sand-light/80" },
];

export const ALL_TIERS = TIERS.map(({ min, label, emoji, className }) => ({ min, label, emoji, className }));

export function getTitle(reportCount: number): Title {
  for (const tier of TIERS) {
    if (reportCount >= tier.min) {
      return { label: tier.label, emoji: tier.emoji, className: tier.className, headerClass: tier.headerClass };
    }
  }
  return TIERS[TIERS.length - 1];
}

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
  return null;
}
