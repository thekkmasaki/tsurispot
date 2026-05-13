#!/usr/bin/env node
/**
 * 店舗管理画面アクセス用 token を発行し DynamoDB に保存する。
 *
 * Usage:
 *   node scripts/admin/generate-shop-token.mjs <shopSlug>
 *   node scripts/admin/generate-shop-token.mjs <shopSlug> --force   # 既存上書き
 *
 * 例:
 *   node scripts/admin/generate-shop-token.mjs barbless
 *
 * 必要環境:
 *   - ~/.aws/credentials が ap-northeast-1 へアクセス可能（DynamoDB: tsurispot テーブル）
 *
 * 出力:
 *   - 管理画面 URL（店舗主に共有するもの）
 *   - 有料プラン申込画面 URL
 *   - 店舗主への案内メール例文
 */

import { randomBytes } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE = "tsurispot";
const REGION = "ap-northeast-1";
const BASE_URL = process.env.BASE_URL ?? "https://tsurispot.com";

const args = process.argv.slice(2);
const shopSlug = args.find((a) => !a.startsWith("--"));
const force = args.includes("--force");

if (!shopSlug) {
  console.error(
    "Usage: node scripts/admin/generate-shop-token.mjs <shopSlug> [--force]",
  );
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(shopSlug)) {
  console.error(
    `Error: shopSlug は英小文字・数字・ハイフンのみ。受領: ${shopSlug}`,
  );
  process.exit(1);
}

const client = new DynamoDBClient({ region: REGION });
const doc = DynamoDBDocumentClient.from(client);

const pk = `SHOP#${shopSlug}`;
const sk = "TOKEN";

const existing = await doc.send(
  new GetCommand({ TableName: TABLE, Key: { pk, sk } }),
);

if (existing.Item && !force) {
  console.error(
    `Error: ${shopSlug} には既に token があります。上書きする場合は --force を付けてください。`,
  );
  const masked = String(existing.Item.data ?? "").slice(0, 8);
  console.error(`既存 token (先頭8桁): ${masked}…`);
  process.exit(1);
}

const token = randomBytes(32).toString("hex");

await doc.send(
  new PutCommand({
    TableName: TABLE,
    Item: { pk, sk, data: token },
  }),
);

const dashboardUrl = `${BASE_URL}/shops/${shopSlug}/dashboard?token=${token}`;
const subscribeUrl = `${BASE_URL}/subscribe/basic?shop=${shopSlug}&token=${token}`;

const bar = "=".repeat(64);

console.log("");
console.log(bar);
console.log(`✓ Token 発行完了: ${shopSlug}${force ? " (上書き)" : ""}`);
console.log(bar);
console.log("");
console.log("【管理画面 URL】(店舗主に共有 / 第三者には絶対に渡さない)");
console.log(dashboardUrl);
console.log("");
console.log("【有料プラン申込画面 URL】");
console.log(subscribeUrl);
console.log("");
console.log(bar);
console.log("【店舗主への案内メール例】");
console.log(bar);
console.log(
  `
〇〇 様

このたびはツリスポへの掲載お申込みをいただき、誠にありがとうございます。
店舗管理画面のアクセス URL をお送りいたします。

▼ 店舗管理画面 URL
${dashboardUrl}

  ・エサ在庫の登録・更新
  ・店舗写真や紹介文の管理
  ・有料プラン (公式バッジ / 検索優先表示など) の申込・管理

※ この URL は管理用の重要なリンクです。第三者と共有しないようご注意ください。
※ ブラウザのブックマーク登録をおすすめいたします。

ご不明な点がございましたら、本メールにご返信ください。

──
ツリスポ運営事務局
https://tsurispot.com
`.trim(),
);
console.log("");
