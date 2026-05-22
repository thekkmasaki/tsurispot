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
