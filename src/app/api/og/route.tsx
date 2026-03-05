import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "ツリスポ 釣りガイド";
  const description = searchParams.get("description") || "";
  const emoji = searchParams.get("emoji") || "🐟";

  // Truncate description to 60 chars
  const truncatedDesc =
    description.length > 60 ? description.slice(0, 57) + "..." : description;

  // Load Noto Sans JP font from Google Fonts
  const fontData = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap"
  )
    .then((res) => res.text())
    .then((css) => {
      const match = css.match(
        /src:\s*url\(([^)]+)\)\s*format\(['"]?woff2['"]?\)/
      );
      if (!match) throw new Error("Font URL not found");
      return fetch(match[1]);
    })
    .then((res) => res.arrayBuffer())
    .catch(() => null);

  const fonts: { name: string; data: ArrayBuffer; style: "normal"; weight: 700 }[] = [];
  if (fontData) {
    fonts.push({
      name: "NotoSansJP",
      data: fontData,
      style: "normal" as const,
      weight: 700 as const,
    });
  }

  const fontFamily = fontData ? "NotoSansJP" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0c4a6e 0%, #0e2f50 40%, #0a1628 100%)",
          position: "relative",
          fontFamily,
        }}
      >
        {/* Decorative wave pattern overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "120px",
            background:
              "linear-gradient(0deg, rgba(14,116,144,0.3) 0%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* Top decorative line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #06b6d4, #22d3ee, #67e8f9, #22d3ee, #06b6d4)",
            display: "flex",
          }}
        />

        {/* Emoji */}
        <div
          style={{
            fontSize: "96px",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          {emoji}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 20 ? "48px" : "56px",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: "1000px",
            padding: "0 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {title}
        </div>

        {/* Description */}
        {truncatedDesc && (
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              textAlign: "center",
              maxWidth: "900px",
              marginTop: "20px",
              padding: "0 40px",
              lineHeight: 1.5,
              display: "flex",
            }}
          >
            {truncatedDesc}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#22d3ee",
              display: "flex",
            }}
          >
            ツリスポ
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#64748b",
              display: "flex",
            }}
          >
            |
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#64748b",
              display: "flex",
            }}
          >
            tsurispot.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
