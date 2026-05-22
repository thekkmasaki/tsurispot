"use client";

import { useState } from "react";
import Image from "next/image";
import { YouTubeSearchLink } from "@/types";
import { ExternalLink, Play } from "lucide-react";

function YouTubeFallbackCard({ link, thumbnailUrl }: { link: YouTubeSearchLink; thumbnailUrl?: string }) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(link.searchQuery)}`;
  const [imgError, setImgError] = useState(false);
  const showThumb = !!thumbnailUrl && !imgError;

  return (
    <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      {showThumb ? (
        <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-800">
          <Image src={thumbnailUrl!} alt={`${link.label} の動画サムネイル`} fill className="object-cover brightness-[0.6] transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" onError={() => setImgError(true)} />
          <div className="relative z-10 flex size-12 items-center justify-center rounded-xl bg-red-600/90 shadow-lg transition-transform group-hover:scale-110">
            <Play className="size-5 fill-white text-white" />
          </div>
        </div>
      ) : (
        <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-1/4 top-1/4 size-32 rounded-full bg-red-500 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 size-24 rounded-full bg-red-600 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-red-600 shadow-lg transition-transform group-hover:scale-110">
              <Play className="size-6 fill-white text-white" />
            </div>
            <span className="text-xs font-bold text-white/80">YouTube で動画を検索</span>
          </div>
        </div>
      )}
      <div className="bg-card px-3 py-2.5">
        <h4 className="text-sm font-semibold leading-snug group-hover:text-red-600">{link.label}</h4>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{link.description}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          「{link.searchQuery}」で検索 <ExternalLink className="size-3" />
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
        <YouTubeFallbackCard key={`${link.searchQuery}-${i}`} link={link} thumbnailUrl={thumbnailUrl} />
      ))}
    </div>
  );
}
