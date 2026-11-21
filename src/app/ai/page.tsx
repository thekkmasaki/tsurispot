import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Bot,
  Plug,
  MessageSquare,
  Wrench,
  Database,
  ShieldCheck,
  LifeBuoy,
  AlertTriangle,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { safeJsonLd } from "@/lib/safe-json-ld";
import { CopyEndpoint } from "./copy-endpoint";

const PAGE_URL = "https://tsurispot.com/ai";
const MCP_ENDPOINT = "https://tsurispot.com/api/mcp";
const LAST_REVIEWED = "2026-11-20";
const TITLE = "AIアシスタントでツリスポを使う（Claude・ChatGPT 連携）";
const DESCRIPTION =
  "ツリスポの MCP コネクタを Claude や ChatGPT に追加すると、全国の釣り場検索・潮汐・釣れる魚・最近の釣果・近くの釣具店・釣りのルールを会話の中で調べられます。設定方法、質問例、ツール一覧、データの出典とプライバシーを説明します。";

export const metadata: Metadata = {
  title: `${TITLE}｜ツリスポ`,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE}｜ツリスポ`,
    description: "Claude・ChatGPT から全国の釣り場・潮汐・釣れる魚を調べられる MCP コネクタの設定方法。",
    type: "article",
    url: PAGE_URL,
    siteName: "ツリスポ",
  },
};

type Tool = { name: string; title: string; description: string };

const TOOLS: Tool[] = [
  { name: "search_spots", title: "釣り場を探す", description: "地名・都道府県・魚種・釣り場の種類（堤防・磯・砂浜など）・初心者向けかどうかで釣り場を検索します。" },
  { name: "get_spot_details", title: "釣り場の詳細", description: "釣り場の住所・座標・設備（駐車場・トイレ）・釣れる魚と時期・ルールや禁止事項をまとめて返します。" },
  { name: "find_nearby_spots", title: "近くの釣り場", description: "現在地や指定した座標から近い順に釣り場を探します。" },
  { name: "get_tide", title: "潮汐（満潮・干潮）", description: "釣り場や地点の満潮・干潮の時刻と潮位、潮回り（大潮・小潮など）を返します。" },
  { name: "get_catchable_fish", title: "今釣れる魚", description: "地域・月を指定して、その時期に釣れる魚と旬の魚を返します。" },
  { name: "get_recent_catches", title: "最近の釣果", description: "ツリスポに投稿された最近の釣果やエリア別の釣果レポートを返します。" },
  { name: "find_tackle_shops", title: "釣具店・エサ", description: "釣り場の近くにある釣具店（エサの購入先）を探します。" },
  { name: "recommend_gear", title: "仕掛け・道具", description: "狙う魚や釣り方に合った仕掛け・道具の選び方を提案します。" },
  { name: "get_fish_info", title: "魚の情報", description: "魚種ごとの特徴・旬・釣り方・注意点（毒やトゲなど）を返します。" },
  { name: "check_fishing_rules", title: "釣りのルール", description: "釣り場の禁止事項（投げ釣り・ルアー・夜釣り等）や遊漁券の要否、釣り禁止情報の出典を確認します。" },
  { name: "draft_catch_report", title: "釣果の下書き", description: "会話で伝えた釣果から投稿の下書きを作り、確認ページのリンクを返します。リンク先で写真を付けて「投稿する」を押すまで公開されません。" },
];

const EXAMPLE_PROMPTS = [
  "今週末、湘南でアジ釣りをしたい。おすすめの釣り場と潮回りは？",
  "千葉で子ども連れでも安心な、トイレと駐車場がある堤防を3つ教えて",
  "明日、大阪湾の釣り場の満潮と干潮は何時？",
  "11月の神奈川で今釣れる魚と、初心者向けの釣り方を教えて",
  "横浜の本牧周辺で最近どんな魚が釣れている？",
  "北九州でエギングをしたい。近くの釣具店と必要な道具は？",
  "東京湾の釣り場でタチウオを狙うときの仕掛けを教えて",
  "この釣り場は夜釣りや投げ釣りをしてもいい？ルールを確認して",
  "今日、大黒海づり施設でアジを12匹、最大22cm釣った。サビキで晴れ。ツリスポに投稿したい",
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": PAGE_URL,
    name: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    dateModified: LAST_REVIEWED,
    inLanguage: "ja",
    isPartOf: { "@id": "https://tsurispot.com/#website" },
    publisher: { "@id": "https://tsurispot.com/#organization" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "AIアシスタントで使う", item: PAGE_URL },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Claude にツリスポのコネクタを追加する方法",
    step: [
      { "@type": "HowToStep", position: 1, text: "Claude の「設定」→「コネクタ」を開き、「追加」から「カスタムコネクタを追加」を選ぶ", image: "https://tsurispot.com/images/ai/claude-add-menu.jpg" },
      { "@type": "HowToStep", position: 2, text: `名前に「ツリスポ」、URL に ${MCP_ENDPOINT} を入力し、認証なしのまま追加する`, image: "https://tsurispot.com/images/ai/claude-add-connector.jpg" },
      { "@type": "HowToStep", position: 3, text: "チャット入力欄の「＋」→「プラグイン」でツリスポがオンになっていることを確認する", image: "https://tsurispot.com/images/ai/claude-enable-connector.jpg" },
      { "@type": "HowToStep", position: 4, text: "釣りについて質問し、ツリスポの使用確認が出たら許可する", image: "https://tsurispot.com/images/ai/claude-tool-permission.jpg" },
    ],
  },
];

function Shot({ src, width, height, alt }: { src: string; width: number; height: number; alt: string }) {
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      sizes="(max-width: 640px) 90vw, 360px"
      className="mt-2 h-auto w-full max-w-[360px] rounded-lg border shadow-sm"
    />
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof Bot;
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

export default function AiConnectorPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mb-4">
        <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "AIアシスタントで使う" }]} />
      </div>

      <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">{TITLE}</h1>
      <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
        ツリスポのデータは、Claude や ChatGPT などの AI アシスタントから直接使えます。
        コネクタを一度追加しておけば、「今週末どこで何が釣れる？」と話しかけるだけで、AI が全国の釣り場・潮汐・釣れる魚・最近の釣果を調べて答えてくれます。
        無料・登録不要です。
      </p>
      <p className="mb-8 text-xs text-muted-foreground">最終更新日: {LAST_REVIEWED}</p>

      <nav aria-label="目次" className="mb-8 rounded-xl border bg-muted/30 p-4 text-sm">
        <ol className="list-decimal space-y-1 pl-5">
          <li><a href="#what" className="text-primary hover:underline">ツリスポのコネクタとは</a></li>
          <li><a href="#claude" className="text-primary hover:underline">Claude での設定方法</a></li>
          <li><a href="#chatgpt" className="text-primary hover:underline">ChatGPT での設定方法</a></li>
          <li><a href="#other-apps" className="text-primary hover:underline">Gemini などほかの AI アプリ</a></li>
          <li><a href="#examples"className="text-primary hover:underline">質問の例</a></li>
          <li><a href="#tools" className="text-primary hover:underline">使える機能（ツール一覧）</a></li>
          <li><a href="#data" className="text-primary hover:underline">データの出典と注意事項</a></li>
          <li><a href="#privacy" className="text-primary hover:underline">プライバシー</a></li>
          <li><a href="#support" className="text-primary hover:underline">お問い合わせ・サポート</a></li>
        </ol>
      </nav>

      <div className="space-y-10">
        <Section id="what" icon={Bot} title="ツリスポのコネクタとは">
          <p>
            ツリスポは、AI アシスタントが外部のデータを使うための共通規格
            <strong>MCP（Model Context Protocol）</strong>に対応したサーバーを公開しています。
            AI アシスタントにこのサーバーを「コネクタ」として追加すると、AI が必要に応じてツリスポのデータを検索し、出典リンク付きで回答します。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>読み取り専用：ツリスポのデータを調べるだけで、書き込みや投稿は行いません</li>
            <li>認証なし：アカウント登録やログインは不要です</li>
            <li>対応方式：Streamable HTTP（リモート MCP サーバー）</li>
          </ul>
          <p className="font-medium text-foreground">サーバーURL（エンドポイント）</p>
          <CopyEndpoint value={MCP_ENDPOINT} />
          <p className="text-xs text-muted-foreground">
            ※ この URL はブラウザで開くページではありません。AI アシスタントのコネクタ設定に貼り付けて使います。
          </p>
        </Section>

        <Section id="claude" icon={Plug} title="Claude での設定方法">
          <ol className="list-decimal space-y-6 pl-5">
            <li>
              Claude（claude.ai またはアプリ）で「設定」→「コネクタ」（画面によっては「プラグイン」）を開き、右上の「追加」から<strong>「カスタムコネクタを追加」</strong>を選びます。
              <Shot src="/images/ai/claude-add-menu.jpg" width={720} height={630} alt="「追加」メニューの中の「カスタムコネクタを追加」" />
            </li>
            <li>
              名前に <strong>ツリスポ</strong>、MCP サーバー URL に <code className="rounded bg-muted px-1 py-0.5 text-xs">{MCP_ENDPOINT}</code> を入力し、「続ける」を押して追加します。認証の設定は不要です。
              <Shot src="/images/ai/claude-add-connector.jpg" width={530} height={720} alt="カスタムコネクタの追加画面に名前「ツリスポ」と URL を入力したところ" />
            </li>
            <li>
              チャット入力欄の「＋」→「プラグイン」で、ツリスポがオンになっていることを確認します。
              <Shot src="/images/ai/claude-enable-connector.jpg" width={642} height={720} alt="チャットの＋メニューでツリスポのスイッチがオンになっている" />
            </li>
            <li>
              釣りについて質問します。ツリスポを使う前に確認が表示されたら「1回だけ許可する」または「常に許可する」を押します（ツリスポのツールはすべて読み取り専用です）。
              <Shot src="/images/ai/claude-tool-permission.jpg" width={686} height={720} alt="Claude がツリスポの「釣り場を探す」を使ってよいか確認している画面" />
            </li>
          </ol>
          <p className="text-xs text-muted-foreground">
            ※ 画面の名称や位置は Claude の更新で変わることがあります。チーム／企業プランでは、管理者がコネクタを追加する必要があることがあります。
          </p>
        </Section>

        <Section id="chatgpt" icon={Plug} title="ChatGPT での設定方法">
          <p>
            <strong>PC のブラウザ（chatgpt.com）で設定します。スマホアプリからは追加できません。</strong>
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>PC のブラウザで ChatGPT を開き、左のメニューの「プラグイン」（<code className="rounded bg-muted px-1 py-0.5 text-xs">chatgpt.com/plugins</code>）を選びます。</li>
            <li>右上の「追加」から<strong>「カスタム MCP サーバーを追加」</strong>を選びます。</li>
            <li>名前に <strong>ツリスポ</strong>、サーバー URL に <code className="rounded bg-muted px-1 py-0.5 text-xs">{MCP_ENDPOINT}</code> を入力し、認証を<strong>「認証なし」</strong>に変えます（初期値は OAuth です）。</li>
            <li>「理解したうえで続けます」にチェックを入れて「プラグインとして作成」を押し、続けて表示される「ツリスポに接続」を押します。</li>
            <li>チャットの入力欄で <strong>@ツリスポ</strong> と入力してツリスポを選び、釣りについて質問します。</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            ※ 2026年11月に無料プランでこの手順で追加できることを確認しています。以前必要だった「開発者モード」をオンにする操作は不要です。ただし、利用できるプランやメニューの名称・位置は ChatGPT の更新で変わることがあり、プランによっては「カスタム MCP サーバーを追加」が表示されないことがあります。Business／Enterprise／Edu では、管理者が追加・公開する必要があることがあります。
          </p>
        </Section>

        <Section id="other-apps" icon={Plug} title="Gemini などほかの AI アプリ">
          <p>
            リモート MCP サーバー（Streamable HTTP）を URL で追加できる AI アプリなら、同じ URL
            （<code className="rounded bg-muted px-1 py-0.5 text-xs">{MCP_ENDPOINT}</code>）を登録すれば使えます。認証は「なし」を選んでください。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Gemini（個人向けアプリ）</strong>：設定の「接続済みアプリ」からカスタムアプリとして追加できます。ただし、現在は一部のプラン・地域・言語に限られた機能です。</li>
            <li><strong>Gemini Enterprise</strong>：管理者が「接続済みアプリ」から MCP サーバーとして追加します。</li>
            <li><strong>開発者向けツール</strong>（Claude Code、Cursor、VS Code など）：MCP の設定ファイルに上記の URL を HTTP サーバーとして登録します。</li>
          </ul>
        </Section>

        <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">「サインインが必要」「接続できません」と表示されたら</p>
            <p className="mt-1">
              ツリスポのコネクタにサインインは不要です。古い設定が残っていると表示されることがあるため、
              いったんコネクタを削除し、上の手順でもう一度追加してください（URL の末尾に余分な「/」や空白が入っていないかも確認してください）。
            </p>
          </div>
        </div>

        <Section id="examples" icon={MessageSquare} title="質問の例">
          <p>コネクタを有効にしたら、ふだんの言葉で質問するだけです。たとえば:</p>
          <ul className="space-y-2">
            {EXAMPLE_PROMPTS.map((p) => (
              <li key={p} className="rounded-lg border bg-muted/30 px-3 py-2">「{p}」</li>
            ))}
          </ul>
          <p className="pt-2 font-medium text-foreground">回答の例（Claude）</p>
          <p>「今週末、湘南でアジ釣りをしたい。初心者でも釣れる釣り場と、土曜日の満潮・干潮の時刻を教えて」と聞いたときの回答です。釣り場ページへのリンク付きで、潮の時刻と狙い目の時間まで答えてくれます。</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Shot src="/images/ai/claude-answer-spots.jpg" width={587} height={720} alt="Claude がツリスポのデータから湘南の初心者向けアジ釣り場を表で提案している回答" />
            <Shot src="/images/ai/claude-answer-tide.jpg" width={720} height={594} alt="Claude が湘南港の満潮・干潮の時刻と狙い目の時間を答えている回答" />
          </div>
          <p className="text-xs text-muted-foreground">
            回答に含まれるツリスポのリンクから、釣り場の地図・写真・アクセスなどの詳しい情報を確認できます。
          </p>
        </Section>

        <Section id="tools" icon={Wrench} title="使える機能（ツール一覧）">
          <p>
            AI アシスタントは、質問に応じて次のツールを自動で使い分けます。すべて読み取り専用で、ツリスポのデータを書き換えることはありません。
            釣果の投稿は、AI が作った下書きのリンクを開き、ご自身で写真を付けて確定したときだけ公開されます。
          </p>
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th scope="col" className="px-3 py-2 font-semibold">機能</th>
                  <th scope="col" className="px-3 py-2 font-semibold">ツール名</th>
                  <th scope="col" className="px-3 py-2 font-semibold">できること</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((t) => (
                  <tr key={t.name} className="border-b align-top last:border-b-0">
                    <td className="whitespace-nowrap px-3 py-2 font-medium">{t.title}</td>
                    <td className="px-3 py-2"><code className="text-xs">{t.name}</code></td>
                    <td className="px-3 py-2 text-muted-foreground">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="data" icon={Database} title="データの出典と注意事項">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>釣り場・魚種・ルール</strong>：ツリスポ編集部が自治体・漁業協同組合・港湾管理者などの公開情報と地図データをもとに整理したものです。作り方は
              <Link prefetch={false} href="/about/editorial-policy" className="text-primary hover:underline">編集方針・データの作り方</Link>
              をご覧ください。
            </li>
            <li><strong>潮汐</strong>：気象庁の潮位表（推算値）にもとづいています。実際の潮位は気圧や風で変わります。</li>
            <li><strong>釣果</strong>：ツリスポの利用者による投稿と、編集部のエリア別釣果レポートです。</li>
          </ul>
          <p className="rounded-lg bg-muted/50 p-3">
            釣り禁止区域・立入禁止・駐車場などの現地の状況は予告なく変わります。AI の回答をうのみにせず、
            <strong>釣行前と現地では必ず掲示や管理者の案内を優先</strong>してください。ライフジャケットの着用など、安全対策は
            <Link prefetch={false} href="/safety" className="text-primary hover:underline">安全ガイド</Link>
            も参考にしてください。
          </p>
        </Section>

        <Section id="privacy" icon={ShieldCheck} title="プライバシー">
          <ul className="list-disc space-y-1 pl-5">
            <li>コネクタは公開情報を返すだけで、アカウント・お気に入り・投稿者の個人情報にはアクセスしません。</li>
            <li>AI から送られる検索条件（地名・魚種・座標など）は回答の作成にのみ使い、保存しません。</li>
            <li>釣果の下書きはサーバーに保存せず、確認ページのリンクの中にだけ入っています。投稿するかどうかは確認ページでご自身が決めます。</li>
            <li>障害調査のため、呼び出されたツール名と User-Agent をサーバーログに記録します（IP アドレスや会話内容は記録しません）。</li>
            <li>回答に含まれるツリスポへのリンクには、AI 経由の訪問を識別するパラメータ（utm_source=ai_mcp）が付きます。</li>
          </ul>
          <p>
            詳しくは
            <Link prefetch={false} href="/privacy#ai-connector" className="text-primary hover:underline">プライバシーポリシー（AIアシスタント連携）</Link>
            をご覧ください。AI アシスタント側での会話の扱いは、各サービスのプライバシーポリシーに従います。
          </p>
        </Section>

        <Section id="support" icon={LifeBuoy} title="お問い合わせ・サポート">
          <p>
            コネクタがつながらない、回答の情報が間違っている、といった場合は
            <Link prefetch={false} href="/contact" className="text-primary hover:underline">お問い合わせフォーム</Link>
            からご連絡ください。お問い合わせの種類で「その他・ご意見」を選び、使っている AI アシスタント（Claude・ChatGPT など）と、表示されたエラーメッセージを書いていただけると調査がスムーズです。
          </p>
          <p className="text-xs text-muted-foreground">
            AI 向けのサイト概要は <a href="/llms.txt" className="text-primary hover:underline">llms.txt</a>、
            サーバー情報は <a href="/.well-known/mcp.json" className="text-primary hover:underline">/.well-known/mcp.json</a> でも公開しています。
          </p>
        </Section>
      </div>
    </main>
  );
}
