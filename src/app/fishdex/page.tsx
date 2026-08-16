import type { Metadata } from "next";
import { fishSpecies } from "@/lib/data/fish";
import { FishdexClient } from "./fishdex-client";

/**
 * 匿名で使える魚図鑑（案①）。
 * 「釣ったことある」記録はこの端末の localStorage が正で、ログインするとサーバーと統合される。
 * 全魚種データは重いのでサーバー側で {slug, name, imageUrl} に軽量化して渡す。
 */
export const metadata: Metadata = {
  title: "あなたの魚図鑑",
  description:
    "釣ったことのある魚を1タップで記録できる、あなた専用の魚図鑑。アカウント登録なしで使えます。",
  robots: { index: false },
};

const fishList = fishSpecies.map((f) => ({
  slug: f.slug,
  name: f.name,
  imageUrl: `/images/fish/${f.slug}.jpg`,
}));

export default function AnonFishdexPage() {
  return <FishdexClient fishList={fishList} />;
}
