import { YouTubeSearchLink } from "@/types";
import { ExternalLink, Play, Search } from "lucide-react";

function YouTubeLinkCard({ link }: { link: YouTubeSearchLink }) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(link.searchQuery)}`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
    >
      {/* サムネイル風エリア */}
      <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
        {/* 検索キーワード表示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
            <Search className="size-3" />
            {link.searchQuery}
          </div>
        </div>
        {/* 再生ボタン */}
        <div className="relative z-10 flex size-12 items-center justify-center rounded-xl bg-red-600 shadow-lg transition-transform group-hover:scale-110">
          <Play className="size-5 fill-white text-white" />
        </div>
        {/* YouTube バッジ */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
          <Play className="size-2.5 fill-white text-white" />
          YouTube
        </div>
      </div>
      {/* テキストエリア */}
      <div className="bg-card px-3 py-2.5">
        <h4 className="text-sm font-semibold leading-snug group-hover:text-red-600">
          {link.label}
        </h4>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {link.description}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          動画を検索
          <ExternalLink className="size-3" />
        </p>
      </div>
    </a>
  );
}

export function YouTubeVideoList({ links }: { links?: YouTubeSearchLink[] }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {links.map((link, i) => (
        <YouTubeLinkCard key={`${link.searchQuery}-${i}`} link={link} />
      ))}
    </div>
  );
}
