/**
 * Article / HowTo JSON-LD ヘルパー (SEO-3)
 *
 * /guide/[slug] 等のガイド page で再利用する schema 生成関数。
 * 既存の /guide/beginner、 /guide/fish-recipes、 /guide/casting、 /guide/sabiki、
 * /guide/troubleshooting に Article schema が部分実装されているのを統一・拡大する。
 *
 * 使い方:
 * ```tsx
 * import { buildArticleJsonLd } from "@/lib/seo/article-jsonld";
 *
 * const jsonLd = buildArticleJsonLd({
 *   headline: "釣り初心者の道具セットアップ完全ガイド",
 *   description: "ロッド、 リール、 仕掛けの選び方を一から解説。",
 *   url: "https://tsurispot.com/guide/beginner-setup",
 *   datePublished: "2025-01-01",
 * });
 * // <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
 * ```
 *
 * HowTo schema は釣り方ガイド (sabiki, eging, casting 等) で利用:
 * ```tsx
 * const howTo = buildHowToJsonLd({
 *   name: "サビキ釣りの始め方",
 *   description: "サビキ釣りで使う仕掛けと釣り方の手順",
 *   totalTime: "PT30M",
 *   steps: [
 *     { name: "仕掛けをセット", text: "サビキ仕掛けを道糸に結ぶ" },
 *     { name: "コマセを入れる", text: "アミエビをカゴに入れる" },
 *     ...
 *   ],
 * });
 * ```
 */

interface ArticleJsonLdInput {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  imageUrl?: string;
  authorName?: string;
}

export function buildArticleJsonLd(input: ArticleJsonLdInput) {
  const datePublished = input.datePublished ?? "2025-01-01";
  const dateModified = input.dateModified ?? new Date().toISOString().split("T")[0];
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    datePublished,
    dateModified,
    url: input.url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
    ...(input.imageUrl && {
      image: {
        "@type": "ImageObject",
        url: input.imageUrl,
      },
    }),
    author: {
      "@type": "Person",
      name: input.authorName ?? "正木 家康",
      jobTitle: "編集長",
      url: "https://tsurispot.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "ツリスポ",
      url: "https://tsurispot.com",
      logo: {
        "@type": "ImageObject",
        url: "https://tsurispot.com/logo.svg",
      },
    },
  };
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

interface HowToJsonLdInput {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration (e.g., "PT30M" = 30 分)
  estimatedCost?: { currency: string; value: number };
  supplies?: string[];
  tools?: string[];
  steps: HowToStep[];
}

export function buildHowToJsonLd(input: HowToJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    ...(input.totalTime && { totalTime: input.totalTime }),
    ...(input.estimatedCost && {
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: input.estimatedCost.currency,
        value: input.estimatedCost.value,
      },
    }),
    ...(input.supplies && input.supplies.length > 0 && {
      supply: input.supplies.map((s) => ({
        "@type": "HowToSupply",
        name: s,
      })),
    }),
    ...(input.tools && input.tools.length > 0 && {
      tool: input.tools.map((t) => ({
        "@type": "HowToTool",
        name: t,
      })),
    }),
    step: input.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.image && {
        image: {
          "@type": "ImageObject",
          url: s.image,
        },
      }),
    })),
  };
}

/**
 * BreadcrumbList JSON-LD ビルダー。
 * 各 page で手書きしていた BreadcrumbList を統一する。
 * 末尾要素（現在ページ）は url を省略しても可（schema.org 推奨）。
 *
 * ```ts
 * buildBreadcrumbJsonLd([
 *   { name: "ホーム", url: "https://tsurispot.com" },
 *   { name: "都道府県一覧", url: "https://tsurispot.com/prefecture" },
 *   { name: "福井県", url: "https://tsurispot.com/prefecture/fukui" },
 *   { name: "キスの釣り情報" }, // 現在ページは url 省略可
 * ])
 * ```
 */
export function buildBreadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

/**
 * FAQPage JSON-LD ビルダー。
 * 各 page で手書きしていた FAQPage を統一する。
 *
 * ```ts
 * buildFaqJsonLd([
 *   { question: "...", answer: "..." },
 * ])
 * ```
 */
export function buildFaqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "ja-JP",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

interface ItemListEntry {
  name: string;
  url: string;
}

/**
 * ItemList JSON-LD ビルダー。
 * スポット一覧などを ItemList として統一出力する。
 * numberOfItems は items 全体の件数（表示は先頭 N 件でも、総数を別途渡せる）。
 *
 * ```ts
 * buildItemListJsonLd({
 *   name: "福井県でキスが釣れる釣り場",
 *   items: spots.slice(0, 30).map((s) => ({ name: s.name, url: `https://tsurispot.com/spots/${s.slug}` })),
 *   numberOfItems: spots.length,
 * })
 * ```
 */
export function buildItemListJsonLd(input: {
  name: string;
  items: ItemListEntry[];
  numberOfItems?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    numberOfItems: input.numberOfItems ?? input.items.length,
    itemListElement: input.items.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      url: entry.url,
    })),
  };
}
