"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { WantedSpot } from "@/lib/photo-wanted";
import { WantedHero } from "./wanted-hero";
import { distanceKm, NEAR_KM } from "./geo";

/**
 * トップの WANTED 帯。位置情報がすでに許可されている人にだけ「あなたの近く 残りN」を出す
 * （許可ダイアログはここでは出さない）。それ以外は全国の件数と一覧への導線。
 */
export function WantedBand({ total }: { total: number }) {
  const [near, setNear] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const perms = navigator.permissions;
    if (!perms?.query || !navigator.geolocation) return;
    perms
      .query({ name: "geolocation" as PermissionName })
      .then((st) => {
        if (st.state !== "granted" || !active) return;
        navigator.geolocation.getCurrentPosition(
          (p) => {
            fetch("/api/photo-wanted/list")
              .then((r) => (r.ok ? r.json() : []))
              .then((list: WantedSpot[]) => {
                if (!active) return;
                const n = list.filter(
                  (s) => distanceKm(p.coords.latitude, p.coords.longitude, s.lat, s.lng) <= NEAR_KM
                ).length;
                setNear(n);
              })
              .catch(() => {});
          },
          () => {},
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <WantedHero
      as="h2"
      title="WANTED"
      lead="釣り場の写真を募集中"
      note={
        near !== null && near > 0 ? (
          <p>
            あなたの近く{NEAR_KM}km以内で 残り<span className="mx-1 text-5xl font-black sm:text-6xl">{near}</span>スポット
          </p>
        ) : (
          <p>
            写真がまだない釣り場 全国 残り<span className="mx-1 text-4xl font-black sm:text-5xl">{total.toLocaleString()}</span>か所
          </p>
        )
      }
    >
      <Link
        prefetch={false}
        href="/photo-wanted"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-lg border-2 border-white px-8 text-sm font-bold transition-colors hover:bg-white hover:text-gray-900"
      >
        写真募集中の釣り場を見る
      </Link>
    </WantedHero>
  );
}
