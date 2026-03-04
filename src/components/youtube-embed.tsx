"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play } from "lucide-react";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePlay = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div ref={containerRef} className="overflow-hidden rounded-lg border bg-black">
      <div className="relative aspect-video w-full">
        {isLoaded ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title || "YouTube動画"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
            loading="lazy"
          />
        ) : isVisible ? (
          <button
            onClick={handlePlay}
            className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-black"
            aria-label={`${title || "動画"}を再生`}
          >
            {/* サムネイル画像 */}
            <img
              src={thumbnailUrl}
              alt={title || "YouTube動画サムネイル"}
              className="absolute inset-0 size-full object-cover transition-opacity group-hover:opacity-80"
              loading="lazy"
            />
            {/* 再生ボタン */}
            <div className="relative z-10 flex size-16 items-center justify-center rounded-xl bg-red-600 shadow-lg transition-transform group-hover:scale-110 sm:size-18">
              <Play className="size-7 fill-white text-white sm:size-8" />
            </div>
          </button>
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
      </div>
      {title && (
        <div className="bg-card px-3 py-2">
          <p className="text-sm font-medium leading-tight">{title}</p>
        </div>
      )}
    </div>
  );
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
}

interface YouTubeEmbedListProps {
  videos: YouTubeVideo[];
  sectionTitle?: string;
  description?: string;
}

export function YouTubeEmbedList({
  videos,
  sectionTitle = "関連する釣り方動画",
  description,
}: YouTubeEmbedListProps) {
  if (!videos || videos.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Play className="size-5" />
        {sectionTitle}
      </h2>
      {description && (
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {videos.map((video) => (
          <YouTubeEmbed
            key={video.videoId}
            videoId={video.videoId}
            title={video.title}
          />
        ))}
      </div>
    </section>
  );
}
