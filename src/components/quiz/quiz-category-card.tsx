import Link from "next/link";

const colorMap: Record<string, { bg: string; border: string; iconBg: string }> = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    iconBg: "bg-orange-100",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    iconBg: "bg-teal-100",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    iconBg: "bg-yellow-100",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    iconBg: "bg-pink-100",
  },
};

const defaultColor = {
  bg: "bg-slate-50",
  border: "border-slate-200",
  iconBg: "bg-slate-100",
};

interface QuizCategoryCardProps {
  slug: string;
  name: string;
  description: string;
  icon: string;
  questionCount: number;
  color: string;
}

export function QuizCategoryCard({
  slug,
  name,
  description,
  icon,
  questionCount,
  color,
}: QuizCategoryCardProps) {
  const colors = colorMap[color] ?? defaultColor;

  return (
    <Link
      href={`/quiz/${slug}`}
      className={`group block rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
      aria-label={`${name} - ${questionCount}問`}
    >
      {/* アイコン */}
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${colors.iconBg} text-3xl transition-transform duration-200 group-hover:scale-110`}
        role="img"
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* カテゴリ名 + 問題数バッジ */}
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
        <span className="inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          {questionCount}問
        </span>
      </div>

      {/* 説明 */}
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>

      {/* 矢印 */}
      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-400 transition-colors group-hover:text-slate-700">
        <span>挑戦する</span>
        <span className="transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
