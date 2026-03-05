import { ImageResponse } from "next/og";
import { getMonthlyGuide } from "@/lib/data/monthly-guides";
import { getFishBySlug } from "@/lib/data/fish";
import { getOgFont } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "ツリスポ - 月別釣りガイド";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 月ごとのグラデーション
const MONTH_GRADIENTS: Record<number, string> = {
  1: "linear-gradient(135deg, #1e3a5f 0%, #0c1f3d 100%)",   // 青紺系（厳冬）
  2: "linear-gradient(135deg, #2b3a67 0%, #1a1f4e 100%)",   // 紺藍系（最寒期）
  3: "linear-gradient(135deg, #d4748e 0%, #a8c256 100%)",   // 桜ピンク→黄緑（春の訪れ）
  4: "linear-gradient(135deg, #e88da4 0%, #8dc26f 100%)",   // ピンク→新緑（春本番）
  5: "linear-gradient(135deg, #3aab6e 0%, #1fa2a2 100%)",   // 新緑→ターコイズ（初夏）
  6: "linear-gradient(135deg, #2a9d8f 0%, #258ea6 100%)",   // ターコイズ系（梅雨）
  7: "linear-gradient(135deg, #e76f51 0%, #e9c46a 100%)",   // 橙→黄（夏本番）
  8: "linear-gradient(135deg, #e63946 0%, #f4a261 100%)",   // 赤→橙（真夏）
  9: "linear-gradient(135deg, #d4700a 0%, #a65c1e 100%)",   // 紅葉オレンジ（初秋）
  10: "linear-gradient(135deg, #c96218 0%, #8b4513 100%)",  // オレンジ→茶（秋深まる）
  11: "linear-gradient(135deg, #5b3f8c 0%, #2c2456 100%)",  // 紫→紺（晩秋）
  12: "linear-gradient(135deg, #4a3580 0%, #1c1548 100%)",  // 紫紺系（初冬）
};

export default async function Image({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const guide = getMonthlyGuide(month);

  // フォールバック: ガイドが見つからない場合
  if (!guide) {
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
            月別釣りガイド
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // フォント読み込み（モジュールレベルキャッシュ）
  const fontData = await getOgFont();

  const gradient = MONTH_GRADIENTS[guide.month] || MONTH_GRADIENTS[1];

  // topFish のslugを魚名に変換（上位4種）
  const topFishNames = guide.topFish
    .slice(0, 4)
    .map((slug) => {
      const fish = getFishBySlug(slug);
      return fish?.name || slug;
    });

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
        {/* 背景装飾: 大きな円 */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />
        {/* 背景装飾: 小さなアクセント円 */}
        <div
          style={{
            position: "absolute",
            top: 200,
            right: 120,
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
          }}
        />

        {/* ヘッダー: 月のemoji + 月名 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "48px 60px 0",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: 72 }}>{guide.emoji}</span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: "white",
                display: "flex",
                lineHeight: 1.1,
                textShadow: "0 2px 12px rgba(0,0,0,0.3)",
              }}
            >
              {guide.nameJa}の釣り
            </div>
            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.7)",
                display: "flex",
              }}
            >
              月別釣りガイド
            </div>
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
            gap: "24px",
          }}
        >
          {/* 魚種バッジ */}
          {topFishNames.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              {topFishNames.map((fishName) => (
                <div
                  key={fishName}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.18)",
                    borderRadius: "12px",
                    padding: "10px 22px",
                  }}
                >
                  <span style={{ fontSize: 22 }}>🐟</span>
                  <span style={{ fontSize: 24, color: "white", fontWeight: 700 }}>
                    {fishName}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 水温・天気情報 */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "10px",
                padding: "8px 18px",
              }}
            >
              <span style={{ fontSize: 18 }}>🌡️</span>
              <span style={{ fontSize: 20, color: "rgba(255,255,255,0.9)" }}>
                水温 {guide.conditions.waterTemp}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "10px",
                padding: "8px 18px",
              }}
            >
              <span style={{ fontSize: 18 }}>🌤️</span>
              <span style={{ fontSize: 20, color: "rgba(255,255,255,0.9)" }}>
                {guide.conditions.weather}
              </span>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 60px 36px",
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
              alignItems: "center",
              gap: "6px",
              fontSize: 18,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span>🎣</span>
            <span>{guide.topFish.length}魚種掲載</span>
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
