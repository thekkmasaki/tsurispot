// 検索用の魚名・別名表の組み立て。JSON を読まない側（生成スクリプトとテストから使う）。

export interface FishSearchTerms {
  /** 魚種の正式名 */
  names: string[];
  /** 別名 → 正式名（地方名の重複があるため複数） */
  aliases: Record<string, string[]>;
}

/** 魚種データから検索用の名前・別名表を組み立てる */
export function buildFishSearchTerms(
  species: ReadonlyArray<{ name: string; aliases?: string[] }>,
): FishSearchTerms {
  const names = [...new Set(species.map((f) => f.name))].sort();
  const nameSet = new Set(names);
  const aliases: Record<string, string[]> = {};
  for (const f of species) {
    for (const a of f.aliases ?? []) {
      // 正式名と同じ別名（例: ブリの別名「イナダ」）は正式名が優先なので入れない
      if (!a || nameSet.has(a)) continue;
      const list = (aliases[a] ??= []);
      if (!list.includes(f.name)) list.push(f.name);
    }
  }
  const sorted: Record<string, string[]> = {};
  for (const k of Object.keys(aliases).sort()) sorted[k] = aliases[k].sort();
  return { names, aliases: sorted };
}
