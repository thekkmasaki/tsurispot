"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, ImageIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShopPhotoGalleryProps {
  shopSlug: string;
  isPro: boolean;
  isBasic: boolean;
  /** 静的データの写真（フォールバック用） */
  staticPhotos?: string[];
}

export function ShopPhotoGallery({
  shopSlug,
  isPro,
  isBasic,
  staticPhotos,
}: ShopPhotoGalleryProps) {
  const [photos, setPhotos] = useState<string[]>(staticPhotos || []);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shop-photos?shop=${shopSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.photos && data.photos.length > 0) {
          setPhotos(data.photos);
        }
      })
      .catch(() => {});
  }, [shopSlug]);

  const maxPhotos = isPro ? undefined : 3;
  const displayPhotos = maxPhotos ? photos.slice(0, maxPhotos) : photos;

  if (displayPhotos.length === 0) return null;

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5" />
            店舗写真
            <Badge
              variant="outline"
              className={`text-[10px] ${
                isPro
                  ? "text-amber-600 border-amber-300"
                  : "text-blue-600 border-blue-300"
              }`}
            >
              {isPro ? "20枚まで" : "3枚まで"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayPhotos.map((photo, i) => {
              const isBlob = photo.startsWith("https://");
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxUrl(photo)}
                  className="aspect-[4/3] rounded-lg overflow-hidden border bg-muted relative cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                >
                  {isBlob ? (
                    <Image
                      src={photo}
                      alt={`店舗写真 ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                        <p className="text-xs opacity-60">写真 {i + 1}</p>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {isBasic && photos.length > 3 && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              ベーシックプランは写真3枚まで表示。プロプランなら全写真を表示。
            </p>
          )}
        </CardContent>
      </Card>

      {/* ライトボックス */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-4xl max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxUrl}
              alt="店舗写真（拡大）"
              width={1200}
              height={900}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
