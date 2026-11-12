"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * トップのヒーロー背景: 編集部撮影の写真を順番にクロスフェードで切り替える（サウナイキタイ型）。
 * 写真はグレー化して海の青に乗算し、明暗だけをうっすら残す。
 *
 * 表示速度を守るため、
 * - 1枚目だけを priority で SSR（LCP 候補）。
 * - 2枚目以降はページ表示から少し経ってからマウントして読み込む。
 * - prefers-reduced-motion の人には切り替えない。
 */
// オーナー指定（2026-11-12）: 明石海峡大橋の釣り場写真1枚に固定。
// 枚数を増やせばそのままクロスフェードに戻る。
const PHOTOS: readonly string[] = ["/images/hero/akashi-bridge.jpg"];

const INTERVAL_MS = 6000;
const START_DELAY_MS = 2500;

const IMG_CLASS =
  "pointer-events-none select-none object-cover grayscale contrast-125 mix-blend-multiply transition-opacity duration-[1500ms] ease-in-out";

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [rest, setRest] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setRest(true);
      timer = setInterval(() => setIndex((i) => (i + 1) % PHOTOS.length), INTERVAL_MS);
    }, START_DELAY_MS);
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Image
        src={PHOTOS[0]}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn(IMG_CLASS, index === 0 ? "opacity-45" : "opacity-0")}
      />
      {rest &&
        PHOTOS.slice(1).map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="100vw"
            className={cn(IMG_CLASS, index === i + 1 ? "opacity-45" : "opacity-0")}
          />
        ))}
    </div>
  );
}
