import { ImageResponse } from "next/og";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";

export const runtime = "edge";
export const alt = "ツリスポ - 全国の釣り場情報サイト";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const spotCount = fishingSpots.length;
  const fishCount = fishSpecies.length;

  let fontData: ArrayBuffer | undefined;
  try {
    const fontRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap"
    );
    const css = await fontRes.text();
    const fontUrlMatch = css.match(/url\(([^)]+)\)/);
    if (fontUrlMatch) {
      const fontFileRes = await fetch(fontUrlMatch[1]);
      fontData = await fontFileRes.arrayBuffer();
    }
  } catch {
    // フォント取得失敗時はデフォルトフォントを使用
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0284c7 0%, #0f4c81 50%, #1e3a5f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fontData ? "Noto Sans JP" : "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 背景装飾 - 波パターン */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "200px",
            background: "linear-gradient(0deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 60,
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 120,
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />

        {/* メインコンテンツ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {/* ロゴ */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "white",
              display: "flex",
              letterSpacing: "0.05em",
              textShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            ツリスポ
          </div>

          {/* サブタイトル */}
          <div
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.9)",
              display: "flex",
              marginTop: "4px",
            }}
          >
            全国の釣り場情報サイト
          </div>

          {/* 統計バッジ */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "12px 24px",
              }}
            >
              <div style={{ fontSize: 28, color: "white", display: "flex" }}>
                {spotCount}+ スポット
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "12px 24px",
              }}
            >
              <div style={{ fontSize: 28, color: "white", display: "flex" }}>
                {fishCount} 魚種
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "12px 24px",
              }}
            >
              <div style={{ fontSize: 28, color: "white", display: "flex" }}>
                装備ガイド
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            display: "flex",
            fontSize: 20,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          tsurispot.com
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
              style: "normal",
              weight: 700,
            },
          ]
        : undefined,
    }
  );
}
