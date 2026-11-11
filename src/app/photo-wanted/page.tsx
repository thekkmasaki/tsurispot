import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { fishingSpots } from "@/lib/data/spots";
import { getWantedSpots, countWantedByPrefecture } from "@/lib/photo-wanted";
import { PhotoWantedClient } from "@/components/photo-wanted/photo-wanted-client";
import { WantedHero } from "@/components/photo-wanted/wanted-hero";

export const metadata: Metadata = {
  title: "写真募集中の釣り場（WANTED）",
  description:
    "ツリスポで写真がまだ無い釣り場の一覧です。近くの釣り場や都道府県から探して、あなたが撮った釣り場の写真を投稿してください。",
  alternates: { canonical: "https://tsurispot.com/photo-wanted" },
  // 投稿を募る運営ページ（検索流入の対象ではない）。リンクはたどってもらう
  robots: { index: false, follow: true },
};

export const revalidate = 86400;

export default function PhotoWantedPage() {
  const wanted = getWantedSpots(fishingSpots);
  const byPref = [...countWantedByPrefecture(wanted).entries()].sort((a, b) => b[1] - a[1]);

  return (
    <main className="container mx-auto max-w-6xl px-5 py-6 sm:px-6 sm:py-8">
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "写真募集中の釣り場" }]} />

      <WantedHero
        as="h1"
        title="WANTED"
        lead="釣り場の写真を募集中"
        note={`写真がまだない釣り場 全国${wanted.length.toLocaleString()}か所`}
        className="mb-8"
      />

      <PhotoWantedClient initialSpots={wanted.slice(0, 30)} totalCount={wanted.length} prefectures={byPref} />

      <section className="mt-12 rounded-xl bg-muted p-5 text-sm leading-relaxed sm:p-6">
        <h2 className="text-lg font-black">投稿のルール</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>あなたが自分で撮った写真だけを投稿してください（他のサイトやSNSの写真は不可）。</li>
          <li>人の顔や車のナンバーがはっきり写らないようにしてください。</li>
          <li>釣り場の様子（足場・景色・設備など）が分かる写真が、ほかの釣り人の役に立ちます。</li>
          <li>投稿にはログインが必要です。不適切な画像は自動で確認し、公開されません。</li>
        </ul>
      </section>
    </main>
  );
}
