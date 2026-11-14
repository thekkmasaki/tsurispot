/**
 * LINE の案内系の返信（純関数）: 友だち追加のあいさつ・使い方・釣り場検索・分からない言葉への返事。
 *
 * - マイエリアは都道府県名を打たないと登録できなかった → 「位置情報で登録」と主な都道府県のボタンを出す
 * - 分からない言葉（「ありがとう」等）にも長いヘルプ全文を返していた → 短く返してボタンで誘導
 */
import type { LineFlexReply } from "@/lib/line/chouka-reply";
import { lineUrl } from "@/lib/line/line-url";

type FlexComponent = Record<string, unknown>;

/** 友だち追加直後に出す都道府県ボタン（位置情報ボタンと合わせて LINE の上限13個以内） */
export const QUICK_PREFS = ["東京", "神奈川", "千葉", "大阪", "兵庫", "愛知", "静岡", "福岡", "広島", "北海道", "宮城", "和歌山"];
// LINE が位置情報ボタンに自動でピンのアイコンを付けるので、絵文字は入れない（二重になる）
export const LOCATION_LABEL = "位置情報を送る";

const C = { brand: "#0369a1", sub: "#e0f2fe", text: "#111827", muted: "#6b7280", soft: "#f8fafc", accent: "#ea580c", ok: "#047857" };
const txt = (text: string, opt: FlexComponent = {}): FlexComponent => ({ type: "text", text: text || " ", wrap: true, ...opt });

function header(title: string, sub: string): FlexComponent {
  return {
    type: "box", layout: "vertical", backgroundColor: C.brand, paddingAll: "16px", spacing: "4px",
    contents: [txt(title, { color: "#ffffff", weight: "bold", size: "lg" }), txt(sub, { color: C.sub, size: "xs" })],
  };
}

/** タップでその言葉を送る行 */
function sendRow(send: string, title: string, sub: string, margin = "sm"): FlexComponent {
  return {
    type: "box", layout: "horizontal", spacing: "md", margin, paddingAll: "10px", cornerRadius: "8px", backgroundColor: C.soft,
    action: { type: "message", label: title.slice(0, 20), text: send },
    contents: [
      { type: "box", layout: "vertical", flex: 1, contents: [txt(title, { size: "sm", weight: "bold", color: C.text }), txt(sub, { size: "xxs", color: C.muted })] },
      txt("›", { flex: 0, size: "xl", color: C.muted, gravity: "center" }),
    ],
  };
}

function linkRow(uri: string, title: string, sub: string, margin = "sm"): FlexComponent {
  const row = sendRow("", title, sub, margin);
  return { ...row, action: { type: "uri", label: title.slice(0, 20), uri } };
}

function bubble(head: FlexComponent, body: FlexComponent[], footer?: FlexComponent[]): FlexComponent {
  return {
    type: "bubble", size: "mega", header: head,
    body: { type: "box", layout: "vertical", paddingAll: "16px", contents: body },
    ...(footer && { footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "12px", contents: footer } }),
  };
}

const primary = (label: string, uri: string): FlexComponent => ({ type: "button", style: "primary", color: C.brand, height: "sm", action: { type: "uri", label, uri } });

// ── 友だち追加 ──
export function buildWelcomeFlex(): LineFlexReply {
  return {
    altText: "友だち追加ありがとうございます！よく釣りするエリアを教えてください",
    contents: bubble(
      header("ツリスポへようこそ！", "全国の釣り場と、今週の釣果が分かります"),
      [
        txt("まず、よく釣りするエリアを教えてください。", { size: "sm", weight: "bold", color: C.text }),
        txt("下のボタンで都道府県を選ぶか、位置情報を送ると登録できます。", { size: "xs", color: C.muted, margin: "xs" }),
        { type: "separator", margin: "lg" },
        txt("こんなことができます", { size: "xs", weight: "bold", color: C.brand, margin: "lg" }),
        sendRow("釣果", "今週の釣果", "あなたのエリアで今釣れている魚", "md"),
        sendRow("アジ", "魚の名前を送る（例：アジ）", "その魚が今釣れている場所"),
        sendRow("スポット", "近くの釣り場", "位置情報を送ると近い順に5か所"),
      ],
    ),
    quickReply: QUICK_PREFS,
    askLocation: LOCATION_LABEL,
  };
}

export function buildWelcomeText(): string {
  return [
    "友だち追加ありがとうございます！",
    "",
    "まず、よく釣りするエリアを教えてください。",
    "都道府県名（例：神奈川）を送るか、位置情報を送ると登録できます。",
    "",
    "・「釣果」→ 今週の釣果",
    "・魚の名前（例：アジ）→ 今その魚が釣れている場所",
    "・位置情報 → 近くの釣り場",
  ].join("\n");
}

// ── 使い方 ──
export function buildHelpFlex(myPrefName?: string | null): LineFlexReply {
  return {
    altText: "ツリスポ LINE の使い方",
    contents: bubble(
      header("使い方", "タップすると、その言葉を送ります"),
      [
        sendRow("釣果", "釣果", "今週の釣果（マイエリア優先）", "none"),
        sendRow("アジ", "魚の名前（例：アジ）", "今その魚が釣れている場所"),
        sendRow("スポット", "スポット", "位置情報で近くの釣り場"),
        sendRow("今釣れる", "今釣れる", "今月釣れる魚"),
        sendRow("初心者", "初心者", "始め方・持ち物"),
        sendRow("道具", "道具", "釣り方に合うおすすめ道具"),
        sendRow("潮", "潮", "潮・釣りカレンダー"),
        sendRow("診断", "診断", "あなたに合う釣りは？"),
        sendRow("登録地", "登録地", "近い釣果に絞る場所（最大3か所）"),
        txt(
          myPrefName ? `マイエリア：${myPrefName}（都道府県名や位置情報で、よく行く場所を追加できます）` : "都道府県名か位置情報を送ると、マイエリアを登録できます（よく行く場所を最大5か所）",
          { size: "xxs", color: myPrefName ? C.ok : C.muted, margin: "md" },
        ),
      ],
      [primary("ツリスポを開く", lineUrl("/", "help"))],
    ),
    quickReply: ["釣果", "アジ", "道具"],
    askLocation: LOCATION_LABEL,
  };
}

export function buildHelpText(myPrefName?: string | null): string {
  return [
    "ツリスポ LINE の使い方",
    "",
    "・「釣果」→ 今週の釣果",
    "・魚の名前（例：アジ）→ 今その魚が釣れている場所",
    "・「スポット」または位置情報 → 近くの釣り場",
    "・「今釣れる」→ 今月釣れる魚",
    "・「初心者」→ 始め方ガイド",
    "・「道具」→ おすすめ道具",
    "・「潮」→ 釣りカレンダー",
    "・「診断」→ あなたに合う釣りは？",
    "・「登録地」→ 近い釣果に絞る場所（位置情報で最大3か所）",
    "",
    myPrefName ? `マイエリア：${myPrefName}（都道府県名や位置情報で、よく行く場所を追加）` : "都道府県名か位置情報を送るとマイエリアを登録できます（最大5か所）",
    "",
    lineUrl("/", "help"),
  ].join("\n");
}

// ── 釣り場を探す ──
export function buildSpotsFlex(myPref?: { slug: string; nameShort: string } | null): LineFlexReply {
  const body: FlexComponent[] = [
    txt("下の「位置情報を送る」を押すと、近い釣り場を5つお返しします。", { size: "sm", weight: "bold", color: C.text }),
    { type: "separator", margin: "lg" },
  ];
  if (myPref) body.push(linkRow(lineUrl(`/prefecture/${myPref.slug}`, "spots"), `${myPref.nameShort}の釣り場`, "マイエリアのスポット一覧", "lg"));
  body.push(
    linkRow(lineUrl("/map", "spots"), "地図から探す", "全国の釣り場を地図で", myPref ? "sm" : "lg"),
    linkRow(lineUrl("/spots", "spots"), "一覧から探す", "都道府県・釣り方で絞り込み"),
  );
  return {
    altText: "釣り場を探す：位置情報を送ると近くの釣り場をお返しします",
    contents: bubble(header("釣り場を探す", "全国の釣り場から"), body),
    quickReply: ["釣果", "アジ"],
    askLocation: LOCATION_LABEL,
  };
}

export function buildSpotsText(myPref?: { slug: string; nameShort: string } | null): string {
  return [
    "釣り場を探す",
    "位置情報を送ると、近い釣り場を5つお返しします。",
    "",
    ...(myPref ? [`▼ ${myPref.nameShort}の釣り場`, lineUrl(`/prefecture/${myPref.slug}`, "spots"), ""] : []),
    "▼ 地図から探す",
    lineUrl("/map", "spots"),
    "",
    "▼ 一覧から探す",
    lineUrl("/spots", "spots"),
  ].join("\n");
}

// ── 分からない言葉 ──
export function buildUnknownText(text: string): string {
  const shown = text.length > 15 ? `${text.slice(0, 14)}…` : text;
  return `「${shown}」はうまく分かりませんでした🙏\n\n魚の名前（例：アジ）や、下のボタンを送ってみてください。`;
}
export const UNKNOWN_QUICK = ["釣果", "アジ", "スポット", "道具", "使い方"];
