import { redis } from "@/lib/redis";

/**
 * お問い合わせ・店舗掲載申請を GAS（スプレッドシート＋メール通知）へ送る共通処理。
 *
 * 2026-11-13 判明: 本番で動いている GAS は古い版で type 分岐が無く、
 * お問い合わせ等を「中身が空の釣果報告（不明 @ 不明）」としてメールしていた。
 * GAS の再デプロイを待たずに読める通知にするため、旧 GAS が読む釣果報告の項目
 * （spotName / fishName / userName / comment）にも要約を詰めて送る。
 * 新しい GAS（type 分岐あり）は type と元の項目を使うので影響しない。
 *
 * あわせて Redis に控えを残し、GAS 側で取りこぼしても内容が消えないようにする。
 */

export type InboxType = "contact" | "shop_listing" | "paid_inquiry_basic" | "paid_inquiry_pro";

const LABELS: Record<InboxType, string> = {
  contact: "【お問い合わせ】",
  shop_listing: "【店舗掲載申請】",
  paid_inquiry_basic: "【ベーシック問い合わせ】",
  paid_inquiry_pro: "【プロ問い合わせ】",
};

const INBOX_KEY = "inbox:forms";
const INBOX_MAX = 1000;

export interface InboxPayload {
  type: InboxType;
  /** 旧 GAS の「釣った魚」欄に出す短い要約（店名・カテゴリ等） */
  summary: string;
  /** 送り主の名前（旧 GAS の「ユーザー」欄） */
  senderName: string;
  /** 項目名つきの本文（旧 GAS の「コメント」欄） */
  details: [label: string, value: string][];
  /** GAS へそのまま渡す元の項目 */
  fields: Record<string, string>;
}

/**
 * GAS 側の共有キー照合用フィールド。GAS_SHARED_KEY が設定されていれば { k } を返す（未設定なら空）。
 * GAS の Script Property SHARED_KEY と一致しない POST は GAS 側で拒否される。
 * GAS_CATCH_REPORT_URL へ POST する全箇所で body に展開すること。
 */
export function gasAuthField(): { k?: string } {
  const k = process.env.GAS_SHARED_KEY;
  return k ? { k } : {};
}

export function buildGasBody(p: InboxPayload): Record<string, string> {
  const comment = p.details
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return {
    ...p.fields,
    type: p.type,
    // ↓旧 GAS（釣果報告扱い）向けの互換項目
    spotName: LABELS[p.type],
    fishName: p.summary || LABELS[p.type],
    userName: p.senderName,
    comment,
    date: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10),
    ...gasAuthField(),
  };
}

/** Redis に控えを残す（失敗しても送信自体は止めない） */
async function saveCopy(p: InboxPayload): Promise<void> {
  try {
    await redis.lpush(
      INBOX_KEY,
      JSON.stringify({ at: new Date().toISOString(), type: p.type, fields: p.fields }),
    );
    await redis.ltrim(INBOX_KEY, 0, INBOX_MAX - 1);
  } catch (err) {
    console.error("[inbox] Redis 保存エラー:", err);
  }
}

/**
 * GAS へ送信し、控えを保存する。GAS への送信に失敗したら throw する
 * （呼び出し側で 502 を返すかどうかを決める）。
 */
export async function sendToInbox(gasUrl: string, p: InboxPayload): Promise<void> {
  await saveCopy(p);
  await fetch(gasUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildGasBody(p)),
    redirect: "follow",
  });
}
