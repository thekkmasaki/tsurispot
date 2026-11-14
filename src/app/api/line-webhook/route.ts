import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { createHmac } from "crypto";
import { prefectures } from "@/lib/data/prefectures";
import { safeEqual } from "@/lib/safe-compare";
import { fishSpecies } from "@/lib/data/fish";
import { getLatestWeeklyCatches, type LatestWeeklyCatch } from "@/lib/data/weekly-report-latest";
import {
  buildChoukaFlex,
  nearestReachableArea,
  REACH_KM,
  type LineOrigin,
  buildChoukaReplyText,
  buildFishFlex,
  buildFishReplyText,
  type LineFlexReply,
  findFishInText,
  weeklyAreaForPrefecture,
} from "@/lib/line/chouka-reply";
import { buildGearFlex, buildGearMenuFlex, buildGearMenuText, buildGearReplyText, findGearMethod } from "@/lib/line/gear-reply";
import { buildNearbyFlex, buildNearbyText, nearestSpots, type CoordSpot } from "@/lib/line/nearby-reply";
import {
  LOCATION_LABEL,
  UNKNOWN_QUICK,
  buildHelpFlex,
  buildHelpText,
  buildSpotsFlex,
  buildSpotsText,
  buildUnknownText,
  buildWelcomeFlex,
  buildWelcomeText,
} from "@/lib/line/menu-reply";
import { SITE, lineUrl } from "@/lib/line/line-url";

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
  return safeEqual(hash, signature);
}

/** 候補ボタン（タップで文字を送る）。askLocation を渡すと先頭に「位置情報を送る」ボタン（スマホのみ表示） */
function quickReplyOf(texts: string[], askLocation?: string) {
  const items = [
    ...(askLocation ? [{ type: "action", action: { type: "location", label: askLocation.slice(0, 20) } }] : []),
    ...texts.map((t) => ({ type: "action", action: { type: "message", label: t.slice(0, 20), text: t } })),
  ].slice(0, 13);
  return items.length ? { items } : undefined;
}

async function postReply(replyToken: string, message: Record<string, unknown>): Promise<Response | null> {
  return fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages: [message] }),
  }).catch((e) => {
    console.error("[line-webhook] 返信の送信に失敗", e);
    return null;
  });
}

/** LINEにリプライメッセージを送信（quickReply対応）。失敗はログに残す（以前は黙って捨てていた） */
async function replyMessage(
  replyToken: string,
  text: string,
  quickReplyItems?: Array<{ label: string; text: string }>,
  askLocation?: string,
) {
  const quickReply = quickReplyOf(quickReplyItems?.map((i) => i.text) ?? [], askLocation);
  const res = await postReply(replyToken, { type: "text", text: text.slice(0, 5000), ...(quickReply && { quickReply }) });
  if (res && !res.ok) console.error("[line-webhook] テキスト返信失敗", res.status, await res.text().catch(() => ""));
}

/**
 * カード（Flex Message）で返信。LINE に弾かれたら（形式エラー等）同じ replyToken でテキスト版を返す
 * （400 で拒否された replyToken は未使用のまま再利用できる）
 */
async function replyFlex(replyToken: string, flex: LineFlexReply, fallbackText: string) {
  const quickReply = quickReplyOf(flex.quickReply, flex.askLocation);
  const res = await postReply(replyToken, {
    type: "flex",
    altText: flex.altText.slice(0, 400),
    contents: flex.contents,
    ...(quickReply && { quickReply }),
  });
  if (res?.ok) return;
  console.error("[line-webhook] Flex返信失敗→テキストで再送", res?.status, await res?.text().catch(() => ""));
  await replyMessage(replyToken, fallbackText, flex.quickReply.map((t) => ({ label: t.slice(0, 20), text: t })), flex.askLocation);
}

// ─── 近くの釣り場（位置情報） ─────────────────────────────────
/**
 * 全スポットの座標。スポット本体（TS 18MB）は import せず、CDN 配信の軽量 API を1日キャッシュして使う。
 * 取れないときは空（カードは「読み込めませんでした」＋地図リンク）。
 */
let coordCache: { at: number; spots: CoordSpot[] } | null = null;
async function loadCoordSpots(): Promise<CoordSpot[]> {
  if (coordCache && Date.now() - coordCache.at < 24 * 3600_000) return coordCache.spots;
  try {
    const res = await fetch(`${SITE}/api/spots/coords`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const spots = (await res.json()) as CoordSpot[];
    coordCache = { at: Date.now(), spots };
    return spots;
  } catch (e) {
    console.error("[line-webhook] スポット座標の取得に失敗", e);
    return coordCache?.spots ?? [];
  }
}

async function handleLocationMessage(replyToken: string, userId: string, lat: number, lng: number) {
  // 以後の「釣果」「魚の名前」を行ける範囲に絞るために、現在地を約1kmに丸めて保存
  await setUserOrigin(userId, { lat, lng });
  const list = nearestSpots(await loadCoordSpots(), lat, lng);
  // マイエリア未登録なら、いちばん近い釣り場の都道府県で自動登録（50km 以内のときだけ）
  let areaNote: string | undefined;
  const near = list[0];
  const pref = near && near.km <= 50 ? prefectures.find((p) => p.name === near.spot.p) : undefined;
  const quick: string[] = [];
  if (pref) {
    const current = await getUserArea(userId);
    if (!current) {
      await setUserArea(userId, pref.slug);
      areaNote = `📍 マイエリアを「${pref.nameShort}」に登録しました`;
    } else if (current !== pref.slug) {
      quick.push(pref.nameShort); // タップでマイエリアを変更
    }
  }
  const note = [areaNote, `🚗 これから「釣果」や魚の名前を送ると、ここから${REACH_KM}km以内の釣果に絞ってお返しします`].filter(Boolean).join("\n");
  const flex = buildNearbyFlex(list, note);
  flex.quickReply = [...quick, ...flex.quickReply];
  await replyFlex(replyToken, flex, buildNearbyText(list, note));
}

/** DynamoDB: LINE userId → 店舗情報 */
async function getShopByLineUser(userId: string): Promise<LineShopMapping | null> {
  try {
    const data = await dbGet<LineShopMapping>(`LINE#${userId}`, "SHOPMAPPING");
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

/** 特定店舗の餌在庫をDynamoDBから取得 */
async function getShopBaitStock(shopSlug: string): Promise<BaitStockEntry[]> {
  try {
    const data = await dbGet<BaitStockEntry[]>(`SHOP#${shopSlug}`, "BAITSTOCK");
    return data ?? [];
  } catch {
    return [];
  }
}

/** 今月の釣りガイドURLを生成 */
function getCurrentMonthGuideUrl(): string {
  const month = new Date().getMonth() + 1;
  return lineUrl(`/monthly/${month}`, "season");
}

// ─── エリア記憶 ─────────────────────────────────────────────

/** ユーザーの釣りエリア（都道府県slug）を取得 */
async function getUserArea(userId: string): Promise<string | null> {
  try {
    return await dbGet<string>(`LINE#${userId}`, "AREA");
  } catch {
    return null;
  }
}

/** ユーザーの釣りエリアを保存 */
async function setUserArea(userId: string, prefSlug: string): Promise<void> {
  try {
    await dbPut(`LINE#${userId}`, "AREA", prefSlug);
  } catch {
    // ignore
  }
}

/** 位置情報を送ってもらった人の現在地（約1kmに丸めて保存。180日で使わなくなる） */
const ORIGIN_TTL_MS = 180 * 86400_000;
async function getUserOrigin(userId: string): Promise<LineOrigin | null> {
  try {
    const o = await dbGet<LineOrigin & { at: number }>(`LINE#${userId}`, "ORIGIN");
    return o && Number.isFinite(o.lat) && Number.isFinite(o.lng) && Date.now() - (o.at ?? 0) < ORIGIN_TTL_MS ? o : null;
  } catch {
    return null;
  }
}

async function setUserOrigin(userId: string, o: LineOrigin | null): Promise<void> {
  try {
    const round = (n: number) => Math.round(n * 100) / 100;
    await dbPut(`LINE#${userId}`, "ORIGIN", o ? { lat: round(o.lat), lng: round(o.lng), at: Date.now() } : null);
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

// ─── 最新週報の釣果表 ─────────────────────────────────────────
/**
 * 主要10エリアの最新週報の釣果表（/chouka と共有の1時間キャッシュ）。
 * キャッシュが冷えていて遅いときは待たずに空で返す（reply token の期限切れで無返信になるのを防ぐ）
 */
async function loadWeeklyRows(): Promise<LatestWeeklyCatch[]> {
  return Promise.race([
    getLatestWeeklyCatches(),
    new Promise<LatestWeeklyCatch[]>((r) => setTimeout(() => r([]), 4000)),
  ]).catch(() => []);
}

// ─── 一般ユーザー向けメッセージハンドラ ─────────────────────────
async function handleGeneralUserMessage(replyToken: string, text: string, userId: string) {
  // 都道府県名にマッチ → エリアを記憶
  const prefMatch = matchPrefecture(text);
  if (prefMatch) {
    await setUserArea(userId, prefMatch.slug);
    await setUserOrigin(userId, null); // 都道府県を選び直したら、前に送られた現在地は使わない
    await replyMessage(
      replyToken,
      [
        `📍 マイエリアを「${prefMatch.name}」に登録しました！`,
        "",
        "「釣果」を送ると、このエリアの今週の釣果を先にお届けします。",
        "変更したいときは、別の都道府県名を送ってください。",
      ].join("\n"),
      [{ label: "釣果", text: "釣果" }, { label: "スポット", text: "スポット" }, { label: "アジ", text: "アジ" }],
      LOCATION_LABEL,
    );
    return;
  }

  // ユーザーのエリアを取得
  const userArea = await getUserArea(userId);
  const userPref = userArea ? prefectures.find((p) => p.slug === userArea) : null;
  const myWeeklyArea = weeklyAreaForPrefecture(userPref?.name);
  // 位置情報を送ってもらっていれば、釣果は行ける範囲（REACH_KM 以内）に絞る
  const origin = await getUserOrigin(userId);

  // 魚の名前（「アジ」「タチウオ釣れてる？」）→ その魚が今釣れている場所
  const fish = findFishInText(text, fishSpecies);
  if (fish) {
    const rows = await loadWeeklyRows();
    await replyFlex(replyToken, buildFishFlex(fish, rows, myWeeklyArea, origin), buildFishReplyText(fish, rows, myWeeklyArea, origin));
    return;
  }

  // スポット・釣り場 → 位置情報ボタン付きのカード（位置を送ると近くの釣り場5か所）
  if (/スポット|釣り場|釣りスポット|ポイント|spot|場所|近く/i.test(text)) {
    await replyFlex(replyToken, buildSpotsFlex(userPref), buildSpotsText(userPref));
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
        lineUrl(`/prefecture/${userPref.slug}`, "season"),
        ""
      );
    }
    lines.push(
      `▼ ${month}月の釣りガイド`,
      getCurrentMonthGuideUrl(),
      "",
      "▼ 今釣れる魚の一覧",
      lineUrl("/catchable-now", "season")
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
        lineUrl("/guide/beginner", "beginner"),
        "",
        "▼ 持ち物チェックリスト",
        lineUrl("/beginner-checklist", "beginner"),
        "",
        "▼ 道具の選び方",
        lineUrl("/gear", "beginner"),
      ].join("\n")
    );
    return;
  }

  // 釣果・週報 → 最新の釣果週報
  if (/釣果|週報|釣れた|レポート|report/i.test(text)) {
    // マイエリアの今週の釣果＋全国の好調エリア上位＋/chouka
    const rows = await loadWeeklyRows();
    // マイエリアに週報が無い県（京都など）は、行ける範囲でいちばん近い週報エリアをマイエリア扱いに
    const area = myWeeklyArea ?? (origin ? nearestReachableArea(rows, origin) : null);
    await replyFlex(replyToken, buildChoukaFlex(rows, area, origin), buildChoukaReplyText(rows, area, origin));
    return;
  }

  // 釣り方＋道具（「サビキの道具」）→ その釣り方に合う道具だけをカードで（PR表記つき）
  const gearMethod = findGearMethod(text);
  if (gearMethod && /道具|タックル|装備|おすすめ|ギア/i.test(text)) {
    await replyFlex(replyToken, buildGearFlex(gearMethod), buildGearReplyText(gearMethod));
    return;
  }

  // 道具・おすすめ → 釣り方を選ぶカード
  if (/道具|おすすめ|タックル|ロッド|リール|gear|装備/i.test(text)) {
    await replyFlex(replyToken, buildGearMenuFlex(), buildGearMenuText());
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
        lineUrl("/fish-finder", "diagnosis"),
        "",
        "▼ 釣りスタイル診断",
        lineUrl("/quiz", "diagnosis"),
        "",
        "▼ ボウズ確率チェッカー",
        lineUrl("/bouzu-checker", "diagnosis"),
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
        lineUrl("/fishing-calendar", "tide"),
        "",
        "潮の動きをチェックして",
        "釣果アップを狙おう！",
      ].join("\n")
    );
    return;
  }

  // 使い方・ヘルプ → タップで送れる使い方カード
  if (/使い方|ヘルプ|help|メニュー|menu/i.test(text)) {
    await replyFlex(replyToken, buildHelpFlex(userPref?.nameShort), buildHelpText(userPref?.nameShort));
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

  // 分からない言葉 → 短く返してボタンで誘導（以前は長いヘルプ全文を毎回返していた）
  await replyMessage(
    replyToken,
    buildUnknownText(text),
    UNKNOWN_QUICK.map((t) => ({ label: t, text: t })),
    LOCATION_LABEL,
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
          // あいさつ＋エリア登録ボタン（位置情報・主な都道府県）。打たなくても登録できる
          await replyFlex(event.replyToken, buildWelcomeFlex(), buildWelcomeText());
        }
      }
      continue;
    }

    // 位置情報 → 近くの釣り場（店舗オーナーも同じ）
    if (event.type === "message" && event.message?.type === "location") {
      const userId = event.source?.userId;
      const { latitude, longitude } = event.message;
      if (userId && event.replyToken && Number.isFinite(latitude) && Number.isFinite(longitude)) {
        await handleLocationMessage(event.replyToken, userId, latitude, longitude);
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
