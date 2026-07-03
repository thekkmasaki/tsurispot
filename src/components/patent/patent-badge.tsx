import Link from "next/link";

/**
 * 「特許出願中」バッジ。
 * AI解析セクション・AI解析地図など、特許技術（特願2026-042836）による
 * 機能の近くに表示し、/technology で技術解説に誘導する。
 */
export function PatentBadge({ className = "" }: { className?: string }) {
  return (
    <Link prefetch={false}
      href="/technology"
      className={`inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 ${className}`}
      title="ツリスポのAI釣り場解析技術（特許出願中）について"
    >
      特許出願中
      <span className="text-[10px] font-normal opacity-80">特願2026-042836</span>
    </Link>
  );
}
