/**
 * 釣果週報エリア（/weekly-report スキルが microCMS に投稿する週報の単位）と、
 * スポット → 週報エリアの機械的な対応付け。
 *
 * 週報は「主要10エリア＋拡張5エリア」単位で、タイトルは
 *   「【釣果週報】{エリア名}エリア 2026年10月第3週｜…」
 * slug は `chouka-shuho-{エリアslug}-YYYY-MM-weekN` の形で投稿されている（実投稿を sitemap で確認）。
 *
 * 対応付けルール（曖昧なら出さない）:
 *  - spot.region.prefecture が一致し、かつ address に対象市区町村名を含むときだけ対応させる。
 *  - region.areaName は使わない（例: 国府津海岸は region が「三浦・城ヶ島」で address が小田原市、
 *    のように region の付与ゆれがあるため address の市区町村を正とする）。
 *  - 週報が実際にカバーしていない近隣（淡路島・千葉市など）は意図的に含めない。
 *    「横浜の週報」を千葉のスポットに出すのは釣果意図への誤答になる。
 *
 * 純関数モジュール（spots データや Next.js API を import しない）。サーバー取得は
 * src/lib/data/weekly-report-latest.ts 側。
 */

export interface WeeklyReportArea {
  /** 週報 slug のエリア部分（chouka-shuho-{slug}-…） */
  slug: string;
  /** タイトル中の表記（「{label}エリア」） */
  label: string;
  /** 対象都道府県（region.prefecture と完全一致） */
  prefectures: string[];
  /** address に含まれていれば対応とみなす市区町村名 */
  municipalities: string[];
}

export const WEEKLY_REPORT_AREAS: readonly WeeklyReportArea[] = [
  // ── 主要10エリア ──
  {
    slug: "akashi-kobe",
    label: "明石・神戸",
    prefectures: ["兵庫県"],
    municipalities: ["神戸市", "明石市"],
  },
  {
    slug: "osaka-sennan",
    label: "大阪湾・泉南",
    prefectures: ["大阪府"],
    municipalities: [
      "大阪市", "堺市", "高石市", "泉大津市", "忠岡町", "岸和田市", "貝塚市",
      "泉佐野市", "田尻町", "泉南市", "阪南市", "岬町",
    ],
  },
  {
    slug: "tokyobay-yokohama",
    label: "東京湾・横浜",
    prefectures: ["神奈川県", "東京都"],
    municipalities: [
      "横浜市", "川崎市", "横須賀市",
      "江東区", "品川区", "大田区", "港区", "中央区", "江戸川区",
    ],
  },
  {
    slug: "fukuoka-kitakyushu",
    label: "福岡・北九州",
    prefectures: ["福岡県"],
    municipalities: ["福岡市", "北九州市", "糸島市", "宗像市", "福津市", "古賀市", "新宮町", "芦屋町"],
  },
  {
    slug: "suruga-izu",
    label: "駿河湾・伊豆",
    prefectures: ["静岡県"],
    municipalities: [
      "静岡市", "焼津市", "沼津市", "富士市", "熱海市", "伊東市", "下田市",
      "東伊豆町", "河津町", "南伊豆町", "松崎町", "西伊豆町", "伊豆市", "吉田町", "牧之原市",
    ],
  },
  {
    slug: "chita-mikawa",
    label: "知多・三河",
    prefectures: ["愛知県"],
    municipalities: [
      "知多市", "常滑市", "半田市", "東海市", "知多郡", "美浜町", "南知多町", "武豊町", "東浦町",
      "碧南市", "高浜市", "西尾市", "蒲郡市", "豊橋市", "田原市",
    ],
  },
  {
    slug: "nanki-shirahama",
    label: "南紀・白浜",
    prefectures: ["和歌山県"],
    municipalities: [
      "田辺市", "白浜町", "みなべ町", "印南町", "御坊市", "美浜町", "日高町", "由良町",
      "すさみ町", "串本町", "那智勝浦町", "太地町", "新宮市",
    ],
  },
  {
    slug: "setouchi-hiroshima",
    label: "瀬戸内・広島",
    prefectures: ["広島県"],
    municipalities: [
      "広島市", "呉市", "江田島市", "廿日市市", "大竹市", "坂町", "海田町",
      "東広島市", "竹原市", "三原市", "尾道市", "福山市",
    ],
  },
  {
    slug: "sendai-ishinomaki",
    label: "仙台・石巻",
    prefectures: ["宮城県"],
    municipalities: [
      "仙台市", "石巻市", "塩竈市", "多賀城市", "七ヶ浜町", "松島町", "東松島市", "女川町",
      "名取市", "岩沼市", "亘理町", "山元町", "利府町", "気仙沼市", "南三陸町",
    ],
  },
  {
    slug: "otaru-ishikari",
    label: "小樽・石狩",
    prefectures: ["北海道"],
    municipalities: ["小樽市", "石狩市", "余市町"],
  },
  // ── 拡張5エリア ──
  {
    slug: "shonan-kamakura",
    label: "湘南・鎌倉",
    prefectures: ["神奈川県"],
    municipalities: ["鎌倉市", "藤沢市", "茅ヶ崎市", "平塚市", "大磯町", "二宮町", "逗子市", "葉山町"],
  },
  {
    slug: "boso",
    label: "房総",
    prefectures: ["千葉県"],
    municipalities: [
      "館山市", "南房総市", "鴨川市", "勝浦市", "いすみ市", "御宿町", "富津市", "君津市", "木更津市", "鋸南町",
    ],
  },
  {
    slug: "beppu-oita",
    label: "別府湾・大分",
    prefectures: ["大分県"],
    municipalities: ["大分市", "別府市", "杵築市", "日出町", "国東市", "臼杵市", "津久見市"],
  },
  {
    slug: "tango-maizuru",
    label: "丹後・舞鶴",
    prefectures: ["京都府"],
    municipalities: ["舞鶴市", "宮津市", "京丹後市", "伊根町", "与謝野町"],
  },
  {
    slug: "nagasaki-hirado",
    label: "長崎・平戸",
    prefectures: ["長崎県"],
    municipalities: ["長崎市", "平戸市", "佐世保市", "松浦市", "西海市", "時津町", "長与町"],
  },
];

const AREA_BY_SLUG = new Map(WEEKLY_REPORT_AREAS.map((a) => [a.slug, a]));

export function getWeeklyReportArea(slug: string): WeeklyReportArea | undefined {
  return AREA_BY_SLUG.get(slug);
}

/**
 * スポットが属する週報エリアを返す。該当なし・曖昧なら null。
 * 複数エリアに該当した場合も曖昧として null（市区町村の重複定義ミスの安全網）。
 */
export function getWeeklyAreaForSpot(spot: {
  region: { prefecture: string };
  address: string;
}): WeeklyReportArea | null {
  const address = spot.address ?? "";
  if (!address) return null;
  const hits = WEEKLY_REPORT_AREAS.filter(
    (a) =>
      a.prefectures.includes(spot.region.prefecture) &&
      a.municipalities.some((m) => address.includes(m)),
  );
  return hits.length === 1 ? hits[0] : null;
}

/** 週報記事か（editorial-feed.ts の判定と同じ語） */
export function isWeeklyReportTitle(title: string): boolean {
  return title.includes("週報") || title.includes("釣果速報");
}

/**
 * 週報記事がどのエリアのものかを slug → タイトルの順で判定する。
 * 「房総」は slug が boso / boso-peninsula の2系統で投稿されているため、slug 前方一致に
 * 加えてタイトルの「{label}エリア」でも拾う。
 */
export function matchWeeklyAreaForPost(post: { slug: string; title: string }): WeeklyReportArea | null {
  if (!isWeeklyReportTitle(post.title)) return null;
  for (const a of WEEKLY_REPORT_AREAS) {
    if (post.slug.startsWith(`chouka-shuho-${a.slug}-`)) return a;
  }
  for (const a of WEEKLY_REPORT_AREAS) {
    if (post.title.includes(`${a.label}エリア`)) return a;
  }
  return null;
}

export interface WeeklyReportSummary {
  areaSlug: string;
  areaLabel: string;
  title: string;
  /** YYYY-MM-DD */
  publishedAt: string;
  /** microCMS の description（冒頭要約）。無ければ空文字 */
  description: string;
  href: string;
}

/** これより古い週報は「最新の様子」として出さない（ISR 7日＋週1更新を見込んだ上限） */
export const WEEKLY_REPORT_FRESH_DAYS = 28;

function daysBetween(fromYmd: string, now: Date): number {
  const t = Date.parse(`${fromYmd}T00:00:00+09:00`);
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return (now.getTime() - t) / 86_400_000;
}

/**
 * 記事一覧から「エリア → 最新週報」のマップを作る。
 * freshDays より古い最新週報は除外（停止中の拡張エリアの古い記事を「最近の様子」と誤認させない）。
 */
export function pickLatestWeeklyByArea(
  posts: { slug: string; title: string; publishedAt: string; description?: string }[],
  now: Date = new Date(),
  freshDays: number = WEEKLY_REPORT_FRESH_DAYS,
): Map<string, WeeklyReportSummary> {
  const latest = new Map<string, WeeklyReportSummary>();
  for (const p of posts) {
    const area = matchWeeklyAreaForPost(p);
    if (!area) continue;
    const prev = latest.get(area.slug);
    if (prev && prev.publishedAt >= p.publishedAt) continue;
    latest.set(area.slug, {
      areaSlug: area.slug,
      areaLabel: area.label,
      title: p.title,
      publishedAt: p.publishedAt,
      description: p.description ?? "",
      href: `/blog/${p.slug}`,
    });
  }
  for (const [slug, s] of latest) {
    if (daysBetween(s.publishedAt, now) > freshDays) latest.delete(slug);
  }
  return latest;
}
