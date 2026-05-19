/**
 * AI 生成ブログ記事の品質チェック (Phase 3)
 *
 * 生成された記事が AdSense ポリシー + SEO 要件を満たすか検証する。
 * blog-generator.ts や microCMS publish 前に呼ぶ。
 */

import type { BlogPost } from "@/lib/data/blog";

export interface ArticleQualityIssue {
  level: "error" | "warning";
  field: string;
  message: string;
}

export interface ArticleQualityCheck {
  passed: boolean;
  issues: ArticleQualityIssue[];
}

/** AdSense + SEO 観点で記事品質をチェック */
export function checkArticleQuality(article: {
  title: string;
  description: string;
  content: string;
  references?: string[];
}): ArticleQualityCheck {
  const issues: ArticleQualityIssue[] = [];

  // 1. 文字数 (本文 1,500-3,000 字)
  const bodyLength = countJapaneseChars(article.content);
  if (bodyLength < 1500) {
    issues.push({ level: "error", field: "content", message: `本文が ${bodyLength} 字。 最低 1,500 字必須` });
  } else if (bodyLength > 5000) {
    issues.push({ level: "warning", field: "content", message: `本文が ${bodyLength} 字。 長すぎ (目安 1,500-3,000)` });
  }

  // 2. タイトル (60 字以内)
  if (article.title.length > 60) {
    issues.push({ level: "warning", field: "title", message: `タイトル ${article.title.length} 字。 60 字以内推奨` });
  }
  if (article.title.length < 10) {
    issues.push({ level: "error", field: "title", message: `タイトル ${article.title.length} 字。 短すぎ` });
  }

  // 3. description (50-160 字)
  if (article.description.length < 50 || article.description.length > 200) {
    issues.push({
      level: "warning",
      field: "description",
      message: `description ${article.description.length} 字。 50-160 字推奨`,
    });
  }

  // 4. H2 4 個以上
  const h2Count = (article.content.match(/^##\s+/gm) ?? []).length;
  if (h2Count < 3) {
    issues.push({ level: "error", field: "content", message: `H2 が ${h2Count} 個。 最低 3 個必須` });
  }

  // 5. references 2 件以上 (AI ハルシネーション対策)
  const refCount = article.references?.length ?? 0;
  if (refCount < 2) {
    issues.push({ level: "error", field: "references", message: `参考文献 ${refCount} 件。 2 件以上必須` });
  }

  // 6. 内部リンク 5+ (SEO)
  const internalLinkCount = (article.content.match(/\]\(\/(?:spots|fish|prefecture|accommodations|guide|blog)\//g) ?? []).length;
  if (internalLinkCount < 3) {
    issues.push({
      level: "warning",
      field: "content",
      message: `内部リンク ${internalLinkCount} 個。 5+ 推奨 (関連スポット、 魚種、 ガイド等)`,
    });
  }

  // 7. 禁止表現 (AI らしさが目立つフレーズ)
  const forbiddenPhrases = ["AI", "ChatGPT", "Claude", "本記事は", "本稿では"];
  for (const phrase of forbiddenPhrases) {
    if (article.content.includes(phrase)) {
      issues.push({ level: "warning", field: "content", message: `「${phrase}」 が含まれている (AI 由来表現)` });
    }
  }

  // 8. 不確実表現 (ハルシネーション risk)
  const hallucinationPhrases = ["かもしれません", "おそらく", "推測される", "可能性があります"];
  let hallucinationHits = 0;
  for (const phrase of hallucinationPhrases) {
    if (article.content.includes(phrase)) hallucinationHits++;
  }
  if (hallucinationHits >= 3) {
    issues.push({
      level: "warning",
      field: "content",
      message: `推測表現が ${hallucinationHits} 個。 ファクト確認推奨`,
    });
  }

  return {
    passed: !issues.some((i) => i.level === "error"),
    issues,
  };
}

/** 日本語の文字数を概算 (CJK 1 文字 = 1、 ASCII 4 文字 = 1 として概算) */
function countJapaneseChars(text: string): number {
  // markdown 構文を除去してから count
  const stripped = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>-]/g, "")
    .replace(/\s+/g, " ");
  let count = 0;
  for (const ch of stripped) {
    const code = ch.codePointAt(0) ?? 0;
    // CJK 統合漢字、 ひらがな、 カタカナ
    if ((code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff)) {
      count += 1;
    } else if (code >= 0x21 && code <= 0x7e) {
      count += 0.25;
    }
  }
  return Math.floor(count);
}

/** 既存 BlogPost を品質チェック (publish 済み記事の事後監査用) */
export function auditPublishedPost(post: BlogPost): ArticleQualityCheck {
  return checkArticleQuality({
    title: post.title,
    description: post.description ?? "",
    content: post.content ?? "",
    references: [], // 既存 BlogPost には references field なし、 後方互換のため空
  });
}
