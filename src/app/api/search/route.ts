import { NextRequest, NextResponse } from "next/server";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { blogPosts } from "@/lib/data/blog";

// カタカナ → ひらがな変換
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

type SearchItemType = "spot" | "fish" | "guide" | "blog" | "tool";

interface IndexItem {
  type: SearchItemType;
  name: string;
  slug: string;
  sub: string;
  searchText: string;
}

// --- 静的ガイドページ ---
const guidePages: IndexItem[] = [
  { type: "guide", name: "サビキ釣りガイド", slug: "/guide/sabiki", sub: "釣り方ガイド", searchText: "さびき釣り サビキ釣り ガイド sabiki 初心者 堤防 アジ サバ イワシ" },
  { type: "guide", name: "初心者ガイド", slug: "/guide/beginner", sub: "釣り方ガイド", searchText: "初心者 ガイド 入門 はじめて beginner 始め方" },
  { type: "guide", name: "ルアー釣りガイド", slug: "/guide/lure", sub: "釣り方ガイド", searchText: "ルアー釣り るあー lure ルアーフィッシング メタルジグ ミノー ワーム" },
  { type: "guide", name: "エギングガイド", slug: "/guide/eging", sub: "釣り方ガイド", searchText: "エギング えぎんぐ eging イカ アオリイカ エギ" },
  { type: "guide", name: "投げ釣り（ちょい投げ）ガイド", slug: "/guide/casting", sub: "釣り方ガイド", searchText: "投げ釣り なげつり ちょい投げ casting サーフ キス カレイ" },
  { type: "guide", name: "ウキ釣りガイド", slug: "/guide/float-fishing", sub: "釣り方ガイド", searchText: "ウキ釣り うき釣り 浮き釣り float フカセ クロダイ メジナ グレ チヌ" },
  { type: "guide", name: "ジギングガイド", slug: "/guide/jigging", sub: "釣り方ガイド", searchText: "ジギング じぎんぐ jigging ショアジギ メタルジグ 青物 ブリ カンパチ" },
  { type: "guide", name: "穴釣りガイド", slug: "/guide/anazuri", sub: "釣り方ガイド", searchText: "穴釣り あなつり anazuri テトラ カサゴ メバル 根魚 ブラクリ" },
  { type: "guide", name: "泳がせ釣りガイド", slug: "/guide/oyogase", sub: "釣り方ガイド", searchText: "泳がせ釣り およがせ oyogase 生き餌 ヒラメ 青物 ブリ" },
  { type: "guide", name: "ラインの選び方", slug: "/guide/line", sub: "道具ガイド", searchText: "ライン 道糸 ハリス ナイロン フロロカーボン peライン 選び方 line" },
  { type: "guide", name: "おもりの種類と選び方", slug: "/guide/sinker", sub: "道具ガイド", searchText: "おもり 重り シンカー ガン玉 ナス型 天秤 ブラクリ sinker オモリ 号数 ジェット天秤 ナス型おもり 中通しおもり" },
  { type: "guide", name: "仕掛けの種類", slug: "/guide/rigs", sub: "道具ガイド", searchText: "仕掛け しかけ rigs 天秤 胴付き ウキ仕掛け サビキ仕掛け" },
  { type: "guide", name: "結び方ガイド", slug: "/guide/knots", sub: "テクニックガイド", searchText: "結び方 ノット knots クリンチノット ユニノット FGノット 糸の結び方" },
  { type: "guide", name: "潮見表の読み方", slug: "/guide/tide", sub: "知識ガイド", searchText: "潮見表 しおみひょう tide 潮汐 大潮 中潮 小潮 潮回り 干潮 満潮" },
  { type: "guide", name: "安全ガイド", slug: "/safety", sub: "マナー・安全", searchText: "安全 あんぜん safety ライフジャケット 落水 事故 注意" },
  { type: "guide", name: "釣りの予算ガイド", slug: "/guide/budget", sub: "初心者向けガイド", searchText: "予算 budget お金 費用 コスト いくら 安い 安く始める" },
  { type: "guide", name: "ナイトフィッシングガイド", slug: "/guide/night-fishing", sub: "釣り方ガイド", searchText: "夜釣り ナイトフィッシング night 夜 ヘッドライト メバリング アジング タチウオ" },
  { type: "guide", name: "はじめての釣り", slug: "/for-beginners", sub: "初心者向けガイド", searchText: "はじめて 初めて 入門 始め方 初心者 for beginners 釣りデビュー" },
  { type: "guide", name: "魚の持ち帰り方ガイド", slug: "/guide/fish-handling", sub: "知識ガイド", searchText: "持ち帰り もちかえり 締め方 しめかた 血抜き クーラーボックス 鮮度 fish handling" },
  { type: "guide", name: "釣り方一覧", slug: "/methods", sub: "釣り方ガイド", searchText: "釣り方 一覧 メソッド methods 種類 やり方" },
  { type: "guide", name: "月別釣りカレンダー", slug: "/fishing-calendar", sub: "知識ガイド", searchText: "カレンダー 月別 季節 旬 いつ 時期 calendar シーズン 春 夏 秋 冬" },
  { type: "guide", name: "ジェット天秤の使い方", slug: "/guide/jet-sinker", sub: "道具ガイド", searchText: "ジェット天秤 じぇっとてんびん jet sinker 天秤 てんびん 投げ釣り 遠投 根がかり ちょい投げ 泳がせ おもり オモリ 道具" },
  { type: "guide", name: "ちょい投げ入門", slug: "/guide/choinage", sub: "釣り方ガイド", searchText: "ちょい投げ ちょいなげ choinage 投げ釣り キス ハゼ カレイ 堤防 手軽 簡単" },
  { type: "guide", name: "ファミリーフィッシングガイド", slug: "/guide/family", sub: "初心者向けガイド", searchText: "ファミリー 家族 子供 こども 子連れ family 親子 休日" },
  { type: "guide", name: "遠投カゴ釣りガイド", slug: "/guide/entou-kago", sub: "釣り方ガイド", searchText: "遠投 カゴ釣り えんとう かご 遠投カゴ マダイ 真鯛 青物 entou kago" },
  { type: "guide", name: "釣り道具ガイド", slug: "/guide/fishing-gear-guide", sub: "道具ガイド", searchText: "道具 タックル 竿 ロッド リール 装備 gear 持ち物 必要なもの 釣り具 釣具" },
  { type: "guide", name: "釣りのコツ", slug: "/guide/fishing-tips", sub: "テクニックガイド", searchText: "コツ tips テクニック 上達 うまくなる 釣れない 釣れる方法" },
  { type: "guide", name: "釣りの始め方", slug: "/guide/how-to-fish", sub: "初心者向けガイド", searchText: "始め方 やり方 how to 初めて はじめて 釣りたい 方法" },
  { type: "guide", name: "仕掛けのセット方法", slug: "/guide/setup", sub: "道具ガイド", searchText: "セット セッティング setup 仕掛け 組み立て 準備 つけ方 付け方" },
  { type: "guide", name: "魚の取り扱いガイド", slug: "/guide/handling", sub: "知識ガイド", searchText: "取り扱い 持ち方 触り方 handling 毒 危険 トゲ 針外し" },
];

// --- 便利ツールページ ---
const toolPages: IndexItem[] = [
  { type: "tool", name: "釣り場診断", slug: "/fish-finder", sub: "おすすめスポット検索", searchText: "釣り場 診断 おすすめ 探す fish finder どこ" },
  { type: "tool", name: "今週どこ行こうかな", slug: "/recommendation", sub: "日付・エリアから最適な釣り場を提案", searchText: "おすすめ 診断 recommendation ぴったり 合う 相性 今週 どこ 行く 日付" },
  { type: "tool", name: "今釣れる魚", slug: "/catchable-now", sub: "現在のシーズン情報", searchText: "今 釣れる 魚 シーズン 旬 catchable now いま 今月" },
  { type: "tool", name: "ボウズチェッカー", slug: "/bouzu-checker", sub: "坊主回避ツール", searchText: "ボウズ ぼうず 坊主 チェッカー bouzu 釣れない 回避" },
  { type: "tool", name: "釣り用語集", slug: "/glossary", sub: "釣り用語辞典", searchText: "用語 用語集 辞典 glossary 言葉 意味 わからない" },
  { type: "tool", name: "お気に入り", slug: "/favorites", sub: "保存したスポット", searchText: "お気に入り ブックマーク 保存 favorites 気になる" },
];

// カテゴリの表示順序
const CATEGORY_ORDER: SearchItemType[] = ["fish", "spot", "guide", "blog", "tool"];

// サーバー起動時に一度だけインデックスを構築（モジュールキャッシュ）
let _index: IndexItem[] | null = null;

function getSearchIndex(): IndexItem[] {
  if (_index) return _index;

  _index = [
    ...fishSpecies.map((f) => {
      const aliases = f.aliases || [];
      return {
        type: "fish" as const,
        name: f.name,
        slug: `/fish/${f.slug}`,
        sub: aliases.length > 0 ? aliases.slice(0, 2).join("\u30FB") : f.nameKana,
        searchText: [
          f.name,
          f.nameKana,
          katakanaToHiragana(f.nameKana),
          f.nameEnglish,
          ...aliases,
          ...aliases.map(katakanaToHiragana),
        ].join(" ").toLowerCase(),
      };
    }),
    ...fishingSpots.map((s) => ({
      type: "spot" as const,
      name: s.name,
      slug: `/spots/${s.slug}`,
      sub: `${s.region.prefecture} ${s.region.areaName}`,
      searchText: [
        s.name,
        s.region.prefecture,
        s.region.areaName,
        katakanaToHiragana(s.name),
      ].join(" ").toLowerCase(),
    })),
    ...guidePages.map((g) => ({ ...g, searchText: g.searchText.toLowerCase() })),
    ...blogPosts.map((post) => ({
      type: "blog" as const,
      name: post.title,
      slug: `/blog/${post.slug}`,
      sub: post.tags.slice(0, 3).join(" / "),
      searchText: [
        post.title,
        katakanaToHiragana(post.title),
        ...post.tags,
        ...post.tags.map(katakanaToHiragana),
        post.description,
      ].join(" ").toLowerCase(),
    })),
    ...toolPages.map((t) => ({ ...t, searchText: t.searchText.toLowerCase() })),
  ];

  return _index;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = (searchParams.get("q") || "").trim();

  // 空クエリは空配列
  if (!q) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }

  const index = getSearchIndex();
  const qLower = q.toLowerCase();
  const qHiragana = katakanaToHiragana(qLower);

  // 検索実行（search-index.tsと同じロジック）
  const matched = index.filter((item) => {
    if (item.searchText.includes(qLower) || item.searchText.includes(qHiragana)) return true;
    if (qLower.includes(item.name.toLowerCase()) || qHiragana.includes(katakanaToHiragana(item.name).toLowerCase())) return true;
    return false;
  });

  // カテゴリ別にグループ化して最大20件
  const results: IndexItem[] = [];
  const MAX_TOTAL = 20;

  for (const cat of CATEGORY_ORDER) {
    if (results.length >= MAX_TOTAL) break;
    const catItems = matched.filter((m) => m.type === cat);
    if (catItems.length > 0) {
      const remaining = MAX_TOTAL - results.length;
      const sliced = catItems.slice(0, Math.min(5, remaining));
      results.push(...sliced);
    }
  }

  // searchTextはクライアントに送る必要がないので除外
  const response = results.map(({ searchText: _st, ...rest }) => rest);

  return NextResponse.json(response, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
