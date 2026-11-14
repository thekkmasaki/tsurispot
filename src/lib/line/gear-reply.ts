/**
 * LINE の「道具」系の返信（純関数）。
 *
 * - 「道具」: 釣り方を選ぶカード → タップで「◯◯の道具」
 * - 「サビキの道具」など: その釣り方に合う商品だけをカードで並べる
 *
 * 商品は affiliate-products.ts の id で参照する（リンクの二重管理をしない・勝手にリンクを作らない）。
 * 釣り方に合う竿の商品が無いときは、合わない竿を載せずにガイドで選び方へ案内する
 * （以前は全釣り方で同じ竿・リールのリンクだった＝ジギングでも万能竿が開いた）。
 * Amazon アソシエイトなので「PR」を必ず表示する（ステルスマーケティング規制）。
 */
import { affiliateProducts, type AffiliateProduct } from "@/lib/data/affiliate-products";
import type { LineFlexReply } from "@/lib/line/chouka-reply";

type FlexComponent = Record<string, unknown>;

const SITE = "https://tsurispot.com";
const utm = (campaign: string) => `utm_source=line&utm_medium=reply&utm_campaign=${campaign}`;

export interface GearMethod {
  /** メッセージに含まれていたらこの釣り方（「サビキの道具」） */
  key: string;
  name: string;
  guide: string;
  /** 選択カードのボタン名（長い名前は2行に折れるので短く） */
  short?: string;
  /** 一言（初心者向けの位置づけ） */
  lead: string;
  /** [商品id, この釣り方での役割] */
  items: [string, string][];
  /** 合う竿の商品が無いときの一言 */
  rodNote?: string;
}

export const GEAR_METHODS: GearMethod[] = [
  {
    key: "サビキ", name: "サビキ釣り", guide: "/guide/sabiki", lead: "いちばん簡単。アジ・イワシ・サバが群れで釣れる",
    items: [["af-beginner-set", "竿・リール・仕掛けが全部そろう"], ["af-amihime", "寄せエサ"], ["af-rod-holder", "置き竿に"], ["af-lifejacket", "堤防でも着用を"]],
  },
  {
    key: "ちょい投げ", name: "ちょい投げ釣り", short: "ちょい投げ", guide: "/guide/choinage", lead: "軽く投げて待つだけ。キス・ハゼ・カレイ",
    items: [["af-beginner-set", "竿・リールが全部そろう"], ["af-jet-sinker", "仕掛けを遠くへ飛ばす"], ["af-nylon-line", "道糸"], ["af-rod-stand", "置き竿に"]],
  },
  {
    key: "ウキ", name: "ウキ釣り", guide: "/guide/float-fishing", lead: "ウキが沈む瞬間が楽しい。メジナ・クロダイ",
    items: [["af-reel-shimano", "リール"], ["af-nylon-line", "道糸"], ["af-harris", "ハリス"], ["af-sinker", "おもり"]],
    rodNote: "竿は磯竿（3〜4m）が基本。選び方はガイドで",
  },
  {
    key: "ルアー", name: "ルアー釣り", guide: "/guide/lure", lead: "エサいらず。シーバス・青物・根魚",
    items: [["af-reel-shimano", "リール"], ["af-pe-line", "道糸（PE）"], ["af-fluorocarbon-line", "リーダー"], ["af-snap", "ルアー交換用"]],
    rodNote: "竿は狙う魚で長さ・硬さが変わる。選び方はガイドで",
  },
  {
    key: "エギング", name: "エギング", guide: "/guide/eging", lead: "秋が本番。アオリイカ",
    items: [["af-eging-rod", "エギング専用の竿"], ["af-reel-shimano", "リール"], ["af-egi-set", "エギ（2.5〜3.5号）"], ["af-pe-line", "道糸（PE）"]],
  },
  {
    key: "ジギング", name: "ショアジギング", short: "ジギング", guide: "/guide/jigging", lead: "遠投して青物。ブリ・サワラ",
    items: [["af-reel-shimano", "リール"], ["af-pe-line", "道糸（PE）"], ["af-sagoshiz", "サワラ狙いのミノー"], ["af-snap", "ルアー交換用"]],
    rodNote: "竿は専用ロッド（9〜10ft）を。選び方はガイドで",
  },
  {
    key: "穴釣り", name: "穴釣り", guide: "/guide/anazuri", lead: "テトラの隙間を探る。カサゴ・ソイ",
    items: [["af-sinker", "根掛かりで減るので多めに"], ["af-nylon-line", "道糸"], ["af-lifejacket", "テトラでは必須"]],
    rodNote: "竿は1〜1.5mの短い竿で十分。選び方はガイドで",
  },
  {
    key: "カゴ", name: "遠投カゴ釣り", short: "カゴ釣り", guide: "/guide/entou-kago", lead: "沖の回遊魚を寄せエサで狙う",
    items: [["af-amihime", "カゴに詰める寄せエサ"], ["af-nylon-line", "道糸"], ["af-harris", "ハリス"], ["af-rod-stand", "置き竿に"]],
    rodNote: "竿は遠投用の磯竿（4〜5m）。選び方はガイドで",
  },
  {
    key: "泳がせ", name: "泳がせ釣り", guide: "/guide/oyogase", lead: "釣った小魚をエサに大物を",
    items: [["af-harris", "ハリス（太め）"], ["af-sinker", "おもり"], ["af-rod-stand", "置き竿に"], ["af-lifejacket", "大物とのやり取りに"]],
    rodNote: "竿は磯竿（3〜4m）の太めを。選び方はガイドで",
  },
];

const byId = new Map(affiliateProducts.map((p) => [p.id, p]));

export function findGearMethod(text: string): GearMethod | null {
  return GEAR_METHODS.find((m) => text.includes(m.key)) ?? null;
}

function itemsOf(m: GearMethod): { product: AffiliateProduct; role: string }[] {
  return m.items.flatMap(([id, role]) => {
    const product = byId.get(id);
    return product ? [{ product, role }] : [];
  });
}

const C = { brand: "#0369a1", sub: "#e0f2fe", text: "#111827", muted: "#6b7280", line: "#e5e7eb", accent: "#ea580c", soft: "#f8fafc" };
const txt = (text: string, opt: FlexComponent = {}): FlexComponent => ({ type: "text", text: text || " ", wrap: true, ...opt });
const prBadge: FlexComponent = {
  type: "box", layout: "vertical", flex: 0, backgroundColor: "#ffffff", cornerRadius: "4px", paddingStart: "6px", paddingEnd: "6px",
  contents: [txt("PR", { size: "xxs", weight: "bold", color: C.brand })],
};

function header(title: string, sub: string, pr: boolean): FlexComponent {
  return {
    type: "box", layout: "vertical", backgroundColor: C.brand, paddingAll: "16px", spacing: "4px",
    contents: [
      { type: "box", layout: "horizontal", spacing: "sm", contents: [txt(title, { color: "#ffffff", weight: "bold", size: "lg", flex: 1 }), ...(pr ? [prBadge] : [])] },
      txt(sub, { color: C.sub, size: "xs" }),
    ],
  };
}

const methodQuick = (except?: string) => ["サビキの道具", "ちょい投げの道具", "エギングの道具", "ルアーの道具"].filter((t) => !except || !t.startsWith(except));

/** 「サビキの道具」など → その釣り方の道具カード */
export function buildGearFlex(m: GearMethod): LineFlexReply {
  const rows = itemsOf(m).map(({ product, role }, i): FlexComponent => ({
    type: "box", layout: "horizontal", spacing: "md", margin: i ? "md" : "none", paddingAll: "10px", cornerRadius: "8px", backgroundColor: C.soft,
    action: { type: "uri", label: "Amazonで見る", uri: product.url },
    contents: [
      {
        type: "box", layout: "vertical", flex: 1, spacing: "2px",
        contents: [
          txt(role, { size: "xxs", color: C.accent, weight: "bold" }),
          txt(product.name, { size: "sm", weight: "bold", color: C.text, maxLines: 2 }),
          ...(product.priceRange ? [txt(product.priceRange, { size: "xxs", color: C.muted })] : []),
        ],
      },
      txt("›", { flex: 0, size: "xl", color: C.muted, gravity: "center" }),
    ],
  }));
  const body: FlexComponent[] = [txt(m.lead, { size: "xs", color: C.muted, margin: "none" }), { type: "separator", margin: "md", color: C.line }, { type: "box", layout: "vertical", margin: "md", contents: rows }];
  if (m.rodNote) body.push(txt(`🎣 ${m.rodNote}`, { size: "xs", color: C.text, margin: "md" }));
  return {
    altText: `【PR】${m.name}のおすすめ道具`,
    contents: {
      type: "bubble", size: "mega",
      header: header(`${m.name}の道具`, "タップで Amazon の商品ページへ", true),
      body: { type: "box", layout: "vertical", paddingAll: "16px", contents: body },
      footer: {
        type: "box", layout: "vertical", spacing: "sm", paddingAll: "12px",
        contents: [
          { type: "button", style: "primary", color: C.brand, height: "sm", action: { type: "uri", label: `${m.name}の始め方`, uri: `${SITE}${m.guide}?${utm("gear")}` } },
          { type: "button", style: "secondary", height: "sm", action: { type: "message", label: "ほかの釣り方", text: "道具" } },
          txt("※アフィリエイト広告を利用しています", { size: "xxs", color: C.muted, align: "center" }),
        ],
      },
    },
    quickReply: methodQuick(m.key),
  };
}

export function buildGearReplyText(m: GearMethod): string {
  return [
    `【PR】${m.name}のおすすめ道具`,
    m.lead,
    "",
    ...itemsOf(m).flatMap(({ product, role }) => [`・${role}：${product.name}`, `  ${product.url}`]),
    ...(m.rodNote ? ["", m.rodNote] : []),
    "",
    `▼ ${m.name}の始め方`,
    `${SITE}${m.guide}?${utm("gear")}`,
    "",
    "※アフィリエイト広告を利用しています",
  ].join("\n");
}

/** 「道具」 → 釣り方を選ぶカード */
export function buildGearMenuFlex(): LineFlexReply {
  const btn = (m: GearMethod): FlexComponent => ({
    type: "box", layout: "vertical", flex: 1, paddingAll: "10px", cornerRadius: "8px", backgroundColor: C.soft, justifyContent: "center",
    action: { type: "message", label: m.name.slice(0, 20), text: `${m.key}の道具` },
    contents: [txt(m.short ?? m.name, { size: "sm", weight: "bold", color: C.brand, align: "center" })],
  });
  const grid: FlexComponent[] = [];
  for (let i = 0; i < GEAR_METHODS.length; i += 3) {
    grid.push({ type: "box", layout: "horizontal", spacing: "sm", margin: i ? "sm" : "md", contents: GEAR_METHODS.slice(i, i + 3).map(btn) });
  }
  return {
    altText: "釣り方を選ぶと、おすすめの道具を表示します",
    contents: {
      type: "bubble", size: "mega",
      header: header("おすすめ道具", "釣り方を選ぶと、合う道具だけを表示します", false),
      body: {
        type: "box", layout: "vertical", paddingAll: "16px",
        contents: [txt("はじめてなら「サビキ釣り」がおすすめ。セット1つで始められます。", { size: "xs", color: C.muted }), ...grid],
      },
      footer: {
        type: "box", layout: "vertical", paddingAll: "12px",
        contents: [{ type: "button", style: "primary", color: C.brand, height: "sm", action: { type: "uri", label: "道具の選び方を読む", uri: `${SITE}/gear?${utm("gear")}` } }],
      },
    },
    quickReply: methodQuick(),
  };
}

export function buildGearMenuText(): string {
  return [
    "おすすめ道具",
    "釣り方を送ると、合う道具を表示します。",
    "例：「サビキの道具」「エギングの道具」",
    "",
    "▼ 道具の選び方",
    `${SITE}/gear?${utm("gear")}`,
  ].join("\n");
}
