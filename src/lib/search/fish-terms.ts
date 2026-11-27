import { normalizeForSearch } from "./normalize";
import type { FishSearchTerms } from "./fish-terms-build";
import generated from "@/lib/data/generated/fish-search-terms.json";

/**
 * 検索語 → 魚名の照合。
 *
 * 以前は魚名を部分一致（includes）で見ていたため、「アジ」で検索すると
 * シマアジ・ロウニンアジのスポットまで拾っていた（2026-11 UX監査）。
 *   1. 検索語が魚種の正式名そのもの（アジ・タチウオ等）→ その魚だけに一致
 *   2. 検索語が別名（チヌ・ガシラ・シーバス等）→ 別名の指す魚 ＋ 部分一致
 *      （別名データには地方名の重複があり、「マス」を別名だけで解くと
 *       ニジマスが落ちるため、部分一致を残して取りこぼしを防ぐ）
 *   3. どちらでもない（イカ・タイ等の総称）→ 従来どおり部分一致
 *
 * 別名データは fish-metadata.ts が正。クライアントへ魚データ全体を載せないよう
 * 名前と別名だけを JSON に書き出している（scripts/gen-fish-search-terms.ts）。
 */

function buildIndex(terms: FishSearchTerms) {
  const names = new Set(terms.names.map(normalizeForSearch));
  const aliases = new Map<string, Set<string>>();
  for (const [a, targets] of Object.entries(terms.aliases)) {
    const key = normalizeForSearch(a);
    const set = aliases.get(key) ?? new Set<string>();
    for (const t of targets) set.add(normalizeForSearch(t));
    aliases.set(key, set);
  }
  return { names, aliases };
}

const fishIndex = buildIndex(generated as FishSearchTerms);

/** 検索語（normalizeForSearch 済みの1語）が魚種名または別名として知られているか */
export function isKnownFishTerm(nw: string): boolean {
  return fishIndex.names.has(nw) || fishIndex.aliases.has(nw);
}

/** 検索語（normalizeForSearch 済みの1語）に魚名（正規化前）が一致するか */
export function fishNameMatches(nw: string, fishName: string): boolean {
  const nf = normalizeForSearch(fishName);
  if (fishIndex.names.has(nw)) return nf === nw;
  if (fishIndex.aliases.get(nw)?.has(nf)) return true;
  return nf.includes(nw);
}
