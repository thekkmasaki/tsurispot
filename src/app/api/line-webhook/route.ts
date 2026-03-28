import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { createHmac } from "crypto";
import { prefectures } from "@/lib/data/prefectures";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";

interface LineShopMapping {
  shopSlug: string;
  token: string;
  shopName: string;
}

interface BaitStockEntry {
  name: string;
  available: boolean;
  status?: "available" | "low" | "out";
  price?: string;
  updatedAt?: string;
}

/** 署名検証 */
function verifySignature(body: string, signature: string): boolean {
  if (!CHANNEL_SECRET) return false;
  const hash = createHmac("SHA256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

/** LINEにリプライメッセージを送信（quickReply対応） */
async function replyMessage(
  replyToken: string,
  text: string,
  quickReplyItems?: Array<{ label: string; text: string }>
) {
  const message: Record<string, unknown> = { type: "text", text };
  if (quickReplyItems?.length) {
    message.quickReply = {
      items: quickReplyItems.map((item) => ({
        type: "action",
        action: { type: "message", label: item.label, text: item.text },
      })),
    };
  }
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [message],
    }),
  });
}

/** Redis: LINE userId → 店舗情報 */
async function getShopByLineUser(userId: string): Promise<LineShopMapping | null> {
  try {
    const data = await redis.get<LineShopMapping>(`line:${userId}`);
    return data ?? null;
  } catch {
    return null;
  }
}

/** 在庫ステータスアイコン */
function statusIcon(s: { available: boolean; status?: string }): string {
  if (s.status === "low") return "▲";
  if (s.status === "out" || !s.available) return "✕";
  return "●";
}

/** 特定店舗の餌在庫をRedisから取得 */
async function getShopBaitStock(shopSlug: string): Promise<BaitStockEntry[]> {
  try {
    const data = await redis.get<BaitStockEntry[]>(`baitstock:${shopSlug}`);
    return data ?? [];
  } catch {
    return [];
  }
}

/** 今月の釣りガイドURLを生成 */
function getCurrentMonthGuideUrl(): string {
  const month = new Date().getMonth() + 1;
  return `https://tsurispot.com/monthly/${month}`;
}

// ─── エリア記憶 ─────────────────────────────────────────────

/** ユーザーの釣りエリア（都道府県slug）を取得 */
async function getUserArea(userId: string): Promise<string | null> {
  try {
    return await redis.get<string>(`line:user:${userId}:area`);
  } catch {
    return null;
  }
}

/** ユーザーの釣りエリアを保存 */
async function setUserArea(userId: string, prefSlug: string): Promise<void> {
  try {
    await redis.set(`line:user:${userId}:area`, prefSlug);
  } catch {
    // ignore
  }
}

/** テキストから都道府県を検索（「東京」「東京都」「tokyo」など） */
function matchPrefecture(text: string): { slug: string; name: string } | null {
  const normalized = text.trim();
  for (const p of prefectures) {
    if (
      normalized === p.name ||
      normalized === p.nameShort ||
      normalized.toLowerCase() === p.slug
    ) {
      return { slug: p.slug, name: p.nameShort };
    }
  }
  return null;
}

// ─── 店舗オーナー向けメッセージハンドラ ─────────────────────────
async function handleShopOwnerMessage(
  replyToken: string,
  text: string,
  mapping: LineShopMapping
) {
  // 「更新」「餌」「エサ」「在庫」→ 更新URLを返す
  if (/更新|餌|エサ|えさ|在庫|bait/i.test(text)) {
    const updateUrl = `https://tsurispot.com/shops/update?shop=${mapping.shopSlug}&token=${mapping.token}`;
    await replyMessage(
      replyToken,
      `${mapping.shopName}さんの餌在庫更新ページはこちらです👇\n\n${updateUrl}`
    );
    return;
  }

  // 「確認」「状態」→ 現在の在庫を返す
  if (/確認|状態|チェック|check/i.test(text)) {
    try {
      const stock = await getShopBaitStock(mapping.shopSlug);
      if (stock.length === 0) {
        await replyMessage(replyToken, "現在の餌在庫情報はまだ登録されていません。\n「更新」と送って在庫を登録してください。");
      } else {
        const lines = stock.map(
          (s) => `${statusIcon(s)} ${s.name}${s.price ? ` ${s.price}` : ""}${s.updatedAt ? ` (${s.updatedAt})` : ""}`
        );
        await replyMessage(
          replyToken,
          `${mapping.shopName}の在庫状況:\n\n${lines.join("\n")}\n\n● 在庫あり ▲ 残りわずか ✕ 売り切れ`
        );
      }
    } catch {
      await replyMessage(replyToken, "在庫情報の取得に失敗しました。しばらくしてからお試しください。");
    }
    return;
  }

  // ヘルプ
  await replyMessage(
    replyToken,
    `【ツリスポ 釣具店サポート】\n\n「更新」→ 餌の在庫を更新\n「確認」→ 今の在庫状況を確認\n\nお困りの際はお問い合わせください。\nhttps://tsurispot.com/contact`
  );
}

// ─── 一般ユーザー向けメッセージハンドラ ─────────────────────────
async function handleGeneralUserMessage(replyToken: string, text: string, userId: string) {
  // 都道府県名にマッチ → エリアを記憶
  const prefMatch = matchPrefecture(text);
  if (prefMatch) {
    await setUserArea(userId, prefMatch.slug);
    await replyMessage(
      replyToken,
      [
        `📍 ${prefMatch.name}を登録しました！`,
        "",
        `今後「スポット」「今釣れる」と送ると、${prefMatch.name}の情報を優先してお届けします。`,
        "",
        "変更したい場合は、別の都道府県名を送ってください。",
      ].join("\n")
    );
    return;
  }

  // ユーザーのエリアを取得
  const userArea = await getUserArea(userId);
  const userPref = userArea ? prefectures.find((p) => p.slug === userArea) : null;

  // スポット・釣り場 → スポット検索ページ（エリア対応）
  if (/スポット|釣り場|釣りスポット|ポイント|spot|場所/i.test(text)) {
    const lines = [
      "━━━━━━━━━━━━━━",
      "📍 釣りスポット検索",
      "━━━━━━━━━━━━━━",
      "",
    ];
    if (userPref) {
      lines.push(
        `▼ ${userPref.nameShort}の釣りスポット`,
        `https://tsurispot.com/prefecture/${userPref.slug}`,
        ""
      );
    }
    lines.push(
      "▼ スポット一覧から探す",
      "https://tsurispot.com/spots",
      "",
      "▼ 現在地から近い順で探す",
      "https://tsurispot.com/fishing-spots/near-me",
      "",
      "▼ 地図から探す",
      "https://tsurispot.com/map"
    );
    await replyMessage(replyToken, lines.join("\n"));
    return;
  }

  // 今釣れる・旬・シーズン → 今月のガイド
  if (/今釣れる|旬|シーズン|時期|season|何が釣れる/i.test(text)) {
    const month = new Date().getMonth() + 1;
    const lines = [
      "━━━━━━━━━━━━━━",
      `🐟 ${month}月に釣れる魚`,
      "━━━━━━━━━━━━━━",
      "",
    ];
    if (userPref) {
      lines.push(
        `▼ ${userPref.nameShort}の釣りスポット`,
        `https://tsurispot.com/prefecture/${userPref.slug}`,
        ""
      );
    }
    lines.push(
      `▼ ${month}月の釣りガイド`,
      getCurrentMonthGuideUrl(),
      "",
      "▼ 今釣れる魚の一覧",
      "https://tsurispot.com/catchable-now"
    );
    await replyMessage(replyToken, lines.join("\n"));
    return;
  }

  // 初心者・始め方 → 初心者ガイド
  if (/初心者|始め方|入門|ビギナー|beginner|始めたい/i.test(text)) {
    await replyMessage(
      replyToken,
      [
        "━━━━━━━━━━━━━━",
        "📖 釣り初心者ガイド",
        "━━━━━━━━━━━━━━",
        "",
        "▼ まずはここから！初心者ガイド",
        "https://tsurispot.com/guide/beginner",
        "",
        "▼ 持ち物チェックリスト",
        "https://tsurispot.com/beginner-checklist",
        "",
        "▼ 道具の選び方",
        "https://tsurispot.com/gear",
      ].join("\n")
    );
    return;
  }

  // 釣果・週報 → 最新の釣果週報
  if (/釣果|週報|釣れた|レポート|report/i.test(text)) {
    await replyMessage(
      replyToken,
      [
        "━━━━━━━━━━━━━━",
        "📊 最新の釣果情報",
        "━━━━━━━━━━━━━━",
        "",
        "▼ 釣果週報・釣行レポート",
        "https://tsurispot.com/blog",
        "",
        "毎週エリア別の釣果情報を",
        "更新しています！",
      ].join("\n")
    );
    return;
  }

  // 釣り方別の道具レコメンド
  const methodGear: Record<string, { name: string; guide: string; items: string[] }> = {
    サビキ: {
      name: "サビキ釣り",
      guide: "https://tsurispot.com/guide/sabiki",
      items: [
        "🔸 ロッド（万能竿 2-3m）",
        "  https://amzn.to/4s4i64m",
        "🔸 リール（2000-2500番）",
        "  https://amzn.to/4atW7Om",
        "🔸 コマセ（アミ姫）",
        "  https://amzn.to/4c6gaUn",
        "🔸 おもりセット",
        "  https://amzn.to/4cFGDbl",
      ],
    },
    ちょい投げ: {
      name: "ちょい投げ釣り",
      guide: "https://tsurispot.com/guide/choinage",
      items: [
        "🔸 ロッド（投げ竿 2.4-3m）",
        "  https://amzn.to/4s4i64m",
        "🔸 リール（2500-3000番）",
        "  https://amzn.to/4atW7Om",
        "🔸 ジェット天秤",
        "  https://amzn.to/4l7BnQg",
        "🔸 ナイロンライン（道糸）",
        "  https://amzn.to/4s1SPaX",
      ],
    },
    ウキ: {
      name: "ウキ釣り",
      guide: "https://tsurispot.com/guide/float-fishing",
      items: [
        "🔸 ロッド（磯竿 3-4m）",
        "  https://amzn.to/4s4i64m",
        "🔸 リール（2500番）",
        "  https://amzn.to/4atW7Om",
        "🔸 ハリス",
        "  https://amzn.to/408jI1f",
        "🔸 ナイロンライン（道糸）",
        "  https://amzn.to/4s1SPaX",
      ],
    },
    ルアー: {
      name: "ルアー釣り",
      guide: "https://tsurispot.com/guide/lure",
      items: [
        "🔸 ロッド（ルアーロッド）",
        "  https://amzn.to/4s4i64m",
        "🔸 リール（2500-3000番）",
        "  https://amzn.to/4atW7Om",
        "🔸 PEライン（道糸）",
        "  https://amzn.to/4s45H0i",
        "🔸 フロロリーダー",
        "  https://amzn.to/4tKXyzu",
      ],
    },
    エギング: {
      name: "エギング",
      guide: "https://tsurispot.com/guide/eging",
      items: [
        "🔸 ロッド（エギングロッド）",
        "  https://amzn.to/4s4i64m",
        "🔸 リール（2500番）",
        "  https://amzn.to/4atW7Om",
        "🔸 エギ10本セット",
        "  https://amzn.to/3Nc9r10",
        "🔸 PEライン（道糸）",
        "  https://amzn.to/4s45H0i",
      ],
    },
    ジギング: {
      name: "ショアジギング",
      guide: "https://tsurispot.com/guide/jigging",
      items: [
        "🔸 ロッド（ジギングロッド）",
        "  https://amzn.to/4s4i64m",
        "🔸 リール（3000-4000番）",
        "  https://amzn.to/4atW7Om",
        "🔸 PEライン（道糸）",
        "  https://amzn.to/4s45H0i",
        "🔸 スナップ",
        "  https://amzn.to/4c9oMcU",
      ],
    },
    穴釣り: {
      name: "穴釣り",
      guide: "https://tsurispot.com/guide/anazuri",
      items: [
        "🔸 ロッド（短竿 1-1.5m）",
        "  https://amzn.to/4s4i64m",
        "🔸 リール（小型1000番）",
        "  https://amzn.to/4atW7Om",
        "🔸 おもりセット",
        "  https://amzn.to/4cFGDbl",
        "🔸 ナイロンライン",
        "  https://amzn.to/4s1SPaX",
      ],
    },
    カゴ釣り: {
      name: "遠投カゴ釣り",
      guide: "https://tsurispot.com/guide/entou-kago",
      items: [
        "🔸 ロッド（遠投磯竿 4-5m）",
        "  https://amzn.to/4s4i64m",
        "🔸 リール（3000-4000番）",
        "  https://amzn.to/4atW7Om",
        "🔸 PEライン（道糸）",
        "  https://amzn.to/4s45H0i",
        "🔸 ハリス",
        "  https://amzn.to/408jI1f",
      ],
    },
    泳がせ: {
      name: "泳がせ釣り",
      guide: "https://tsurispot.com/guide/oyogase",
      items: [
        "🔸 ロッド（磯竿 3-4m）",
        "  https://amzn.to/4s4i64m",
        "🔸 リール（3000-4000番）",
        "  https://amzn.to/4atW7Om",
        "🔸 ハリス（太め）",
        "  https://amzn.to/408jI1f",
        "🔸 スナップ",
        "  https://amzn.to/4c9oMcU",
      ],
    },
  };

  // 釣り方名にマッチ → 道具レコメンド
  const matchedMethod = Object.entries(methodGear).find(([key]) => text.includes(key));
  if (matchedMethod && /道具|タックル|装備|おすすめ|ギア/i.test(text)) {
    const [, method] = matchedMethod;
    await replyMessage(
      replyToken,
      [
        "━━━━━━━━━━━━━━",
        `🎣 ${method.name}のおすすめ道具`,
        "━━━━━━━━━━━━━━",
        "",
        ...method.items,
        "",
        `▼ ${method.name}の詳しいガイド`,
        method.guide,
      ].join("\n"),
      [
        { label: "サビキ", text: "サビキの道具" },
        { label: "ちょい投げ", text: "ちょい投げの道具" },
        { label: "ルアー", text: "ルアーの道具" },
        { label: "エギング", text: "エギングの道具" },
      ]
    );
    return;
  }

  // 道具・おすすめ → 釣り方選択（クイックリプライ付き）
  if (/道具|おすすめ|タックル|ロッド|リール|gear|装備/i.test(text)) {
    await replyMessage(
      replyToken,
      [
        "━━━━━━━━━━━━━━",
        "🎣 おすすめ釣り道具",
        "━━━━━━━━━━━━━━",
        "",
        "▼ 編集長厳選の釣り道具",
        "https://tsurispot.com/gear",
        "",
        "▼ 釣り方別の道具ガイド",
        "https://tsurispot.com/guide",
        "",
        "━━━━━━━━━━━━━━",
        "↓ 釣り方をタップすると",
        "おすすめ道具を表示します",
      ].join("\n"),
      [
        { label: "サビキ釣り", text: "サビキの道具" },
        { label: "ちょい投げ", text: "ちょい投げの道具" },
        { label: "ウキ釣り", text: "ウキの道具" },
        { label: "ルアー釣り", text: "ルアーの道具" },
        { label: "エギング", text: "エギングの道具" },
        { label: "ジギング", text: "ジギングの道具" },
        { label: "穴釣り", text: "穴釣りの道具" },
        { label: "カゴ釣り", text: "カゴ釣りの道具" },
        { label: "泳がせ釣り", text: "泳がせの道具" },
      ]
    );
    return;
  }

  // 診断・何釣る → 診断ページ
  if (/診断|何釣|どこ釣|クイズ|quiz|finder/i.test(text)) {
    await replyMessage(
      replyToken,
      [
        "━━━━━━━━━━━━━━",
        "🔍 あなたにぴったりの釣り",
        "━━━━━━━━━━━━━━",
        "",
        "▼ 釣り場診断（何を釣る？）",
        "https://tsurispot.com/fish-finder",
        "",
        "▼ 釣りスタイル診断",
        "https://tsurispot.com/quiz",
        "",
        "▼ ボウズ確率チェッカー",
        "https://tsurispot.com/bouzu-checker",
      ].join("\n")
    );
    return;
  }

  // 潮・天気・カレンダー → 釣りカレンダー
  if (/天気|潮|潮汐|タイド|カレンダー|いつ行く/i.test(text)) {
    await replyMessage(
      replyToken,
      [
        "━━━━━━━━━━━━━━",
        "📅 釣りカレンダー",
        "━━━━━━━━━━━━━━",
        "",
        "▼ 潮汐・ベストタイミング",
        "https://tsurispot.com/fishing-calendar",
        "",
        "潮の動きをチェックして",
        "釣果アップを狙おう！",
      ].join("\n")
    );
    return;
  }

  // 使い方・ヘルプ → メニュー一覧
  if (/使い方|ヘルプ|help|メニュー|menu/i.test(text)) {
    const areaInfoHelp = userPref ? `\n📍 マイエリア: ${userPref.nameShort}` : "";
    await replyMessage(
      replyToken,
      [
        "━━━━━━━━━━━━━━",
        "🎣 ツリスポ LINE",
        "━━━━━━━━━━━━━━",
        "",
        "キーワードを送ってね👇",
        "",
        "📍「スポット」",
        "　→ 釣り場を探す",
        "",
        "🐟「今釣れる」",
        "　→ 今月釣れる魚",
        "",
        "📖「初心者」",
        "　→ 始め方ガイド",
        "",
        "📊「釣果」",
        "　→ 最新の釣果週報",
        "",
        "🎣「道具」",
        "　→ おすすめタックル",
        "",
        "🔍「診断」",
        "　→ あなたに合う釣りは？",
        "",
        "📅「潮」",
        "　→ 釣りカレンダー",
        "",
        "都道府県名を送ると",
        "マイエリアを登録できます",
        areaInfoHelp,
        "",
        "━━━━━━━━━━━━━━",
        "https://tsurispot.com",
      ].join("\n")
    );
    return;
  }

  // エリア変更・設定 → エリア案内
  if (/エリア|地域|変更|設定/i.test(text)) {
    const currentArea = userPref ? `現在の登録: ${userPref.nameShort}` : "まだ登録されていません";
    await replyMessage(
      replyToken,
      [
        "━━━━━━━━━━━━━━",
        "📍 マイエリア設定",
        "━━━━━━━━━━━━━━",
        "",
        currentArea,
        "",
        "都道府県名を送ると、",
        "よく釣りするエリアを登録できます。",
        "",
        "例: 「神奈川」「大阪」「北海道」",
      ].join("\n")
    );
    return;
  }

  // ヘルプ（デフォルト）
  const areaInfo = userPref ? `\n📍 マイエリア: ${userPref.nameShort}` : "";
  await replyMessage(
    replyToken,
    [
      "━━━━━━━━━━━━━━",
      "🎣 ツリスポ LINE",
      "━━━━━━━━━━━━━━",
      "",
      "キーワードを送ってね👇",
      "",
      "📍「スポット」",
      "　→ 釣り場を探す",
      "",
      "🐟「今釣れる」",
      "　→ 今月釣れる魚",
      "",
      "📖「初心者」",
      "　→ 始め方ガイド",
      "",
      "📊「釣果」",
      "　→ 最新の釣果週報",
      "",
      "🎣「道具」",
      "　→ おすすめタックル",
      "",
      "🔍「診断」",
      "　→ あなたに合う釣りは？",
      "",
      "📅「潮」",
      "　→ 釣りカレンダー",
      "",
      "都道府県名を送ると",
      "マイエリアを登録できます",
      areaInfo,
      "",
      "━━━━━━━━━━━━━━",
      "https://tsurispot.com",
    ].join("\n")
  );
}

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  const signature = request.headers.get("x-line-signature") ?? "";

  // 署名検証
  if (!verifySignature(bodyText, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  const body = JSON.parse(bodyText);
  const events = body.events ?? [];

  for (const event of events) {
    // フォローイベント（友だち追加時）
    if (event.type === "follow") {
      const userId = event.source?.userId;
      if (userId && event.replyToken) {
        const mapping = await getShopByLineUser(userId);
        if (mapping) {
          await replyMessage(
            event.replyToken,
            `${mapping.shopName}さん、ツリスポ釣具店サポートへようこそ！\n\n「更新」と送ると、餌の在庫更新ページを開けます。`
          );
        } else {
          await replyMessage(
            event.replyToken,
            [
              "━━━━━━━━━━━━━━",
              "🎣 ツリスポへようこそ！",
              "━━━━━━━━━━━━━━",
              "",
              "友だち追加ありがとうございます！",
              "",
              "まず、よく釣りするエリアを",
              "教えてください👇",
              "（都道府県名を送ってね）",
              "",
              "例: 「神奈川」「大阪」「北海道」",
              "",
              "━━━━━━━━━━━━━━",
              "",
              "キーワードで釣り情報も検索👇",
              "📍「スポット」🐟「今釣れる」",
              "📖「初心者」📊「釣果」",
              "🎣「道具」🔍「診断」📅「潮」",
              "",
              "━━━━━━━━━━━━━━",
              "https://tsurispot.com",
            ].join("\n")
          );
        }
      }
      continue;
    }

    // テキストメッセージ
    if (event.type === "message" && event.message?.type === "text") {
      const userId = event.source?.userId;
      const text = (event.message.text ?? "").trim();
      const replyToken = event.replyToken;

      if (!userId || !replyToken) continue;

      const mapping = await getShopByLineUser(userId);

      if (mapping) {
        await handleShopOwnerMessage(replyToken, text, mapping);
      } else {
        await handleGeneralUserMessage(replyToken, text, userId);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
