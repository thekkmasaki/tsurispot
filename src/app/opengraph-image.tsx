import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ツリスポ - 釣りスポット総合情報サイト";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        <div style={{ fontSize: 80, fontWeight: "bold", color: "white", marginBottom: 16, display: "flex" }}>
          ツリスポ
        </div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.8)", display: "flex" }}>
          釣りスポット総合情報サイト
        </div>
        <div style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: 16, display: "flex" }}>
          全国103+スポット | 30魚種 | 装備ガイド
        </div>
      </div>
    ),
    { ...size }
  );
}
