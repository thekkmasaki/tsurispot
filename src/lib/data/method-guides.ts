// 釣法名 → ガイドページのマッピング。
// 従来 spots/[slug]/page.tsx 内に3つの同型マップ（METHOD_GUIDE_MAP /
// METHOD_STRATEGY_MAP / METHOD_TO_GUIDE）が重複定義されていたのを一本化した。
export interface MethodGuide {
  href: string;
  label: string;
  desc: string;
}

export const METHOD_GUIDES: Record<string, MethodGuide> = {
  "サビキ釣り": { href: "/guide/sabiki", label: "サビキ釣り完全ガイド", desc: "仕掛け・コマセの使い方を初心者向けに図解" },
  "ちょい投げ": { href: "/guide/choinage", label: "ちょい投げ完全ガイド", desc: "キスやハゼを狙う投げ釣り入門" },
  "ちょい投げ釣り": { href: "/guide/choinage", label: "ちょい投げ完全ガイド", desc: "キスやハゼを狙う投げ釣り入門" },
  "エギング": { href: "/guide/eging", label: "エギング完全ガイド", desc: "エギの選び方とシャクリ方を解説" },
  "ショアジギング": { href: "/guide/jigging", label: "ショアジギング完全ガイド", desc: "メタルジグで青物を狙う方法" },
  "ウキ釣り": { href: "/guide/float-fishing", label: "ウキ釣り完全ガイド", desc: "ウキの種類・タナの取り方を解説" },
  "穴釣り": { href: "/guide/anazuri", label: "穴釣り完全ガイド", desc: "テトラの隙間でカサゴ・メバルを狙う" },
  "ルアー釣り": { href: "/guide/lure", label: "ルアー釣り完全ガイド", desc: "シーバスやヒラメをルアーで狙う" },
  "泳がせ釣り": { href: "/guide/oyogase", label: "泳がせ釣り入門ガイド", desc: "活きエサで大物を狙う泳がせ釣り" },
  "遠投カゴ釣り": { href: "/guide/entou-kago", label: "遠投カゴ釣りガイド", desc: "沖のタナを攻めるカゴ釣り" },
  "投げ釣り": { href: "/guide/choinage", label: "ちょい投げ完全ガイド", desc: "投げ釣りの基本とコツ" },
  "フカセ釣り": { href: "/guide/float-fishing", label: "ウキ釣り完全ガイド", desc: "フカセ釣りの基本テクニック" },
};

/** 釣法名の配列から、禁止釣法を除きガイドを重複なしで返す */
export function guidesForMethods(
  methods: Iterable<string>,
  forbidden?: ReadonlySet<string>,
): MethodGuide[] {
  const seenHref = new Set<string>();
  const guides: MethodGuide[] = [];
  for (const m of methods) {
    if (forbidden?.has(m)) continue;
    const g = METHOD_GUIDES[m];
    if (!g || seenHref.has(g.href)) continue;
    seenHref.add(g.href);
    guides.push(g);
  }
  return guides;
}
