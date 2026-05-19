/**
 * AI ブログ記事生成パイプライン (Phase 3 scaffold)
 *
 * 使い方:
 *   1. .env.local に ANTHROPIC_API_KEY, MICROCMS_API_KEY, MICROCMS_SERVICE_DOMAIN を設定
 *   2. scripts/blog-keyword-targets.md から keyword を 1 つ選ぶ
 *   3. `npx tsx scripts/blog-generator.ts "<keyword>" [--dry-run]`
 *      - --dry-run: 生成内容を console に出して microCMS には POST しない
 *      - 通常: microCMS に下書き状態で POST、 user が editor で校正 → publish
 *
 * 出力ルール (全記事必須):
 *   - 文字数 1,500-3,000 字
 *   - H2 4-6 個、 H3 適宜
 *   - 結論を冒頭で提示
 *   - **本文末尾に「参考・出典」セクション必須** (URL or 書籍を 2 件以上)
 *   - 内部リンク 5+ (関連スポット、 魚種、 ガイド、 釣り宿等)
 *
 * AI ハルシネーション対策:
 *   - prompt で「不確実な数値・年月は記載しない」「実在しないスポット名・人名禁止」を明示
 *   - 生成記事は draft で POST、 必ず人手で校正してから publish
 *   - 月 1 回 random 10 件監査 (CLAUDE.md ルール)
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface BlogGenerateRequest {
  keyword: string;
  category?: "beginner" | "gear" | "seasonal" | "technique" | "spot-guide" | "manner" | "knowledge" | "report";
  targetPrefecture?: string;
  targetFish?: string;
}

interface GeneratedArticle {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  references: string[];
}

const SYSTEM_PROMPT = `あなたは日本の釣りスポット情報サイト「ツリスポ」の記事ライターです。
釣り客向けの実用的かつ SEO 最適化された記事を生成してください。

【厳守ルール】
- 文字数 1,500-3,000 字
- H2 4-6 個、 H3 適宜
- 結論を冒頭で提示する pyramid 構成
- 不確実な数値・年月は記載しない (「2025年現在」 など曖昧な表現を避ける)
- 実在しないスポット名・人名・店舗名を絶対に記載しない
- 推測ではなく、 一般的な釣り知識として確立されたものだけ書く
- 文章は丁寧体 (「です・ます」 調)
- 「参考・出典」セクションを末尾に必ず追加 (URL or 書籍、 2 件以上)

【内部リンク】
本文中に以下を散りばめてください:
- 関連スポット: /spots/<slug> 形式 (ただし scaffold では仮 link \`/spots\` だけ書いて user が後で具体 slug に置換)
- 魚種図鑑: /fish/<slug> 形式 (同上)
- 都道府県別: /prefecture/<slug> 形式
- 釣り宿: /accommodations/<prefecture-slug> 形式
- ガイド: /guide/beginner 形式

【出力形式】
markdown で生成。 H1 (タイトル) は含めず、 description (160 字以内) と本文を分けて出力。
最後の行に必ず以下の JSON で metadata を返してください:
\`\`\`json
{
  "title": "記事タイトル (60 字以内)",
  "slug": "url-slug-japanese-kebab",
  "description": "記事概要 (160 字以内)",
  "category": "beginner|gear|seasonal|technique|spot-guide|manner|knowledge|report",
  "tags": ["タグ1", "タグ2", ...],
  "references": ["https://...", "書籍名・著者・出版社"]
}
\`\`\`
`;

async function callClaude(userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY が未設定です (.env.local)");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errText}`);
  }

  const json = (await response.json()) as { content: Array<{ text: string }> };
  return json.content.map((c) => c.text).join("\n");
}

function parseGeneratedContent(raw: string): GeneratedArticle {
  // 末尾の ```json ... ``` block を抽出
  const match = raw.match(/```json\s*(\{[\s\S]+?\})\s*```/);
  if (!match) throw new Error("Generated content に metadata JSON が見つかりません");
  const metadata = JSON.parse(match[1]);
  // body = ```json block 以前の text
  const body = raw.slice(0, match.index).trim();
  return {
    title: metadata.title,
    slug: metadata.slug,
    description: metadata.description,
    content: body,
    category: metadata.category,
    tags: metadata.tags ?? [],
    references: metadata.references ?? [],
  };
}

async function postToMicroCMS(article: GeneratedArticle): Promise<string> {
  const apiKey = process.env.MICROCMS_API_KEY;
  const domain = process.env.MICROCMS_SERVICE_DOMAIN;
  if (!apiKey || !domain) throw new Error("MICROCMS_API_KEY / MICROCMS_SERVICE_DOMAIN が未設定です");

  const contentWithRefs = appendReferences(article.content, article.references);

  const response = await fetch(`https://${domain}.microcms.io/api/v1/blogs?status=draft`, {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: article.title,
      slug: article.slug,
      description: article.description,
      content: contentWithRefs,
      // category, tags は microCMS スキーマに合わせて要調整
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`microCMS POST error: ${response.status} ${errText}`);
  }

  const json = (await response.json()) as { id: string };
  return json.id;
}

function appendReferences(content: string, references: string[]): string {
  if (references.length === 0) {
    throw new Error("references が空です — AI ハルシネーション対策として参考文献必須");
  }
  const refSection = "\n\n## 参考・出典\n\n" + references.map((r) => `- ${r}`).join("\n");
  return content + refSection;
}

async function main() {
  const args = process.argv.slice(2);
  const keyword = args[0];
  const dryRun = args.includes("--dry-run");

  if (!keyword) {
    console.error("Usage: npx tsx scripts/blog-generator.ts \"<keyword>\" [--dry-run]");
    console.error("例: npx tsx scripts/blog-generator.ts \"千葉県 アジ 釣り方\" --dry-run");
    process.exit(1);
  }

  // keyword-targets.md から context を取り込む (option)
  let keywordContext = "";
  try {
    const targets = readFileSync(resolve(process.cwd(), "scripts/blog-keyword-targets.md"), "utf8");
    if (targets.includes(keyword)) {
      keywordContext = "\n\n(これは scripts/blog-keyword-targets.md に登録済みのターゲット keyword です)";
    }
  } catch {
    // file がなくても続行
  }

  const userPrompt = `以下の keyword で釣り客向け SEO 記事を生成してください: "${keyword}"${keywordContext}`;

  console.log("[blog-generator] Claude API で記事生成中...");
  const raw = await callClaude(userPrompt);
  const article = parseGeneratedContent(raw);

  console.log("[blog-generator] 生成完了:");
  console.log(`  - title: ${article.title}`);
  console.log(`  - slug: ${article.slug}`);
  console.log(`  - description: ${article.description}`);
  console.log(`  - category: ${article.category}`);
  console.log(`  - tags: ${article.tags.join(", ")}`);
  console.log(`  - references: ${article.references.length}件`);
  console.log(`  - content length: ${article.content.length} 字`);

  if (dryRun) {
    console.log("\n--- DRY RUN: microCMS POST skip ---\n");
    console.log(article.content);
    console.log("\n--- 参考・出典 ---");
    article.references.forEach((r) => console.log(`  - ${r}`));
    return;
  }

  console.log("[blog-generator] microCMS に draft で POST 中...");
  const id = await postToMicroCMS(article);
  console.log(`[blog-generator] 完了! microCMS の draft として登録: id=${id}`);
  console.log("→ microCMS 管理画面で校正してから publish してください");
}

main().catch((e) => {
  console.error("[blog-generator] エラー:", e);
  process.exit(1);
});
