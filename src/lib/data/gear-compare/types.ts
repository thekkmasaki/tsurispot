/** 比較ページ（/gear/compare/[category]）の1機種。スペックはメーカー公式の値のみ（不明は null） */
export interface GearModel {
  /** 機種ID（楽天商品データのキー。英小文字・数字・ハイフン） */
  id: string;
  maker: string;
  series: string;
  /** 型番（例: FCSJ-962M） */
  model: string;
  /** 全長の表記（例: 9'6"） */
  lengthFt: string | null;
  /** 全長（m） */
  lengthM: number | null;
  pieces: number | null;
  lureMinG: number | null;
  lureMaxG: number | null;
  /** ルアーとは別にメタルジグの上限が公式に書かれている機種だけ（例: シマノ ルアーマチック） */
  jigMaxG?: number;
  peMin: number | null;
  peMax: number | null;
  weightG: number | null;
  /** メーカー希望本体価格（オープン価格は null） */
  priceYen: number | null;
  /** スペックの出典（メーカー公式ページ） */
  sourceUrl: string;
}

/** 楽天商品検索APIから取得した、機種に対応する商品（scripts/gear/fetch-rakuten-items.mjs が生成） */
export interface RakutenItem {
  itemName: string;
  /** 取得時点の価格（税込） */
  price: number;
  /** アフィリエイトID付きの商品URL */
  affiliateUrl: string;
  imageUrl: string | null;
  shopName: string;
  reviewAverage: number;
  reviewCount: number;
  /** 取得日 YYYY-MM-DD */
  fetchedAt: string;
}

export interface GearCompareCategory {
  slug: string;
  /** 例: ショアジギングロッド */
  name: string;
  title: string;
  description: string;
  /** H1直下の導入（事実ベース・独自文） */
  lead: string;
  /** 選び方の要点（見出し＋本文） */
  guide: { heading: string; body: string }[];
  /** 関連する釣り方ページ（/fishing/[method]） */
  methodSlug: string;
  models: GearModel[];
}
