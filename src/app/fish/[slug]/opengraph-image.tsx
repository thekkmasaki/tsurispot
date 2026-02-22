import { ImageResponse } from "next/og";
import { getFishBySlug } from "@/lib/data/fish";

export const runtime = "nodejs";
export const alt = "ツリスポ - 魚種情報";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// カテゴリ別のグラデーション
const CATEGORY_GRADIENTS: Record<string, string> = {
  sea: "linear-gradient(135deg, #0e7490 0%, #155e75 50%, #164e63 100%)",
  freshwater: "linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)",
  brackish: "linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)",
};

// 難易度ラベル
const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "初心者向け",
  intermediate: "中級者向け",
  advanced: "上級者向け",
};

// 難易度の色
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "rgba(34, 197, 94, 0.9)",
  intermediate: "rgba(234, 179, 8, 0.9)",
  advanced: "rgba(239, 68, 68, 0.9)",
};

// 月名
const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fish = getFishBySlug(slug);

  // フォールバック
  if (!fish) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #0e7490 0%, #164e63 100%)",
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
            魚種情報
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

  const gradient = CATEGORY_GRADIENTS[fish.category] || CATEGORY_GRADIENTS.sea;
  const diffLabel = DIFFICULTY_LABELS[fish.difficulty] || "初心者向け";
  const diffColor = DIFFICULTY_COLORS[fish.difficulty] || DIFFICULTY_COLORS.beginner;

  // 旬の月表示
  const peakMonthLabels = fish.peakMonths
    .sort((a, b) => a - b)
    .map((m) => MONTH_NAMES[m - 1]);

  // 魚名のフォントサイズ調整
  const nameLength = fish.name.length;
  const nameFontSize = nameLength <= 4 ? 88 : nameLength <= 6 ? 72 : nameLength <= 10 ? 56 : 44;

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
            top: -80,
            right: -80,
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: "40%",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
          }}
        />

        {/* ヘッダー: 難易度 + カテゴリ */}
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
            }}
          >
            <div
              style={{
                background: diffColor,
                borderRadius: "10px",
                padding: "8px 20px",
                display: "flex",
              }}
            >
              <span style={{ fontSize: 22, color: "white", fontWeight: 700 }}>
                {diffLabel}
              </span>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: "10px",
                padding: "8px 20px",
                display: "flex",
              }}
            >
              <span style={{ fontSize: 22, color: "white" }}>
                {fish.family}
              </span>
            </div>
          </div>
          {/* 味評価 */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{
                  fontSize: 26,
                  color: i < fish.tasteRating ? "#fbbf24" : "rgba(255,255,255,0.2)",
                }}
              >
                ★
              </span>
            ))}
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", marginLeft: 8 }}>
              味
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
            gap: "8px",
          }}
        >
          {/* 魚名 */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "20px",
            }}
          >
            <div
              style={{
                fontSize: nameFontSize,
                fontWeight: 700,
                color: "white",
                display: "flex",
                textShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {fish.name}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.6)",
                display: "flex",
              }}
            >
              {fish.nameEnglish}
            </div>
          </div>

          {/* サブテキスト */}
          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.85)",
              display: "flex",
              marginTop: "4px",
            }}
          >
            の釣り方・釣れるスポット
          </div>

          {/* サイズ + 旬 */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "24px",
            }}
          >
            {/* サイズ */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "10px",
                padding: "10px 20px",
              }}
            >
              <span style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>サイズ</span>
              <span style={{ fontSize: 24, color: "white", fontWeight: 700 }}>
                {fish.sizeCm}
              </span>
            </div>

            {/* 旬の月 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "10px",
                padding: "10px 20px",
              }}
            >
              <span style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>旬</span>
              <span style={{ fontSize: 24, color: "white", fontWeight: 700 }}>
                {peakMonthLabels.join("・")}
              </span>
            </div>
          </div>

          {/* 釣法 */}
          {fish.fishingMethods && fish.fishingMethods.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              {fish.fishingMethods.slice(0, 3).map((method) => (
                <div
                  key={method.methodName}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255,255,255,0.18)",
                    borderRadius: "10px",
                    padding: "8px 16px",
                  }}
                >
                  <span style={{ fontSize: 18 }}>🎣</span>
                  <span style={{ fontSize: 20, color: "white" }}>
                    {method.methodName}
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
              fontSize: 20,
              color: "rgba(255,255,255,0.5)",
              display: "flex",
            }}
          >
            釣りスポット総合情報サイト
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
