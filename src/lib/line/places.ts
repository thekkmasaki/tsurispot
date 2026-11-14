/**
 * LINE の「登録した場所」（純関数）。自宅・職場・実家・よく行く県など最大5か所まで覚える。
 * 登録は2通り: 位置情報を送る（その場所）／都道府県名を送る（県庁所在地。例: 京都の人が「大阪」「兵庫」も足す）
 * 「釣果」「魚の名前」の返信は、どれかの場所から REACH_KM 以内の釣果に絞る（chouka-reply.ts）。
 *
 * - 近い場所（10km 以内）を送り直したら、新しく足さずにその場所を更新する
 * - 上限を超えたら、いちばん古い場所を消す
 * - 「登録地」で一覧、「場所1を消す」「大阪を消す」「場所をすべて消す」で削除
 */
import { haversineKm } from "@/lib/geo/distance";
import { REACH_KM, type LineFlexReply, type LineOrigin } from "@/lib/line/chouka-reply";

export interface SavedPlace extends LineOrigin {
  /** 登録した時刻（ms） */
  at: number;
}

export const MAX_PLACES = 5;

/** 都道府県名で登録するときの位置（県庁所在地のおおよその位置） */
export const PREF_CAPITALS: Record<string, readonly [number, number]> = {
  北海道: [43.06, 141.35], 青森県: [40.82, 140.74], 岩手県: [39.7, 141.15], 宮城県: [38.27, 140.87],
  秋田県: [39.72, 140.1], 山形県: [38.24, 140.36], 福島県: [37.75, 140.47], 茨城県: [36.34, 140.45],
  栃木県: [36.57, 139.88], 群馬県: [36.39, 139.06], 埼玉県: [35.86, 139.65], 千葉県: [35.61, 140.12],
  東京都: [35.69, 139.69], 神奈川県: [35.45, 139.64], 新潟県: [37.9, 139.02], 富山県: [36.7, 137.21],
  石川県: [36.59, 136.63], 福井県: [36.07, 136.22], 山梨県: [35.66, 138.57], 長野県: [36.65, 138.18],
  岐阜県: [35.39, 136.72], 静岡県: [34.98, 138.38], 愛知県: [35.18, 136.91], 三重県: [34.73, 136.51],
  滋賀県: [35.0, 135.87], 京都府: [35.02, 135.76], 大阪府: [34.69, 135.52], 兵庫県: [34.69, 135.18],
  奈良県: [34.69, 135.83], 和歌山県: [34.23, 135.17], 鳥取県: [35.5, 134.24], 島根県: [35.47, 133.05],
  岡山県: [34.66, 133.93], 広島県: [34.4, 132.46], 山口県: [34.19, 131.47], 徳島県: [34.07, 134.56],
  香川県: [34.34, 134.04], 愛媛県: [33.84, 132.77], 高知県: [33.56, 133.53], 福岡県: [33.61, 130.42],
  佐賀県: [33.25, 130.3], 長崎県: [32.74, 129.87], 熊本県: [32.79, 130.74], 大分県: [33.24, 131.61],
  宮崎県: [31.91, 131.42], 鹿児島県: [31.56, 130.56], 沖縄県: [26.21, 127.68],
};

/** 都道府県（正式名・短縮名）→ 登録する場所。知らない県は null */
export function placeFromPrefecture(prefName: string, shortName: string): LineOrigin | null {
  const c = PREF_CAPITALS[prefName];
  return c ? { lat: c[0], lng: c[1], label: shortName } : null;
}
const SAME_PLACE_KM = 10;
export const PLACES_COMMAND = "登録地";

/** 位置は約1kmに丸めて保存する（細かい住所までは持たない） */
const round = (n: number) => Math.round(n * 100) / 100;

export function addPlace(list: readonly SavedPlace[], place: LineOrigin, now = Date.now()): { list: SavedPlace[]; updated: boolean; dropped: SavedPlace | null } {
  const p: SavedPlace = { lat: round(place.lat), lng: round(place.lng), ...(place.label && { label: place.label }), at: now };
  const same = list.findIndex((x) => haversineKm(x.lat, x.lng, p.lat, p.lng) <= SAME_PLACE_KM);
  if (same >= 0) {
    const next = [...list];
    next[same] = p;
    return { list: next, updated: true, dropped: null };
  }
  const next = [...list, p];
  let dropped: SavedPlace | null = null;
  if (next.length > MAX_PLACES) {
    const oldest = next.reduce((a, b) => (b.at < a.at ? b : a));
    dropped = oldest;
    next.splice(next.indexOf(oldest), 1);
  }
  return { list: next, updated: false, dropped };
}

/** LINE の位置情報の住所（例: 「日本、〒612-8083 京都府京都市伏見区京町…」）→ 「京都市」。取れなければ fallback */
export function placeLabelFromAddress(address: string | undefined, fallback?: string): string | undefined {
  const m = /(?:東京都|北海道|京都府|大阪府|[^\s、,〒0-9-]{2,3}県)([^\s、,0-9]+?(?:市|区|町|村))/.exec(address ?? "");
  return m?.[1] ?? fallback;
}

export type PlacesCommand = { type: "list" } | { type: "delete"; index: number } | { type: "deleteByName"; name: string } | { type: "clear" };

export function parsePlacesCommand(text: string): PlacesCommand | null {
  const t = text.trim().replace(/\s/g, "");
  if (/^(登録地|登録した場所|場所の一覧|場所一覧)$/.test(t)) return { type: "list" };
  if (/^場所をすべて消す$/.test(t)) return { type: "clear" };
  const m = /^場所([1-9１-９])を消す$/.exec(t);
  if (m) return { type: "delete", index: Number(m[1].replace(/[１-９]/, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))) - 1 };
  const n = /^(.{1,10})を(消す|削除)$/.exec(t);
  if (n) return { type: "deleteByName", name: n[1] };
  return null;
}

const C = { brand: "#0369a1", sub: "#e0f2fe", text: "#111827", muted: "#6b7280", soft: "#f8fafc", ok: "#047857" };
const txt = (text: string, opt: Record<string, unknown> = {}) => ({ type: "text", text: text || " ", wrap: true, ...opt });
const nameOf = (p: SavedPlace, i: number) => p.label ?? `場所${i + 1}`;
const dateOf = (at: number) => {
  const d = new Date(at + 9 * 3600_000);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}登録`;
};

/** 「登録地」の返信: 一覧と、消すボタン・追加（位置情報）ボタン */
export function buildPlacesFlex(list: readonly SavedPlace[], note?: string): LineFlexReply {
  const body: Record<string, unknown>[] = [];
  if (note) body.push(txt(note, { size: "xs", weight: "bold", color: C.ok }));
  if (!list.length) {
    body.push(txt(`まだ場所が登録されていません。位置情報を送るか、都道府県名（例：大阪）を送ると登録できます（最大${MAX_PLACES}か所）。`, { size: "sm", color: C.text, margin: note ? "md" : "none" }));
  } else {
    body.push(txt(`どれかの場所から${REACH_KM}km以内の釣果だけをお返しします。`, { size: "xs", color: C.muted, margin: note ? "md" : "none" }));
    list.forEach((p, i) =>
      body.push({
        type: "box", layout: "vertical", margin: "sm", paddingAll: "10px", cornerRadius: "8px", backgroundColor: C.soft,
        contents: [txt(`${i + 1}. ${nameOf(p, i)}`, { size: "sm", weight: "bold", color: C.text }), txt(dateOf(p.at), { size: "xxs", color: C.muted })],
      }),
    );
    if (list.length < MAX_PLACES) body.push(txt(`あと${MAX_PLACES - list.length}か所登録できます（位置情報か、都道府県名を送るだけ）`, { size: "xxs", color: C.muted, margin: "md" }));
  }
  return {
    altText: list.length ? `登録した場所：${list.map(nameOf).join("・")}` : "登録した場所はまだありません",
    contents: {
      type: "bubble", size: "mega",
      header: {
        type: "box", layout: "vertical", backgroundColor: C.brand, paddingAll: "16px", spacing: "4px",
        contents: [txt("登録した場所", { color: "#ffffff", weight: "bold", size: "lg" }), txt(`最大${MAX_PLACES}か所・近い釣果に絞ります`, { color: C.sub, size: "xs" })],
      },
      body: { type: "box", layout: "vertical", paddingAll: "16px", contents: body },
    },
    quickReply: [...list.map((_, i) => `場所${i + 1}を消す`), ...(list.length > 1 ? ["場所をすべて消す"] : []), "釣果"],
    askLocation: "位置情報を送る",
  };
}

export function buildPlacesText(list: readonly SavedPlace[], note?: string): string {
  return [
    ...(note ? [note, ""] : []),
    "登録した場所",
    ...(list.length ? list.map((p, i) => `${i + 1}. ${nameOf(p, i)}（${dateOf(p.at)}）`) : ["まだありません。位置情報を送ると登録できます。"]),
    "",
    `どれかの場所から${REACH_KM}km以内の釣果だけをお返しします（最大${MAX_PLACES}か所）。`,
    "追加：位置情報か、都道府県名（例：大阪）を送る",
    "消すとき：「場所1を消す」「大阪を消す」「場所をすべて消す」",
  ].join("\n");
}
