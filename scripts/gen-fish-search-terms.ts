/**
 * 検索用の魚名・別名表を書き出す。魚種データ（fish-metadata.ts の aliases）を
 * 変えたら実行する。ずれていると src/__tests__/spot-search-match.test.ts が落ちる。
 *
 *   npx tsx --tsconfig tsconfig.json scripts/gen-fish-search-terms.ts
 */
import { writeFileSync } from "node:fs";
import { fishSpecies } from "@/lib/data/fish";
import { buildFishSearchTerms } from "@/lib/search/fish-terms-build";

const out = "src/lib/data/generated/fish-search-terms.json";
writeFileSync(out, JSON.stringify(buildFishSearchTerms(fishSpecies), null, 2) + "\n");
console.log(`wrote ${out}`);
