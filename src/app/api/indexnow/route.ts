// IndexNow 送信エンドポイント。
// 【方針変更 2026-07-05】新規/更新ページの通知は「デプロイ時の sitemap 差分送信」
//（.github/workflows/deploy.yml の「IndexNow 差分送信」ステップ）へ移行した。
// かつて存在した全量ping（GET ?full=true で 7,000+URL を一括バッチ送信）は、
// Bing のバッチモード非推奨・未変更URL再送非推奨に反する上、無認証GETで誰でも誘発できたため廃止。
// ここに残すのは GET（重要ナビゲーションページのみ・手動/補助用）と POST（指定URLの手動送信）のみ。
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// IndexNow APIキー（public/{key}.txt に配置済み）
const INDEXNOW_KEY = "03845770c729578716b88beda009b743";
const HOST = "tsurispot.com";
const BASE_URL = `https://${HOST}`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// POST で複数URLをバッチ送信する場合に備えて実行時間上限を引き上げる
export const maxDuration = 60;

/**
 * IndexNow APIにURLリストを送信する
 * 500件ずつバッチに分割して送信
 */
async function submitToIndexNow(urlList: string[]): Promise<{ submitted: number; batches: number; status: number[] }> {
  const BATCH_SIZE = 500;
  const statuses: number[] = [];
  let batches = 0;

  for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
    const batch = urlList.slice(i, i + BATCH_SIZE);
    batches++;

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: batch,
      }),
    });

    statuses.push(response.status);

    // バッチ間に1秒待機（レートリミット対策）
    if (i + BATCH_SIZE < urlList.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { submitted: urlList.length, batches, status: statuses };
}

/**
 * 重要ページのみを収集（デプロイ時のデフォルト送信用）
 * Bingの推奨: Batch Modeの過度な使用を避ける
 */
function collectImportantUrls(): string[] {
  const urls: string[] = [];

  // トップページ・主要ナビゲーションページのみ
  const importantPages = [
    "", "/spots", "/fish", "/map", "/catchable-now", "/ranking",
    "/fishing-calendar", "/for-beginners", "/fishing",
    "/guide", "/gear", "/methods", "/glossary", "/seasonal",
    "/fishing-rules", "/faq", "/shops", "/blog", "/area-guide",
    "/monthly", "/prefecture", "/area",
  ];
  for (const page of importantPages) {
    urls.push(`${BASE_URL}${page}`);
  }

  return urls;
}

/**
 * GET: 重要ナビゲーションページのみIndexNowに送信（手動/補助用）。
 * 全URL送信（旧 ?full=true）は廃止。新規/更新ページの通知はデプロイ時の差分送信が担う。
 */
export async function GET() {
  const urls = collectImportantUrls();
  const result = await submitToIndexNow(urls);

  return NextResponse.json({
    success: true,
    message: `IndexNowに${result.submitted}件の重要ページを送信しました`,
    ...result,
  });
}

/**
 * POST: 指定されたURLリストをIndexNowに送信
 * Body: { urls: string[] }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const urls: string[] = body.urls;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { success: false, message: "urlsパラメータ（文字列配列）が必要です" },
      { status: 400 }
    );
  }

  // 自ドメイン(tsurispot.com)以外のURLは弾く（IndexNow送信枠の濫用防止・防御的検証）
  const ownUrls = urls.filter((u) => typeof u === "string" && u.startsWith(BASE_URL));
  if (ownUrls.length === 0) {
    return NextResponse.json(
      { success: false, message: "送信できるのは自サイト(tsurispot.com)のURLのみです" },
      { status: 400 }
    );
  }

  // レート制限（IndexNow送信枠・関数実行時間の浪費防止）: 1IP 10分間に 10 回まで
  if (!(await checkRateLimit(getClientIp(request), "INDEXNOW", 10, 600))) {
    return NextResponse.json(
      { success: false, message: "送信回数の上限に達しました。しばらくしてからお試しください。" },
      { status: 429 }
    );
  }

  const result = await submitToIndexNow(ownUrls);

  return NextResponse.json({
    success: true,
    message: `IndexNowに${result.submitted}件のURLを送信しました（${result.batches}バッチ）`,
    ...result,
  });
}
