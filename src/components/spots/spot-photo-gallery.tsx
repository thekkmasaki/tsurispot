import Image from "next/image";
import { Camera } from "lucide-react";
import type { SpotPhoto } from "@/types";

interface SpotPhotoGalleryProps {
  photos?: SpotPhoto[];
  spotName: string;
}

export function SpotPhotoGallery({ photos, spotName }: SpotPhotoGalleryProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold sm:mb-4">
        <Camera className="size-5" />
        釣り場の様子
      </h2>
      {/* PC: グリッド表示 / モバイル: 横スクロール */}
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0">
        {photos.map((photo, index) => (
          <div key={index} className="shrink-0 w-[280px] md:w-auto">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={photo.url}
                alt={photo.alt || `${spotName}の写真`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 280px, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="mt-1 flex items-end justify-between gap-2">
              <p className="text-xs text-muted-foreground truncate">
                {photo.alt}
              </p>
              <p className="text-xs text-muted-foreground shrink-0">
                {photo.credit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
