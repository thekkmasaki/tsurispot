import { ImageResponse } from "next/og";
import { tackleShops } from "@/lib/data/shops";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { getOgFont } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "釣具店・エサ店ガイド | ツリスポ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return prefectures.map((pref) => ({ prefecture: pref.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture } = await params;
  const pref = getPrefectureBySlug(prefecture);

  // フォールバック: 都道府県が見つからない場合
  if (!pref) {
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
            釣具店・エサ店ガイド
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // フォント読み込み（モジュールレベルキャッシュ）
  const fontData = await getOgFont();

  // 該当県の店舗数を取得（サンプル除外）
  const shops = tackleShops.filter(
    (s) =>
      s.region.prefecture === pref.name &&
      s.slug !== "sample-premium" &&
      s.slug !== "sample-basic"
  );
  const shopCount = shops.length;

  // サービス別の店舗数
  const liveBaitCount = shops.filter((s) => s.hasLiveBait).length;
  const rentalRodCount = shops.filter((s) => s.hasRentalRod).length;

  // 都道府県名が長い場合のフォントサイズ調整
  const prefNameLength = pref.name.length;
  const titleFontSize = prefNameLength <= 4 ? 64 : prefNameLength <= 6 ? 56 : 48;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #0e2a6e 50%, #0a1f52 100%)",
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

        {/* ヘッダー: 店舗アイコン + 都道府県名 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "48px 60px 0",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.15)",
              fontSize: 48,
            }}
          >
            🏪
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div
              style={{
                fontSize: titleFontSize,
                fontWeight: 700,
                color: "white",
                display: "flex",
                lineHeight: 1.1,
                textShadow: "0 2px 12px rgba(0,0,0,0.3)",
              }}
            >
              {pref.name}の釣具店
            </div>
            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.7)",
                display: "flex",
              }}
            >
              釣具店・エサ店ガイド
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
          {/* 店舗数バッジ */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "6px",
                background: "rgba(255,255,255,0.18)",
                borderRadius: "14px",
                padding: "14px 28px",
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {shopCount}
              </span>
              <span
                style={{
                  fontSize: 24,
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 700,
                }}
              >
                件掲載
              </span>
            </div>
          </div>

          {/* サービス情報バッジ */}
          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            {liveBaitCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(34,197,94,0.25)",
                  borderRadius: "10px",
                  padding: "10px 20px",
                }}
              >
                <span style={{ fontSize: 20 }}>🪱</span>
                <span style={{ fontSize: 22, color: "rgba(255,255,255,0.95)", fontWeight: 700 }}>
                  活きエサ {liveBaitCount}店
                </span>
              </div>
            )}
            {rentalRodCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(99,102,241,0.25)",
                  borderRadius: "10px",
                  padding: "10px 20px",
                }}
              >
                <span style={{ fontSize: 20 }}>🎣</span>
                <span style={{ fontSize: 22, color: "rgba(255,255,255,0.95)", fontWeight: 700 }}>
                  レンタルロッド {rentalRodCount}店
                </span>
              </div>
            )}
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
              <span style={{ fontSize: 20 }}>📍</span>
              <span style={{ fontSize: 22, color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>
                営業時間・アクセス情報
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
            <span>🏪</span>
            <span>全国の釣具店・エサ店を検索</span>
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
