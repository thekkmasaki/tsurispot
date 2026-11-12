/**
 * 魚図鑑の魚種一覧（名前・別名・写真）を JSON で出力する。週報の魚名から写真を引くのに使う。
 *   npx --yes tsx@4.23.15 scripts/sns/weekly-carousel/fish-index.ts > fish-index.json
 */
import { fishSpecies } from "@/lib/data/fish";

const out = fishSpecies.map((f) => ({
  slug: f.slug,
  name: f.name,
  kana: f.nameKana,
  aliases: f.aliases ?? [],
  imageUrl: f.imageUrl ?? null,
  userPhotos: (f.userPhotos ?? []).map((p) => p.url),
}));
process.stdout.write(JSON.stringify(out));
