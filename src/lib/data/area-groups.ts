/**
 * サーバー専用: スポットを市区町村（基礎自治体）単位でまとめ直す。
 *
 * /area/[slug] は従来 region.id 完全一致でスポットを拾っていたため、
 * 同一市区町村が複数 region.id（=別ページ）に分割され、各ページに数件しか
 * 載らなかった（「伊根・宮津の釣り場おすすめ3選」問題）。ここで市区町村単位に
 * 束ね直し、各エリアページに「その市区町村の全スポット」を載せて厚くする。
 *
 * fishingSpots を import するため **クライアントコンポーネントから import 禁止**
 * （list-spot.ts / microcms.ts と同じ運用規約）。
 */
import { fishingSpots } from "./spots";
import { regions } from "./regions";
import { extractMunicipality } from "@/lib/geo/municipality";
import type { FishingSpot } from "@/types";

/** 市区町村キー（"京都府|伊根町"）。抽出不能なら null */
function muniKeyOf(spot: FishingSpot): string | null {
  const m = extractMunicipality(spot.address, spot.region.prefecture);
  return m ? `${spot.region.prefecture}|${m}` : null;
}

const regionSlugSet = new Set(regions.map((r) => r.slug));

// 市区町村キー → その市区町村の全スポット（評価降順）
const spotsByMuni = new Map<string, FishingSpot[]>();
// region.slug → その region が属する主市区町村キー（region内スポットの最頻）
const muniKeyBySlug = new Map<string, string>();
// 市区町村キー → 代表 region.slug（canonical/sitemap の集約先）
const repSlugByMuni = new Map<string, string>();

(function build() {
  const slugMuniCount = new Map<string, Map<string, number>>(); // slug → muniKey → n
  for (const spot of fishingSpots) {
    const k = muniKeyOf(spot);
    if (!k) continue;
    const list = spotsByMuni.get(k);
    if (list) list.push(spot);
    else spotsByMuni.set(k, [spot]);
    const sm = slugMuniCount.get(spot.region.slug) ?? new Map<string, number>();
    sm.set(k, (sm.get(k) ?? 0) + 1);
    slugMuniCount.set(spot.region.slug, sm);
  }

  // 各 slug の主市区町村 = その slug のスポットが最も多く属する市区町村（同数はキー昇順で決定的）
  for (const [slug, mc] of slugMuniCount) {
    let best: string | null = null;
    let bestN = -1;
    for (const [k, n] of [...mc.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      if (n > bestN) {
        best = k;
        bestN = n;
      }
    }
    if (best) muniKeyBySlug.set(slug, best);
  }

  // 各市区町村の代表 slug: regions.ts掲載(=既にインデックス/sitemap候補)を優先 →
  // その市区町村スポット数が多い → slug昇順。SEO資産を失わないため既存の
  // インデックス済みslugを代表に据える。
  const muniSlugCount = new Map<string, Map<string, number>>();
  for (const [k, spots] of spotsByMuni) {
    const sc = new Map<string, number>();
    for (const s of spots) sc.set(s.region.slug, (sc.get(s.region.slug) ?? 0) + 1);
    muniSlugCount.set(k, sc);
  }
  for (const [k, sc] of muniSlugCount) {
    const cands = [...sc.entries()].sort((a, b) => {
      const ra = regionSlugSet.has(a[0]) ? 0 : 1;
      const rb = regionSlugSet.has(b[0]) ? 0 : 1;
      if (ra !== rb) return ra - rb;
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
    repSlugByMuni.set(k, cands[0][0]);
  }

  // スポットを評価降順で安定ソート（一覧表示の見栄え）
  for (const spots of spotsByMuni.values()) {
    spots.sort((a, b) => b.rating - a.rating || a.slug.localeCompare(b.slug));
  }
})();

/** その region.slug が属する市区町村の全スポット（評価降順）。無ければ空配列 */
export function getSpotsForArea(regionSlug: string): FishingSpot[] {
  const k = muniKeyBySlug.get(regionSlug);
  return k ? spotsByMuni.get(k) ?? [] : [];
}

/** その region.slug が属する市区町村名（例「伊根町」）。無ければ null */
export function getAreaMunicipalityName(regionSlug: string): string | null {
  const k = muniKeyBySlug.get(regionSlug);
  return k ? k.split("|")[1] : null;
}

/** その市区町村の代表 slug（canonical 集約先）。無ければ自身 */
export function getAreaRepSlug(regionSlug: string): string {
  const k = muniKeyBySlug.get(regionSlug);
  return (k && repSlugByMuni.get(k)) || regionSlug;
}

/** 全市区町村の代表エリア（sitemap・一覧用）。代表slug・市区町村名・県・件数 */
export function getAllAreaGroups(): {
  slug: string;
  municipalityName: string;
  prefecture: string;
  count: number;
}[] {
  const out: { slug: string; municipalityName: string; prefecture: string; count: number }[] = [];
  for (const [k, rep] of repSlugByMuni) {
    const [prefecture, municipalityName] = k.split("|");
    out.push({ slug: rep, municipalityName, prefecture, count: spotsByMuni.get(k)?.length ?? 0 });
  }
  return out.sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}
