import { ImageResponse } from "next/og";
import { getSpotBySlug } from "@/lib/data/spots";
import { SPOT_TYPE_LABELS } from "@/types";

export const runtime = "nodejs";
export const alt = "ツリスポ - 釣りスポット情報";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// スポットタイプ別のグラデーション
const SPOT_GRADIENTS: Record<string, string> = {
  port: "linear-gradient(135deg, #0369a1 0%, #1e40af 100%)",
  beach: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
  rocky: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
  river: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
  pier: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
  breakwater: "linear-gradient(135deg, #475569 0%, #334155 100%)",
};

// スポットタイプ別のアイコン絵文字
const SPOT_ICONS: Record<string, string> = {
  port: "⚓",
  beach: "🏖",
  rocky: "🪨",
  river: "🏞",
  pier: "🌉",
  breakwater: "🌊",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spot = getSpotBySlug(slug);

  // フォールバック: スポットが見つからない場合
  if (!spot) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #0284c7 0%, #1e40af 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 700, color: "white", display: "flex" }}>
            ツリスポ
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.8)", display: "flex", marginTop: 8 }}>
            釣りスポット情報
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // フォント読み込み
  let fontData: ArrayBuffer | undefined;
  try {
    const fontRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap"
    );
    const css = await fontRes.text();
    const fontUrlMatch = css.match(/url\(([^)]+)\)/);
    if (fontUrlMatch) {
      const fontFileRes = await fetch(fontUrlMatch[1]);
      fontData = await fontFileRes.arrayBuffer();
    }
  } catch {
    // フォント取得失敗時はデフォルトフォント
  }

  const gradient = SPOT_GRADIENTS[spot.spotType] || SPOT_GRADIENTS.port;
  const icon = SPOT_ICONS[spot.spotType] || "🎣";
  const typeLabel = SPOT_TYPE_LABELS[spot.spotType];

  // 釣れる魚（最大3種）
  const topFish = spot.catchableFish
    .filter((cf) => cf.peakSeason)
    .slice(0, 3)
    .map((cf) => cf.fish.name);
  // ピークシーズンの魚が3種未満なら残りを補完
  if (topFish.length < 3) {
    const remaining = spot.catchableFish
      .filter((cf) => !cf.peakSeason)
      .slice(0, 3 - topFish.length)
      .map((cf) => cf.fish.name);
    topFish.push(...remaining);
  }

  // スポット名が長い場合のフォントサイズ調整
  const nameLength = spot.name.length;
  const nameFontSize = nameLength <= 6 ? 72 : nameLength <= 10 ? 60 : nameLength <= 14 ? 48 : 40;

  return new ImageResponse(
    (
      <div
        style={{
          background: gradient,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: fontData ? "Noto Sans JP" : "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 背景装飾 */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />

        {/* ヘッダー: タイプバッジ + 評価 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "40px 60px 0",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "12px",
              padding: "10px 20px",
            }}
          >
            <span style={{ fontSize: 28 }}>{icon}</span>
            <span style={{ fontSize: 24, color: "white", fontWeight: 700 }}>
              {typeLabel}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: 28, color: "#fbbf24" }}>★</span>
            <span style={{ fontSize: 28, color: "white", fontWeight: 700 }}>
              {spot.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            padding: "0 60px",
            gap: "12px",
          }}
        >
          {/* スポット名 */}
          <div
            style={{
              fontSize: nameFontSize,
              fontWeight: 700,
              color: "white",
              display: "flex",
              lineHeight: 1.2,
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {spot.name}
          </div>

          {/* 都道府県・エリア */}
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.85)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>📍</span>
            <span>
              {spot.region.prefecture} {spot.region.areaName}
            </span>
          </div>

          {/* 釣れる魚 */}
          {topFish.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              {topFish.map((fishName) => (
                <div
                  key={fishName}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255,255,255,0.18)",
                    borderRadius: "10px",
                    padding: "8px 18px",
                  }}
                >
                  <span style={{ fontSize: 20 }}>🐟</span>
                  <span style={{ fontSize: 22, color: "white", fontWeight: 700 }}>
                    {fishName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 60px 32px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, color: "white", display: "flex" }}>
              ツリスポ
            </div>
            <div
              style={{
                width: "2px",
                height: "24px",
                background: "rgba(255,255,255,0.3)",
                display: "flex",
              }}
            />
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", display: "flex" }}>
              tsurispot.com
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              fontSize: 18,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {spot.hasParking && <span>🅿 駐車場</span>}
            {spot.hasToilet && <span>🚻 トイレ</span>}
            {spot.isFree && <span>無料</span>}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Noto Sans JP",
              data: fontData,
              style: "normal" as const,
              weight: 700 as const,
            },
          ]
        : undefined,
    }
  );
}
