/**
 * LINE の釣果系の返信本文（純関数）。主要10エリアの最新週報の釣果表から作る。
 * 一斉配信（友だち数×1通で無料枠を超える）の代わりに、聞かれたときだけ返す（返信は配信数に数えない）。
 *
 * - 「釣果」: マイエリアの今週の釣果を先頭に、全国の好調エリア上位3つ → /chouka
 * - 魚の名前（「アジ」「タチウオ釣れてる？」）: その魚が今釣れている場所 → /chouka/fish/{slug}
 */
import type { LatestWeeklyCatch } from "@/lib/data/weekly-report-latest";
import { MAIN_WEEKLY_AREA_SLUGS, WEEKLY_REPORT_AREAS, catchRowHasFish } from "@/lib/weekly-report-areas";
import { haversineKm } from "@/lib/geo/distance";

const SITE = "https://tsurispot.com";
const utm = (campaign: string) => `utm_source=line&utm_medium=reply&utm_campaign=${campaign}`;
export const CHOUKA_URL = `${SITE}/chouka?${utm("chouka")}`;
const fishUrl = (slug: string) => `${SITE}/chouka/fish/${slug}?${utm("fish")}`;
const MAX_AREAS = 3;
const MAX_MY_AREA_ROWS = 3;
const MAX_FISH_ROWS = 5;
const HEAD = (title: string) => ["━━━━━━━━━━━━━━", title, "━━━━━━━━━━━━━━"];

export interface LineArea {
  slug: string;
  label: string;
}

/** 位置情報を送ってもらった人の現在地（保存時に約1kmに丸める） */
export interface LineOrigin {
  lat: number;
  lng: number;
}

/** 「行ける範囲」= 現在地から直線この距離まで（日帰りで車1.5〜2時間ほど。2026-11 ユーザー指示「行ける範囲だけに絞って」） */
export const REACH_KM = 120;

/** 週報エリアの海側のおおよその中心（現在地からの距離の目安。スポット単位の座標は週報の表に無いため） */
export const AREA_CENTERS: Record<string, readonly [number, number]> = {
  "akashi-kobe": [34.66, 135.05],
  "osaka-sennan": [34.45, 135.33],
  "tokyobay-yokohama": [35.45, 139.7],
  "fukuoka-kitakyushu": [33.75, 130.6],
  "suruga-izu": [34.95, 138.75],
  "chita-mikawa": [34.75, 136.95],
  "nanki-shirahama": [33.68, 135.38],
  "setouchi-hiroshima": [34.33, 132.45],
  "sendai-ishinomaki": [38.35, 141.15],
  "otaru-ishikari": [43.2, 141.2],
  "shonan-kamakura": [35.31, 139.5],
  boso: [35.1, 139.9],
  "beppu-oita": [33.3, 131.55],
  "tango-maizuru": [35.55, 135.25],
  "nagasaki-hirado": [33.0, 129.7],
};

/** 現在地からエリアまでの直線距離（km）。中心が分からないエリアは null */
export function areaKm(areaSlug: string, origin: LineOrigin): number | null {
  const c = AREA_CENTERS[areaSlug];
  return c ? haversineKm(origin.lat, origin.lng, c[0], c[1]) : null;
}

const within = (r: LatestWeeklyCatch, origin: LineOrigin) => {
  const km = areaKm(r.areaSlug, origin);
  return km !== null && km <= REACH_KM;
};

/** 行ける範囲でいちばん近い週報エリア（マイエリアの代わりに使う） */
export function nearestReachableArea(rows: LatestWeeklyCatch[], origin: LineOrigin): LineArea | null {
  let best: { a: LineArea; km: number } | null = null;
  for (const r of rows) {
    const km = areaKm(r.areaSlug, origin);
    if (km !== null && km <= REACH_KM && (!best || km < best.km)) best = { a: { slug: r.areaSlug, label: r.areaLabel }, km };
  }
  return best?.a ?? null;
}

const kmLabel = (km: number) => `約${Math.max(1, Math.round(km / 5) * 5)}km`;

/** マイエリア（都道府県名 例: 神奈川県）→ 週報の主要10エリア。週報の無い県は null */
export function weeklyAreaForPrefecture(prefName: string | null | undefined): LineArea | null {
  if (!prefName) return null;
  const a = WEEKLY_REPORT_AREAS.find((x) => MAIN_WEEKLY_AREA_SLUGS.includes(x.slug) && x.prefectures.includes(prefName));
  return a ? { slug: a.slug, label: a.label } : null;
}

const byHeat = (a: LatestWeeklyCatch, b: LatestWeeklyCatch) =>
  b.heat - a.heat || b.publishedAt.localeCompare(a.publishedAt);

const fire = (heat: number) => (heat > 0 ? "🔥".repeat(Math.min(heat, 3)) : "・");
const sizeText = (r: LatestWeeklyCatch) => (r.size && r.size !== "—" && r.size !== "-" ? ` ${r.size}` : "");

/** 1エリア1行（そのエリアで一番好調な行）。好調度の高い順に最大3エリア */
export function pickLineHighlights(rows: LatestWeeklyCatch[], excludeArea?: string): LatestWeeklyCatch[] {
  const best = new Map<string, LatestWeeklyCatch>();
  for (const r of rows) {
    if (r.heat <= 0 || r.areaSlug === excludeArea) continue;
    const cur = best.get(r.areaSlug);
    if (!cur || r.heat > cur.heat) best.set(r.areaSlug, r);
  }
  return [...best.values()].sort(byHeat).slice(0, MAX_AREAS);
}

/**
 * 「釣果」返信に出す行: マイエリアの上位3行と、それ以外の好調エリア上位3つ。
 * 現在地が分かっていれば、好調エリアは行ける範囲のものだけ（範囲内に無ければ全国）。
 */
export function selectChouka(rows: LatestWeeklyCatch[], myArea?: LineArea | null, origin?: LineOrigin | null) {
  const mine = myArea ? rows.filter((r) => r.areaSlug === myArea.slug).sort(byHeat).slice(0, MAX_MY_AREA_ROWS) : [];
  const near = origin ? rows.filter((r) => within(r, origin)) : [];
  const picks = pickLineHighlights(near.length ? near : rows, mine.length ? myArea?.slug : undefined);
  return { mine, picks, nearOnly: near.length > 0 };
}

/**
 * 魚名返信に出す行。
 * - 現在地あり: 行ける範囲（REACH_KM 以内）だけを近い順に
 * - 現在地なし: マイエリア優先→好調度順（全国）
 */
export function selectFishRows(fish: LineFish, rows: LatestWeeklyCatch[], myArea?: LineArea | null, origin?: LineOrigin | null) {
  const hits = rows.filter((r) => catchRowHasFish(r.fish, fish));
  if (origin) {
    return hits
      .filter((r) => within(r, origin))
      .sort((a, b) => (areaKm(a.areaSlug, origin) ?? 0) - (areaKm(b.areaSlug, origin) ?? 0) || byHeat(a, b));
  }
  return hits.sort((a, b) => Number(b.areaSlug === myArea?.slug) - Number(a.areaSlug === myArea?.slug) || byHeat(a, b));
}

/** 行ける範囲に報告が無いとき、参考に出す「いちばん近い報告」 */
export function nearestFishRow(fish: LineFish, rows: LatestWeeklyCatch[], origin: LineOrigin): { row: LatestWeeklyCatch; km: number } | null {
  let best: { row: LatestWeeklyCatch; km: number } | null = null;
  for (const r of rows) {
    if (!catchRowHasFish(r.fish, fish)) continue;
    const km = areaKm(r.areaSlug, origin);
    if (km !== null && (!best || km < best.km || (km === best.km && r.heat > best.row.heat))) best = { row: r, km };
  }
  return best;
}

export function buildChoukaReplyText(rows: LatestWeeklyCatch[], myArea?: LineArea | null, origin?: LineOrigin | null): string {
  const lines = HEAD("📊 今週の釣果ピックアップ");

  const { mine, picks, nearOnly } = selectChouka(rows, myArea, origin);
  if (myArea && mine.length) {
    lines.push("", `📍 マイエリア（${myArea.label}）`);
    for (const r of mine) lines.push(`${fire(r.heat)} ${r.fish}${sizeText(r)}（${r.spot}）`);
  }

  if (picks.length) {
    lines.push("", nearOnly ? `🚗 近くの好調エリア（${REACH_KM}km以内）` : mine.length ? "🗾 全国の好調エリア" : "🗾 今週の好調エリア");
    for (const r of picks) lines.push(`${fire(r.heat)} ${r.areaLabel}${origin && nearOnly ? `（${kmLabel(areaKm(r.areaSlug, origin) ?? 0)}）` : ""}`, `　${r.fish}${sizeText(r)}（${r.spot}）`);
  }

  if (!mine.length && !picks.length) lines.push("", "全国10エリアの最新釣果を", "毎週まとめています！");
  lines.push("", "▼ ほかのエリア・魚の最新釣果", CHOUKA_URL);
  if (!myArea && !origin) lines.push("", "📍都道府県名か位置情報を送ると、", "あなたのエリアの釣果を先頭に出します");
  return lines.join("\n");
}

export interface LineFish {
  slug: string;
  name: string;
  aliases?: string[];
}

/** 魚名として扱う最大文字数（「アジ釣れてる？」程度まで。長文の質問は拾わない） */
const MAX_FISH_QUERY_LEN = 15;

/**
 * 送られた文から魚を1種特定する（名前・別名の最長一致）。見つからなければ null。
 * 1文字の名前は誤爆する（「エ」→「エサ」）ので使わない。ただし魚偏の漢字1文字（鯵・鯛・鰤）は使う。
 */
const usableName = (n: string) => n.length >= 2 || /^\p{Script=Han}$/u.test(n);
export function findFishInText(text: string, fishList: readonly LineFish[]): LineFish | null {
  const t = text.trim();
  if (!t || t.length > MAX_FISH_QUERY_LEN) return null;
  let hit: LineFish | null = null;
  let hitLen = 0;
  for (const f of fishList) {
    for (const n of [f.name, ...(f.aliases ?? [])]) {
      if (usableName(n) && n.length > hitLen && t.includes(n)) {
        hit = f;
        hitLen = n.length;
      }
    }
  }
  return hit;
}

export function buildFishReplyText(fish: LineFish, rows: LatestWeeklyCatch[], myArea?: LineArea | null, origin?: LineOrigin | null): string {
  const lines = HEAD(`🐟 ${fish.name}が今釣れている場所`);
  const hits = selectFishRows(fish, rows, myArea, origin);
  if (origin) lines.push(`（現在地から${REACH_KM}km以内・近い順）`);

  if (!hits.length) {
    const near = origin ? nearestFishRow(fish, rows, origin) : null;
    lines.push(
      "",
      origin ? `近く（${REACH_KM}km以内）の週報には、` : "今週の釣果週報では、",
      `今週${fish.name}の報告はありませんでした。`,
      ...(near ? ["", `いちばん近い報告：${near.row.areaLabel}（${kmLabel(near.km)}）`, `　${near.row.spot}${sizeText(near.row)}`] : []),
      "",
      `▼ ${fish.name}の釣り方・釣れる時期`,
      `${SITE}/fish/${fish.slug}?${utm("fish")}`,
      "",
      "▼ 今釣れている魚をエリア別に",
      CHOUKA_URL,
    );
    return lines.join("\n");
  }

  lines.push("");
  for (const r of hits.slice(0, MAX_FISH_ROWS)) {
    const mark = !origin && r.areaSlug === myArea?.slug ? "📍" : fire(r.heat);
    lines.push(`${mark} ${r.areaLabel}${origin ? `（${kmLabel(areaKm(r.areaSlug, origin) ?? 0)}）` : ""}`, `　${r.spot}${sizeText(r)}${r.method ? `・${r.method}` : ""}`);
  }
  if (hits.length > MAX_FISH_ROWS) lines.push(`ほか${hits.length - MAX_FISH_ROWS}か所`);
  lines.push("", `▼ ${fish.name}の最新釣果をすべて見る`, fishUrl(fish.slug));
  return lines.join("\n");
}

// ─── Flex Message（カード表示） ─────────────────────────────────
// テキスト版（上の build*ReplyText）は Flex が LINE に弾かれたときの予備として残す。

type FlexComponent = Record<string, unknown>;
export interface LineFlexReply {
  altText: string;
  contents: FlexComponent;
  /** 下に出す候補ボタン（タップでその文字を送信） */
  quickReply: string[];
  /** 指定すると候補ボタンの先頭に「位置情報を送る」ボタン（このラベル）を出す */
  askLocation?: string;
}

const C = {
  brand: "#0369a1",
  sub: "#e0f2fe",
  text: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  mine: "#ecfdf5",
};

const txt = (text: string, opt: FlexComponent = {}): FlexComponent => ({ type: "text", text: text || " ", wrap: true, ...opt });

function header(title: string, sub: string): FlexComponent {
  return {
    type: "box",
    layout: "vertical",
    backgroundColor: C.brand,
    paddingAll: "16px",
    spacing: "4px",
    contents: [txt(title, { color: "#ffffff", weight: "bold", size: "lg" }), txt(sub, { color: C.sub, size: "xs" })],
  };
}

function sectionTitle(text: string): FlexComponent {
  return txt(text, { weight: "bold", size: "sm", color: C.brand, margin: "lg" });
}

/** 1行: 左に🔥（または📍）、右に「主」と「従」の2段 */
function catchRow(mark: string, main: string, sub: string, highlight = false): FlexComponent {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "md",
    margin: "md",
    paddingAll: highlight ? "8px" : "0px",
    cornerRadius: "8px",
    ...(highlight && { backgroundColor: C.mine }),
    contents: [
      txt(mark, { flex: 0, size: "sm", gravity: "top" }),
      {
        type: "box",
        layout: "vertical",
        flex: 1,
        contents: [txt(main, { weight: "bold", size: "md", color: C.text }), txt(sub, { size: "xs", color: C.muted })],
      },
    ],
  };
}

function bubble(head: FlexComponent, body: FlexComponent[], buttonLabel: string, uri: string, note?: string): FlexComponent {
  return {
    type: "bubble",
    size: "mega",
    header: head,
    body: { type: "box", layout: "vertical", paddingAll: "16px", contents: body },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "12px",
      contents: [
        { type: "button", style: "primary", color: C.brand, height: "sm", action: { type: "uri", label: buttonLabel, uri } },
        ...(note ? [txt(note, { size: "xxs", color: C.muted, align: "center" })] : []),
      ],
    },
  };
}

const fishOf = (r: LatestWeeklyCatch) => r.fish.replace(/[（(][^）)]*[）)]/g, "").split(/[・、/／,\s]/)[0].trim();

/** 今週の報告に多い魚（タップで魚名返信へ）最大4つ */
function topFishNames(rows: LatestWeeklyCatch[]): string[] {
  const n = new Map<string, number>();
  for (const r of rows) {
    const f = fishOf(r);
    if (f.length >= 2 && f.length <= 8) n.set(f, (n.get(f) ?? 0) + 1 + r.heat);
  }
  return [...n].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([f]) => f);
}

export function buildChoukaFlex(rows: LatestWeeklyCatch[], myArea?: LineArea | null, origin?: LineOrigin | null): LineFlexReply {
  const { mine, picks, nearOnly } = selectChouka(rows, myArea, origin);
  const body: FlexComponent[] = [];
  if (myArea && mine.length) {
    body.push(sectionTitle(`📍 マイエリア　${myArea.label}`));
    for (const r of mine) body.push(catchRow(fire(r.heat), `${r.fish}${sizeText(r)}`, r.spot, true));
  }
  if (picks.length) {
    body.push(sectionTitle(nearOnly ? `🚗 近くの好調エリア（${REACH_KM}km以内）` : mine.length ? "🗾 全国の好調エリア" : "🗾 今週の好調エリア"));
    for (const r of picks) {
      const km = origin && nearOnly ? areaKm(r.areaSlug, origin) : null;
      body.push(catchRow(fire(r.heat), `${r.areaLabel}${km !== null ? `（${kmLabel(km)}）` : ""}`, `${r.fish}${sizeText(r)}・${r.spot}`));
    }
  }
  if (!body.length) body.push(txt("全国10エリアの最新釣果を毎週まとめています。", { size: "sm", color: C.muted }));
  (body[0] as FlexComponent).margin = "none";

  const first = mine[0] ?? picks[0];
  const altText = first ? `今週の釣果：${first.areaLabel} ${first.fish}${sizeText(first)}ほか` : "今週の釣果ピックアップ";
  return {
    altText,
    contents: bubble(
      header("今週の釣果ピックアップ", "全国10エリアの最新釣果週報より"),
      body,
      "エリア別の最新釣果を見る",
      CHOUKA_URL,
      myArea || origin ? undefined : "都道府県名か位置情報を送ると、あなたのエリアを先頭に表示します",
    ),
    quickReply: topFishNames(rows),
  };
}

export function buildFishFlex(fish: LineFish, rows: LatestWeeklyCatch[], myArea?: LineArea | null, origin?: LineOrigin | null): LineFlexReply {
  const hits = selectFishRows(fish, rows, myArea, origin);
  const head = header(
    `${fish.name}が今釣れている場所`,
    origin ? `現在地から${REACH_KM}km以内（直線）・近い順` : "全国10エリアの最新釣果週報より",
  );
  if (!hits.length) {
    const near = origin ? nearestFishRow(fish, rows, origin) : null;
    return {
      altText: `${fish.name}：${origin ? "近くの" : "今週の"}釣果週報に報告はありませんでした`,
      contents: bubble(
        head,
        [
          txt(origin ? `近く（${REACH_KM}km以内）の週報には、今週${fish.name}の報告はありませんでした。` : `今週の釣果週報では、${fish.name}の報告はありませんでした。`, { size: "sm", color: C.text }),
          ...(near ? [txt(`いちばん近い報告：${near.row.areaLabel}（${kmLabel(near.km)}）${near.row.spot}`, { size: "xs", color: C.muted, margin: "md" })] : []),
        ],
        `${fish.name}の釣り方・時期を見る`,
        `${SITE}/fish/${fish.slug}?${utm("fish")}`,
      ),
      quickReply: ["釣果", ...topFishNames(rows).filter((f) => f !== fish.name)].slice(0, 4),
    };
  }
  const shown = hits.slice(0, MAX_FISH_ROWS);
  const body = shown.map((r) => {
    const isMine = !origin && r.areaSlug === myArea?.slug;
    const detail = [r.size && r.size !== "—" && r.size !== "-" ? r.size : "", r.method].filter(Boolean).join("・");
    const km = origin ? areaKm(r.areaSlug, origin) : null;
    return catchRow(isMine ? "📍" : fire(r.heat), `${r.areaLabel}${km !== null ? `（${kmLabel(km)}）` : ""}`, `${r.spot}${detail ? `　${detail}` : ""}`, isMine);
  });
  (body[0] as FlexComponent).margin = "none";
  if (hits.length > shown.length) body.push(txt(`ほか${hits.length - shown.length}か所`, { size: "xs", color: C.muted, margin: "md" }));
  return {
    altText: `${fish.name}が今釣れている場所：${shown[0].areaLabel} ${shown[0].spot}ほか`,
    contents: bubble(head, body, `${fish.name}の最新釣果をすべて見る`, fishUrl(fish.slug)),
    quickReply: ["釣果", ...topFishNames(rows).filter((f) => f !== fish.name)].slice(0, 4),
  };
}
