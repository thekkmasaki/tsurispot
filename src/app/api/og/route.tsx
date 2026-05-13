import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "default";

  if (type === "profile") {
    return generateProfileImage(searchParams);
  }

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
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}

async function loadNotoSansFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap",
    ).then((res) => res.text());
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?woff2['"]?\)/);
    if (!match) return null;
    return await fetch(match[1]).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

async function generateProfileImage(
  searchParams: URLSearchParams,
): Promise<Response> {
  const nickname = (searchParams.get("nickname") || "釣り人").slice(0, 24);
  const titleLabel = (searchParams.get("title") || "新人釣り師").slice(0, 16);
  const emoji = searchParams.get("emoji") || "🎒";
  const reportCount = Number(searchParams.get("reportCount") || "0");
  const fishCount = Number(searchParams.get("fishCount") || "0");
  const maxSize = Number(searchParams.get("maxSize") || "0");

  const fontData = await loadNotoSansFont();
  const fonts: { name: string; data: ArrayBuffer; style: "normal"; weight: 700 }[] = [];
  if (fontData) {
    fonts.push({ name: "NotoSansJP", data: fontData, style: "normal", weight: 700 });
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
          background: "linear-gradient(135deg, #0c4a6e 0%, #0e2f50 40%, #0a1628 100%)",
          position: "relative",
          fontFamily,
          padding: "60px",
        }}
      >
        {/* Top decorative line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background:
              "linear-gradient(90deg, #06b6d4, #22d3ee, #67e8f9, #22d3ee, #06b6d4)",
            display: "flex",
          }}
        />

        {/* Header row: emoji + nickname + title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              fontSize: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "160px",
              height: "160px",
              borderRadius: "80px",
              background: "rgba(34, 211, 238, 0.18)",
              border: "4px solid rgba(34, 211, 238, 0.6)",
            }}
          >
            {emoji}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: nickname.length > 14 ? "56px" : "72px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
                display: "flex",
              }}
            >
              {nickname}
            </div>
            <div
              style={{
                fontSize: "30px",
                color: "#22d3ee",
                fontWeight: 700,
                display: "flex",
              }}
            >
              {emoji} {titleLabel}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "60px",
          }}
        >
          <ProfileStat label="釣果数" value={reportCount} unit="件" />
          <ProfileStat label="魚種" value={fishCount} unit="種" />
          <ProfileStat label="最大サイズ" value={maxSize} unit="cm" />
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "60px",
            right: "60px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#22d3ee",
                display: "flex",
              }}
            >
              ツリスポ
            </div>
            <div style={{ fontSize: "24px", color: "#64748b", display: "flex" }}>|</div>
            <div style={{ fontSize: "22px", color: "#94a3b8", display: "flex" }}>
              tsurispot.com
            </div>
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              display: "flex",
            }}
          >
            釣果プロフィール
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}

function ProfileStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: "rgba(34, 211, 238, 0.1)",
        border: "2px solid rgba(34, 211, 238, 0.3)",
        borderRadius: "20px",
        padding: "24px 32px",
        flex: 1,
      }}
    >
      <div style={{ fontSize: "22px", color: "#94a3b8", display: "flex" }}>{label}</div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "6px",
        }}
      >
        <span
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: "24px", color: "#94a3b8" }}>{unit}</span>
      </div>
    </div>
  );
}
