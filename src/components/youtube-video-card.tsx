import { YouTubeSearchLink } from "@/types";
import { ExternalLink, Play } from "lucide-react";

function YouTubeLinkCard({ link, thumbnailUrl }: { link: YouTubeSearchLink; thumbnailUrl?: string }) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(link.searchQuery)}`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
    >
      {/* サムネイルエリア */}
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-800">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 size-full object-cover brightness-75 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800" />
        )}
        {/* 再生ボタン */}
        <div className="relative z-10 flex size-12 items-center justify-center rounded-xl bg-red-600/90 shadow-lg transition-transform group-hover:scale-110">
          <Play className="size-5 fill-white text-white" />
        </div>
        {/* YouTube バッジ */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
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

export function YouTubeVideoList({ links, thumbnailUrl }: { links?: YouTubeSearchLink[]; thumbnailUrl?: string }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {links.map((link, i) => (
        <YouTubeLinkCard key={`${link.searchQuery}-${i}`} link={link} thumbnailUrl={thumbnailUrl} />
      ))}
    </div>
  );
}
