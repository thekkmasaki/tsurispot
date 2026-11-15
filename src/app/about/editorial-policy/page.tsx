import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Gauge, Waves, Scale, MessageSquare, AlertCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { safeJsonLd } from "@/lib/safe-json-ld";

const PAGE_URL = "https://tsurispot.com/about/editorial-policy";
/** 本ページの記載内容を最後に見直した日（ビルド日ではなく実際の更新日を入れる） */
const LAST_REVIEWED = "2026-11-15";

export const metadata: Metadata = {
  title: "編集方針・データの作り方｜ツリスポ",
  description:
    "ツリスポの編集方針とデータの作り方。釣れる度スコアの算出方法、気象庁の潮位表にもとづく潮見表、釣り禁止・ルール情報の出典と確認日、ユーザー釣果投稿の扱い、誤りの報告と訂正の流れを説明します。",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "編集方針・データの作り方｜ツリスポ",
    description: "釣れる度スコア・潮汐データ・ルール情報の出典・釣果投稿の扱い・訂正の流れ。",
    type: "article",
    url: PAGE_URL,
    siteName: "ツリスポ",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": PAGE_URL,
    name: "編集方針・データの作り方",
    url: PAGE_URL,
    dateModified: LAST_REVIEWED,
    inLanguage: "ja",
    isPartOf: { "@id": "https://tsurispot.com/#website" },
    about: { "@id": "https://tsurispot.com/#organization" },
    publisher: { "@id": "https://tsurispot.com/#organization" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "ツリスポについて", item: "https://tsurispot.com/about" },
      { "@type": "ListItem", position: 3, name: "編集方針・データの作り方", item: PAGE_URL },
    ],
  },
];

const TIER_ROWS = [
  { tier: "◎ よく釣れる", cond: "スコア70以上、かつ地域適性3以上・地形適性2以上" },
  { tier: "○ 釣れる", cond: "スコア45以上" },
  { tier: "△ まずまず", cond: "スコア28以上45未満、または地域・地形のどちらかが「まれ（1）」の境界域" },
  { tier: "掲載しない", cond: "生息域外（地域0）・地形不適合（地形0）・両方が境界域、またはスコア28未満" },
];

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20">
      <h2 id={`${id}-heading`} className="mb-3 flex items-center gap-2 text-xl font-bold sm:text-2xl">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        {title}
      </h2>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-3 p-4 text-sm leading-relaxed sm:p-6">{children}</CardContent>
      </Card>
    </section>
  );
}

export default function EditorialPolicyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ツリスポについて", href: "/about" },
            { label: "編集方針・データの作り方" },
          ]}
        />
      </div>

      <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">編集方針・データの作り方</h1>
      <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
        ツリスポ（運営: ツリスポ編集部）は、釣り場・魚種・潮汐・ルールの情報を「出典のある公開データ」と「実際の釣り人の投稿」から整理して掲載しています。
        このページでは、各データがどこから来ていて、どう計算・確認しているかを説明します。
      </p>
      <p className="mb-8 text-xs text-muted-foreground">最終見直し日: {LAST_REVIEWED}</p>

      <nav aria-label="目次" className="mb-8 rounded-xl border bg-muted/30 p-4 text-sm">
        <ol className="list-decimal space-y-1 pl-5">
          <li><a href="#principles" className="text-primary hover:underline">編集の基本方針</a></li>
          <li><a href="#catch-score" className="text-primary hover:underline">釣れる度スコアの算出方法</a></li>
          <li><a href="#tides" className="text-primary hover:underline">潮汐データ（潮見表）</a></li>
          <li><a href="#rules" className="text-primary hover:underline">釣り禁止・ルール情報の出典</a></li>
          <li><a href="#ugc" className="text-primary hover:underline">ユーザー投稿（釣果・釣り場情報）の扱い</a></li>
          <li><a href="#corrections" className="text-primary hover:underline">誤りの報告と訂正の流れ</a></li>
        </ol>
      </nav>

      <div className="space-y-10">
        <Section id="principles" icon={FileText} title="編集の基本方針">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>スポットの紹介文は他サイトからの転載をせず、公開情報をもとに編集部が独自に作成します。</li>
            <li>データに無い項目は推測で埋めず、「情報なし」「未確認」と表示するか、項目自体を表示しません。</li>
            <li>スポットの位置は地図で確認したうえで掲載しています。</li>
            <li>
              掲載基準・非掲載の基準は<Link prefetch={false} href="/about" className="text-primary hover:underline">ツリスポについて</Link>に記載しています。
            </li>
          </ul>
        </Section>

        <Section id="catch-score" icon={Gauge} title="釣れる度スコアの算出方法">
          <p>
            魚種ページの「釣れるスポット」一覧や、スポットページの ◎○△ は「釣れる度」スコアで決めています。
            スコアは魚種×スポットごとに次の式で計算します（0〜100点）。
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <caption className="sr-only">釣れる度スコアの構成要素</caption>
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">要素</th>
                  <th scope="col" className="px-3 py-2 font-medium">配点</th>
                  <th scope="col" className="px-3 py-2 font-medium">内容</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><th scope="row" className="px-3 py-2 text-left font-medium">地域適性</th><td className="px-3 py-2 tabular-nums">0〜48</td><td className="px-3 py-2">その魚がその海域・都道府県でどれだけ獲れるか（0〜4の5段階×12点）</td></tr>
                <tr><th scope="row" className="px-3 py-2 text-left font-medium">地形適性</th><td className="px-3 py-2 tabular-nums">0〜24</td><td className="px-3 py-2">漁港・磯・サーフ・河川など釣り場の種類との相性（0〜4×6点）</td></tr>
                <tr><th scope="row" className="px-3 py-2 text-left font-medium">旬</th><td className="px-3 py-2 tabular-nums">8</td><td className="px-3 py-2">そのスポットで最盛期の扱いがあるか</td></tr>
                <tr><th scope="row" className="px-3 py-2 text-left font-medium">出典</th><td className="px-3 py-2 tabular-nums">8</td><td className="px-3 py-2">釣果情報の出典（釣具店・釣果情報等）が記録されているか</td></tr>
                <tr><th scope="row" className="px-3 py-2 text-left font-medium">スポット評価</th><td className="px-3 py-2 tabular-nums">0〜12</td><td className="px-3 py-2">同点時の並び順を決める程度の補助項目</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            地域適性が最も重く、根拠は主に<strong>農林水産省「海面漁業生産統計調査」</strong>の魚種別・都道府県別の漁獲量です。
            分布の北限・南限は各県の水産試験研究機関の資料等で補い、岸からの釣りの実績で補正しています。
            湾・灘など狭い海域の指定は県単位の指定より優先します。
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <caption className="sr-only">釣れる度の表示区分と条件</caption>
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">表示</th>
                  <th scope="col" className="px-3 py-2 font-medium">条件</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {TIER_ROWS.map((r) => (
                  <tr key={r.tier}>
                    <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-medium">{r.tier}</th>
                    <td className="px-3 py-2">{r.cond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground">
            地域適性データが未整備の魚種は、そのスポットで最盛期の扱いがあれば ◎、なければ ○ として表示しています。
            スコアは統計と掲載データにもとづく目安で、当日の釣果を保証するものではありません。
          </p>
        </Section>

        <Section id="tides" icon={Waves} title="潮汐データ（潮見表）">
          <p>
            <Link prefetch={false} href="/tides" className="text-primary hover:underline">潮見表</Link>
            の満潮・干潮の時刻と潮位は、<strong>気象庁「潮位表」の天文潮（推算値）</strong>を全国の観測地点ごとに取り込んで表示しています。
            スポットページでは、スポットの座標から最も近い観測地点（一部は河口・湾内などの事情で手動指定）の潮位を表示します。
          </p>
          <p className="text-muted-foreground">
            推算値は気圧や風による潮位の変化（気象潮）を含みません。湖・管理釣り場や内陸県のスポットでは潮汐を表示しません。
          </p>
        </Section>

        <Section id="rules" icon={Scale} title="釣り禁止・ルール情報の出典">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>スポットの「釣り禁止」表示</strong>は、自治体・港湾管理者・漁協・県の公式ページなど<strong>一次情報で確認できたもの</strong>に限り、出典URLと確認日を併記します。
              釣り情報サイトのみが根拠の「全面禁止」情報は、確認の結果一部区域のみの禁止だった例が多いため、裏付けが取れるまで「釣り禁止」とは表示しません。
            </li>
            <li>
              <strong>都道府県の釣りルール</strong>（漁業権・禁漁期間・サイズ制限・遊漁券・釣り禁止区域）は、各都道府県の漁業調整規則や海区漁業調整委員会の指示、県の公式案内をもとに整理し、管轄機関・公式ページ・当サイトの確認日を
              <Link prefetch={false} href="/fishing-rules" className="text-primary hover:underline">釣りのルールとマナー</Link>
              の各都道府県ページに記載しています。
            </li>
            <li>規制は変更されることがあります。釣行前には必ず現地の掲示と管理者の最新情報をご確認ください。</li>
          </ul>
        </Section>

        <Section id="ugc" icon={MessageSquare} title="ユーザー投稿（釣果・釣り場情報）の扱い">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>釣果報告と「みんなが教える釣り場情報」は、利用者の投稿をそのまま掲載する一次情報です。編集部が内容の真偽を保証するものではありません。</li>
            <li>投稿文は不適切な語句を自動で確認し、写真は画像判定サービスで不適切な画像を自動でブロックしています。各投稿には通報ボタンがあり、通報内容を確認して対応します。</li>
            <li>サンプルとして用意したデータは「ユーザーの釣果件数」に含めません。</li>
            <li>釣り禁止が確認されたスポットでは、新たな釣果投稿を受け付けません。</li>
            <li>運営からの補足が必要な投稿には、運営として返信を表示することがあります。</li>
          </ul>
        </Section>

        <Section id="corrections" icon={AlertCircle} title="誤りの報告と訂正の流れ">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              掲載内容の誤り（座標のずれ、釣り禁止になった、駐車場が無くなった等）は
              <Link prefetch={false} href="/contact" className="text-primary hover:underline">お問い合わせフォーム</Link>
              からお知らせください。
            </li>
            <li>編集部が公式情報・地図等で事実を確認します。</li>
            <li>確認できた内容はデータを修正し、釣り禁止が確認された場合は出典と確認日つきで表示を切り替えます。</li>
            <li>確認できない場合は、裏付けが取れるまで表示を変えないか、注意書きにとどめます。</li>
          </ol>
        </Section>
      </div>

      <p className="mt-10 text-center text-sm">
        <Link prefetch={false} href="/about" className="text-primary hover:underline">ツリスポについて</Link>
        <span className="mx-2 text-muted-foreground">／</span>
        <Link prefetch={false} href="/contact" className="text-primary hover:underline">お問い合わせ</Link>
      </p>
    </main>
  );
}
