/**
 * スポットの別名・旧名（統合後の公開 slug → 別名の一覧）。
 *
 * 釣り人は正式名と違う呼び方で検索することが多い（通称「竹野大波止」、須磨海岸の「千守突堤」、
 * 旧名「三和つり堀センター」など）。ここに登録した別名は次の場所に反映する:
 *  - スポット詳細の構造化データ（TouristAttraction.alternateName）
 *  - スポット詳細の meta keywords と、見出し直下の「別名／旧名」表示（正式名に含まれない別名のみ）
 *  - サイト内検索（/api/search）の検索対象
 *
 * 登録ルール（推測で作らない＝虚偽情報・品質低下の防止）:
 *  - 根拠は次のどちらかに限る。source に根拠を書く。
 *    1. サチコ（Search Console）の実クエリ。source は "GSC YYYY-MM: <クエリ>"
 *    2. 公開データ（説明文・notes・正式名）に「通称」「旧名」等として既に書かれている呼び名。
 *       この場合、別名の文字列がそのスポットの公開データに含まれていることをテストで検証する
 *  - 別の公開スポットの正式名に含まれる別名は登録しない（同じ検索語で自サイト内競合になる）。
 *    テストで検出する
 *  - 1スポット 3 個まで（詰め込みはスパムに見える）
 */

export type SpotAliasKind = "alias" | "former";

export interface SpotAliasEntry {
  /** alias=通称・別名、former=旧名（施設名の変更前など） */
  kind: SpotAliasKind;
  names: string[];
  /** 根拠（"GSC YYYY-MM: <クエリ>" または "説明文" / "notes" 等の公開データ） */
  source: string;
}

export const MAX_ALIASES_PER_SPOT = 3;

export const spotAliases: Record<string, SpotAliasEntry> = {
  // ---- サチコ実クエリ（2026-08・28日窓。src/lib/data/striking-spots.ts と同じ集計） ----
  "suma-senmori-tottei": { kind: "alias", names: ["千守突堤"], source: "GSC 2026-08: 千守突堤" },
  "honjo-jinkoutou": { kind: "alias", names: ["本荘人工島", "播磨新島"], source: "GSC 2026-08: 本荘人工島 釣果" },
  "akashi-nakasaki-beranda": {
    kind: "alias",
    names: ["明石市役所裏ベランダ", "中崎展望広場"],
    source: "GSC 2026-08: 明石市役所裏ベランダ",
  },

  // ---- 公開データに通称として書かれているもの ----
  "takeno-higashi-bouhatei": { kind: "alias", names: ["竹野大波止"], source: "説明文「通称『竹野大波止』」" },
  "ibo-port-takasago": { kind: "alias", names: ["関電白灯"], source: "説明文「通称『関電白灯』」" },
  "katsurama-port": { kind: "alias", names: ["勝山漁港"], source: "説明文「勝山漁港とも呼ばれる」" },
  "hayama-port": { kind: "alias", names: ["あぶずり港"], source: "説明文「あぶずり港とも呼ばれ」" },

  // ---- 公開データに旧名として書かれているもの（施設名の変更） ----
  "tochigi-nikko-otaki-tsuribori": { kind: "former", names: ["栗山つりセンター"], source: "説明文「旧名は栗山つりセンター」" },
  "fukushima-inawashiro-alpina-fishing-lodge": {
    kind: "former",
    names: ["磐梯フィッシングロッジ"],
    source: "notes「旧名『磐梯フィッシングロッジ』」",
  },
  "shizuoka-yaizu-tsuribori-center": { kind: "former", names: ["三和つり堀センター"], source: "説明文・notes「旧名 三和つり堀センター」" },
  "hokkaido-sapporo-wonderland-koi-tsuribori": {
    kind: "former",
    names: ["リゾート・サッポロ"],
    source: "notes「旧称・別名『リゾート・サッポロ』」",
  },
};

/** 構造化データ・検索用: そのスポットの別名すべて（正式名と同一のものは除く） */
export function getSpotAliasNames(slug: string, officialName?: string): string[] {
  const entry = spotAliases[slug];
  if (!entry) return [];
  return entry.names.filter((n) => n !== officialName).slice(0, MAX_ALIASES_PER_SPOT);
}

/**
 * 画面表示用: 正式名に含まれていない別名だけ（「須磨海岸（千守突堤）」の千守突堤は見出しに出ているので重ねない）。
 * 表示する別名が無ければ null。
 */
export function getVisibleSpotAliases(
  slug: string,
  officialName: string,
): { kind: SpotAliasKind; names: string[] } | null {
  const entry = spotAliases[slug];
  if (!entry) return null;
  const names = getSpotAliasNames(slug, officialName).filter((n) => !officialName.includes(n));
  return names.length > 0 ? { kind: entry.kind, names } : null;
}
