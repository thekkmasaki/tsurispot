// Weekly report poster for microCMS + LINE Push配信
// Usage: node scripts/post-weekly-report.mjs <json-file>
//
// 環境変数:
//   LINE_CHANNEL_ACCESS_TOKEN — LINE Push API用
//   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN — Redis接続用

import { readFileSync } from 'fs';
import { resolve, basename } from 'path';

const API_KEY = 'pd3VA0nt4yNInv3uBWbFxymzliuaDr4hF20v';
const ENDPOINT = 'https://tsurispot.microcms.io/api/v1/blogs';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// 都道府県slug → 週報エリアslug
const PREF_TO_AREA = {
  hokkaido: 'otaru-ishikari',
  miyagi: 'sendai-ishinomaki',
  tokyo: 'tokyobay',
  chiba: 'tokyobay',
  kanagawa: 'tokyobay',
  shizuoka: 'suruga-izu',
  aichi: 'chita-mikawa',
  osaka: 'osaka-sennan',
  hyogo: 'akashi-kobe',
  wakayama: 'nanki-shirahama',
  hiroshima: 'setouchi-hiroshima',
  fukuoka: 'fukuoka-kitakyushu',
};

// ─── Redis helpers ───

async function redisCommand(command) {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  const res = await fetch(`${REDIS_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  const json = await res.json();
  return json.result;
}

async function redisGet(key) {
  return redisCommand(['GET', key]);
}

async function redisSet(key, value) {
  return redisCommand(['SET', key, value]);
}

async function redisSmembers(key) {
  return redisCommand(['SMEMBERS', key]);
}

async function redisIncrby(key, n) {
  return redisCommand(['INCRBY', key, String(n)]);
}

// ─── LINE Push ───

async function pushMessage(userId, text) {
  if (!LINE_TOKEN) return;
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LINE_TOKEN}`,
    },
    body: JSON.stringify({ to: userId, messages: [{ type: 'text', text }] }),
  });
  if (!res.ok) {
    console.error(`Push failed for ${userId}: ${res.status}`);
  }
}

// ─── メイン ───

async function postArticle(filePath) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  const body = JSON.stringify({
    title: data.title,
    content: data.content,
    slug: data.slug,
    description: data.description,
    tags: data.tags,
  });

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MICROCMS-API-KEY': API_KEY,
    },
    body,
  });

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);

  if (res.status >= 300) {
    console.error('microCMS投稿失敗、Push配信をスキップ');
    return;
  }

  // ─── Redis & LINE Push配信 ───

  if (!REDIS_URL || !REDIS_TOKEN) {
    console.log('Redis環境変数なし、Push配信スキップ');
    return;
  }

  // ファイル名からエリアslug推定（例: weekly-tokyobay-20260328.json → tokyobay）
  const fileName = basename(filePath, '.json');
  const areaMatch = fileName.match(/weekly-([a-z-]+?)(?:-\d|$)/);
  const areaSlug = areaMatch ? areaMatch[1] : null;

  if (!areaSlug) {
    console.log(`エリアslug抽出不可: ${fileName}、Push配信スキップ`);
    return;
  }

  // 最新週報メタデータをRedisに保存
  const meta = JSON.stringify({
    title: data.title,
    slug: data.slug,
    description: data.description || '',
  });
  await redisSet(`line:push:latest:${areaSlug}`, meta);
  console.log(`Redis保存: line:push:latest:${areaSlug}`);

  // LINE Push配信
  if (!LINE_TOKEN) {
    console.log('LINE_CHANNEL_ACCESS_TOKEN なし、Push配信スキップ');
    return;
  }

  // 月間カウント確認
  const now = new Date();
  const monthKey = `line:push:count:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentCount = parseInt(await redisGet(monthKey) || '0', 10);

  // opt-in全ユーザー取得
  const subscribers = await redisSmembers('line:push:subscribers');
  if (!subscribers || subscribers.length === 0) {
    console.log('Push購読者なし');
    return;
  }

  // 対象エリアのユーザー絞り込み
  const targetUsers = [];
  for (const userId of subscribers) {
    const userPref = await redisGet(`line:user:${userId}:area`);
    if (userPref && PREF_TO_AREA[userPref] === areaSlug) {
      targetUsers.push(userId);
    }
  }

  if (targetUsers.length === 0) {
    console.log(`エリア ${areaSlug} の購読者なし`);
    return;
  }

  // フリープラン上限チェック（月200通）
  const remaining = 200 - currentCount;
  if (remaining <= 0) {
    console.log(`月間配信上限到達 (${currentCount}/200)、Push配信スキップ`);
    return;
  }

  const sendCount = Math.min(targetUsers.length, remaining);
  const usersToSend = targetUsers.slice(0, sendCount);

  const pushTitle = data.title.replace(/【釣果週報】\s*/, '');
  const message = [
    '━━━━━━━━━━━━━━',
    `📊 ${pushTitle}`,
    '━━━━━━━━━━━━━━',
    '',
    data.description || '',
    '',
    '▼ 詳しくはこちら',
    `https://tsurispot.com/blog/${data.slug}`,
    '',
    '配信停止は「配信停止」と送信',
  ].join('\n');

  console.log(`Push配信開始: ${usersToSend.length}名 (エリア: ${areaSlug})`);

  let sent = 0;
  for (const userId of usersToSend) {
    await pushMessage(userId, message);
    sent++;
  }

  // カウント更新
  await redisIncrby(monthKey, sent);
  console.log(`Push配信完了: ${sent}通 (月間: ${currentCount + sent}/200)`);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/post-weekly-report.mjs <json-file>');
  process.exit(1);
}

postArticle(resolve(filePath)).catch(console.error);
