import { describe, it, expect } from "vitest";
import { BLOCKED_UA_PATTERNS } from "@/middleware";

/**
 * AI検索bot 許可リストのドリフト防止
 *
 * 背景: robots.ts は「学習No・検索/引用Yes」方針で AI検索bot 3種を allow しているが、
 *   過去に middleware の BLOCKED_UA_PATTERNS が同じ3種を 403 でブロックし続け、
 *   robots.txt で許可しながら実体は門前払い、という矛盾が発生した（AI流入が止まった原因）。
 *   robots.ts と middleware は別ファイルなので同期が崩れやすい。このテストで固定する。
 */
const isBlocked = (ua: string) => BLOCKED_UA_PATTERNS.some((p) => p.test(ua));

describe("AI検索bot は middleware を通過する（robots.ts の allow と一致）", () => {
  // 実際の User-Agent 文字列に近い代表例で検証する。
  const ALLOWED_UAS = [
    "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  ];

  it.each(ALLOWED_UAS)("通過すべき: %s", (ua) => {
    expect(isBlocked(ua)).toBe(false);
  });
});

describe("学習系・SEO/広告系bot は引き続きブロックする（コスト再燃防止）", () => {
  // ユーザー方針: 検索botのみ解放、学習系は据え置きブロック。
  const BLOCKED_UAS = [
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot",
    "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "Mozilla/5.0 (compatible; CCBot/2.0; +https://commoncrawl.org/faq/)",
    "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
    "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
    "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)",
  ];

  it.each(BLOCKED_UAS)("ブロックすべき: %s", (ua) => {
    expect(isBlocked(ua)).toBe(true);
  });

  it("Google-Extended（学習用権限トークン）は据え置きブロック", () => {
    expect(isBlocked("Google-Extended")).toBe(true);
  });
});
