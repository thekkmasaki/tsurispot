// IndexNow 送信エンドポイント。
// 【方針変更 2026-07-05】新規/更新ページの通知は「デプロイ時の sitemap 差分送信」
//（.github/workflows/deploy.yml の「IndexNow 差分送信」ステップ）へ移行した。
// かつて存在した全量ping（GET ?full=true で 7,000+URL を一括バッチ送信）は、
// Bing のバッチモード非推奨・未変更URL再送非推奨に反する上、無認証GETで誰でも誘発できたため廃止。
// ここに残すのは POST（指定URLの手動送信）のみ。
// 【2026-11】無認証で誰でも IndexNow 送信を誘発できた GET（重要ナビゲーションページ送信）は
// 呼び出し元が無い（workflows/scripts を確認済み）ため削除した。GET は 405 になる。
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
 * POST: 指定されたURLリストをIndexNowに送信
 * Body: { urls: string[] }
 */
export async function POST(request: NextRequest) {
  let body: { urls?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "不正なJSONです" }, { status: 400 });
  }
  const urls = body.urls as unknown[];

  if (!urls || !Array.isArray(urls) || urls.length === 0 || urls.length > 1000) {
    return NextResponse.json(
      { success: false, message: "urlsパラメータ（文字列配列）が必要です" },
      { status: 400 }
    );
  }

  // 自ドメイン(tsurispot.com)以外のURLは弾く（IndexNow送信枠の濫用防止・防御的検証）
  // startsWith では https://tsurispot.com.evil.example や https://tsurispot.com@evil.example を通してしまうためホスト名で判定
  const ownUrls = urls.filter((u): u is string => {
    if (typeof u !== "string") return false;
    try {
      const parsed = new URL(u);
      return parsed.protocol === "https:" && parsed.hostname === HOST && !parsed.username && !parsed.password;
    } catch {
      return false;
    }
  });
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
