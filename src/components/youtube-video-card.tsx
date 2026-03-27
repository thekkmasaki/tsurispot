"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { YouTubeSearchLink } from "@/types";
import { ExternalLink, Play, Loader2 } from "lucide-react";

// --- 軽量YouTube埋め込み（サムネクリックで再生） ---
function YouTubeInlineEmbed({ videoId, title, thumbnail }: { videoId: string; title: string; thumbnail?: string }) {
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handlePlay = useCallback(() => setPlaying(true), []);
  const thumbUrl = thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div ref={ref} className="overflow-hidden rounded-lg border bg-black">
      <div className="relative aspect-video w-full">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : visible ? (
          <button
            onClick={handlePlay}
            className="group/play absolute inset-0 flex cursor-pointer items-center justify-center bg-black"
            aria-label={`${title}を再生`}
          >
            <img src={thumbUrl} alt={title} className="absolute inset-0 size-full object-cover transition-opacity group-hover/play:opacity-80" loading="lazy" />
            <div className="relative z-10 flex size-14 items-center justify-center rounded-xl bg-red-600 shadow-lg transition-transform group-hover/play:scale-110">
              <Play className="size-6 fill-white text-white" />
            </div>
          </button>
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
      </div>
      <div className="bg-card px-3 py-2">
        <p className="line-clamp-2 text-sm font-medium leading-tight">{title}</p>
      </div>
    </div>
  );
}

// --- 検索リンクフォールバック（APIキーなし時） ---
function YouTubeFallbackCard({ link, thumbnailUrl }: { link: YouTubeSearchLink; thumbnailUrl?: string }) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(link.searchQuery)}`;
  const [imgError, setImgError] = useState(false);
  const showThumb = !!thumbnailUrl && !imgError;

  return (
    <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      {showThumb ? (
        <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-800">
          <img src={thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover brightness-[0.6] transition-transform duration-300 group-hover:scale-105" loading="lazy" onError={() => setImgError(true)} />
          <div className="relative z-10 flex size-12 items-center justify-center rounded-xl bg-red-600/90 shadow-lg transition-transform group-hover:scale-110">
            <Play className="size-5 fill-white text-white" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 px-3 py-2">
          <Play className="size-4 fill-white text-white" />
          <span className="text-xs font-bold text-white">YouTube で動画を検索</span>
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

// --- メインコンポーネント ---
interface YouTubeVideoResult {
  videoId: string;
  title: string;
  thumbnail: string;
}

function YouTubeSearchEmbed({ query }: { query: string }) {
  const [videos, setVideos] = useState<YouTubeVideoResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.videos && data.videos.length > 0) {
          setVideos(data.videos);
        } else {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (failed || videos.length === 0) return null;

  return (
    <>
      {videos.map((v) => (
        <YouTubeInlineEmbed key={v.videoId} videoId={v.videoId} title={v.title} thumbnail={v.thumbnail} />
      ))}
    </>
  );
}

export function YouTubeVideoList({ links, thumbnailUrl }: { links?: YouTubeSearchLink[]; thumbnailUrl?: string }) {
  if (!links || links.length === 0) return null;

  const [useEmbed, setUseEmbed] = useState(true);
  const [checked, setChecked] = useState(false);

  // APIキーがあるかチェック（最初のクエリで判定）
  useEffect(() => {
    fetch(`/api/youtube-search?q=${encodeURIComponent(links[0].searchQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        setUseEmbed(data.videos && data.videos.length > 0);
      })
      .catch(() => setUseEmbed(false))
      .finally(() => setChecked(true));
  }, [links]);

  if (!checked) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {links.map((_, i) => (
          <div key={i} className="flex aspect-video items-center justify-center rounded-lg border bg-muted">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ))}
      </div>
    );
  }

  if (!useEmbed) {
    // APIキーなし → フォールバック
    return (
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {links.map((link, i) => (
          <YouTubeFallbackCard key={`${link.searchQuery}-${i}`} link={link} thumbnailUrl={thumbnailUrl} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {links.map((link, i) => (
        <YouTubeSearchEmbed key={`${link.searchQuery}-${i}`} query={link.searchQuery} />
      ))}
    </div>
  );
}
