"use client";

import { useState } from "react";
import { Map, ExternalLink, Satellite, Eye } from "lucide-react";

interface StreetViewSectionProps {
  latitude: number;
  longitude: number;
  spotName: string;
  address?: string;
}

export function StreetViewSection({
  latitude,
  longitude,
  spotName,
  address,
}: StreetViewSectionProps) {
  const [loaded, setLoaded] = useState(false);

  // 地名検索で正確な場所を表示
  const searchQuery = encodeURIComponent(`${spotName} ${address || ""}`);
  const mapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
  const aerialUrl = `https://www.google.com/maps/search/${searchQuery}?layer=satellite`;

  // APIキー不要の航空写真埋め込み（t=k で衛星画像モード）
  const satelliteEmbedSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&t=k&output=embed`;

  // ストリートビューの直接リンク（外部リンクとして残す）
  const streetViewUrl = `https://www.google.com/maps/@${latitude},${longitude},3a,75y,0h,90t/data=!3m1!1e1`;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold sm:mb-4">
        <Satellite className="size-5" />
        現地の様子
      </h2>

      <div className="overflow-hidden rounded-xl border bg-gray-50">
        {loaded ? (
          <iframe
            src={satelliteEmbedSrc}
            className="h-[280px] w-full sm:h-[360px]"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${spotName}の航空写真`}
          />
        ) : (
          <button
            onClick={() => setLoaded(true)}
            className="group flex h-[200px] w-full flex-col items-center justify-center gap-3 transition-colors hover:bg-gray-100 sm:h-[240px]"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-orange-100 transition-transform group-hover:scale-110">
              <Satellite className="size-7 text-orange-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                航空写真で釣り場を確認
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                クリックで{spotName}の上空からの様子を表示します
              </p>
            </div>
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <a
          href={aerialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          <Satellite className="size-4 text-orange-600" />
          航空写真で見る
          <ExternalLink className="size-3 text-muted-foreground" />
        </a>
        <a
          href={streetViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          <Eye className="size-4 text-green-600" />
          ストリートビューで見る
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
