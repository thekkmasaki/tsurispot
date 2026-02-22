"use client";

import { useState } from "react";
import { Map, ExternalLink, MapPin, Satellite } from "lucide-react";

interface StreetViewSectionProps {
  latitude: number;
  longitude: number;
  spotName: string;
  address?: string;
}

const EMBED_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

export function StreetViewSection({
  latitude,
  longitude,
  spotName,
  address,
}: StreetViewSectionProps) {
  const [loaded, setLoaded] = useState(false);

  // 地名検索で正確な場所を表示（座標指定より精度が高い）
  const searchQuery = encodeURIComponent(`${spotName} ${address || ""}`);
  const mapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
  const aerialUrl = `https://www.google.com/maps/search/${searchQuery}?layer=satellite`;

  // 衛星写真の埋め込み（地名検索で正確な場所を表示）
  const satelliteEmbedSrc = EMBED_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${EMBED_KEY}&q=${searchQuery}&maptype=satellite&zoom=16`
    : null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold sm:mb-4">
        <Satellite className="size-5" />
        現地の様子
      </h2>

      {satelliteEmbedSrc ? (
        <div className="overflow-hidden rounded-xl border bg-gray-50">
          {loaded ? (
            <iframe
              src={satelliteEmbedSrc}
              className="h-[280px] w-full sm:h-[360px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${spotName}の衛星写真`}
            />
          ) : (
            <button
              onClick={() => setLoaded(true)}
              className="group flex h-[200px] w-full flex-col items-center justify-center gap-3 transition-colors hover:bg-gray-100 sm:h-[240px]"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-blue-100 transition-transform group-hover:scale-110">
                <Satellite className="size-7 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  衛星写真で釣り場を確認
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  クリックで{spotName}の地形・周辺環境を表示します
                </p>
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="flex h-[160px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-gray-50/50 sm:h-[200px]">
          <MapPin className="size-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            下のリンクから現地の様子を確認できます
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3">
        <a
          href={aerialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          <Satellite className="size-4 text-green-600" />
          航空写真で見る
          <ExternalLink className="size-3 text-muted-foreground" />
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          <Map className="size-4 text-blue-600" />
          Google Mapsで見る
          <ExternalLink className="size-3 text-muted-foreground" />
        </a>
      </div>
    </section>
  );
}
