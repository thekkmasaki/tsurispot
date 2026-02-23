/**
 * アフィリエイト商品データ
 *
 * 各商品にはAmazon ASIN、楽天検索クエリ、対象魚・釣法の関連情報を含みます。
 */

export type ProductCategory =
  | "rod"
  | "reel"
  | "tackle"
  | "accessory"
  | "wear"
  | "cooler"
  | "other";

export type ProductDifficulty = "beginner" | "intermediate" | "advanced";

export interface Product {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  imageDescription: string;
  amazonAsin: string;
  rakutenSearchQuery: string;
  category: ProductCategory;
  difficulty: ProductDifficulty;
  relatedMethods: string[];
  relatedFish: string[];
  priority: number;
}

export const products: Product[] = [
  // ============================================
  // 初心者セット（高コンバージョン）
  // ============================================
  {
    id: "p1",
    name: "プロマリン わくわくサビキ釣りセットDX",
    description:
      "竿・リール・仕掛け・バケツまで全部入りの完全セット。買ったその日にサビキ釣りを始められます。初めての1本に最適。",
    priceRange: "3,000〜4,000円",
    imageDescription: "サビキ釣りセット一式",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenSearchQuery: "プロマリン サビキ釣りセット DX",
    category: "other",
    difficulty: "beginner",
    relatedMethods: ["sabiki"],
    relatedFish: ["aji", "saba", "iwashi"],
    priority: 1,
  },
  {
    id: "p2",
    name: "ダイワ リバティクラブ 磯風 3-45遠投",
    description:
      "ダイワの人気万能磯竿。サビキ釣りからウキ釣りまで幅広く使えます。しなやかで扱いやすく、初心者にも安心の1本。",
    priceRange: "5,000〜7,000円",
    imageDescription: "ダイワ リバティクラブ 磯風",
    amazonAsin: "B00NFQ5E8S",
    rakutenSearchQuery: "ダイワ リバティクラブ 磯風 3号",
    category: "rod",
    difficulty: "beginner",
    relatedMethods: ["sabiki", "ukifishing", "choinage"],
    relatedFish: ["aji", "saba", "iwashi", "kurodai", "sayori"],
    priority: 2,
  },
  {
    id: "p3",
    name: "シマノ セドナ 2500",
    description:
      "シマノの定番エントリーリール。滑らかな巻き心地と安定したドラグ性能で、初心者から長く使えるコスパ抜群のリール。",
    priceRange: "5,000〜6,000円",
    imageDescription: "シマノ セドナ 2500",
    amazonAsin: "B0B5ZRMLZZ",
    rakutenSearchQuery: "シマノ セドナ 2500",
    category: "reel",
    difficulty: "beginner",
    relatedMethods: ["sabiki", "ukifishing", "choinage", "ajing"],
    relatedFish: ["aji", "saba", "iwashi", "kurodai", "kisu"],
    priority: 3,
  },

  // ============================================
  // 仕掛け・小物（頻繁に買い替え＝リピート収益）
  // ============================================
  {
    id: "p4",
    name: "ハヤブサ 実戦サビキ ピンクスキン 6本鈎",
    description:
      "サビキ釣りの定番仕掛け。ピンクスキンはアジ・サバ・イワシに幅広く対応。消耗品なので予備を数セット持っておくと安心。",
    priceRange: "200〜400円",
    imageDescription: "ハヤブサ サビキ仕掛け ピンクスキン",
    amazonAsin: "B00CMQGRJK",
    rakutenSearchQuery: "ハヤブサ サビキ仕掛け ピンクスキン",
    category: "tackle",
    difficulty: "beginner",
    relatedMethods: ["sabiki"],
    relatedFish: ["aji", "saba", "iwashi"],
    priority: 4,
  },
  {
    id: "p5",
    name: "マルキュー アミ姫",
    description:
      "チューブタイプのコマセ（撒き餌）。フルーティーな香りでにおいが少なく、手が汚れにくい。女性やお子さんにも人気。",
    priceRange: "300〜500円",
    imageDescription: "マルキュー アミ姫 チューブタイプ",
    amazonAsin: "B00TYF5RUS",
    rakutenSearchQuery: "マルキュー アミ姫",
    category: "tackle",
    difficulty: "beginner",
    relatedMethods: ["sabiki"],
    relatedFish: ["aji", "saba", "iwashi"],
    priority: 5,
  },
  {
    id: "p6",
    name: "ささめ針 ちょい投げセット",
    description:
      "天秤・オモリ・針がセットになったちょい投げ仕掛け。砂浜や堤防からキスやハゼを手軽に狙えます。",
    priceRange: "300〜500円",
    imageDescription: "ささめ針 ちょい投げセット",
    amazonAsin: "B004JKJD8A",
    rakutenSearchQuery: "ささめ針 ちょい投げセット",
    category: "tackle",
    difficulty: "beginner",
    relatedMethods: ["choinage"],
    relatedFish: ["kisu", "haze", "karei"],
    priority: 6,
  },
  {
    id: "p7",
    name: "ブラクリ 3号",
    description:
      "穴釣り専用の仕掛け。テトラポッドや岩の隙間に落とすだけでカサゴやメバルが狙えます。根がかりしにくい設計。",
    priceRange: "200〜400円",
    imageDescription: "ブラクリ仕掛け",
    amazonAsin: "B004JKJD6I",
    rakutenSearchQuery: "ブラクリ 3号 穴釣り",
    category: "tackle",
    difficulty: "beginner",
    relatedMethods: ["anazuri"],
    relatedFish: ["kasago", "mebaru", "ainame", "kurosoi"],
    priority: 7,
  },

  // ============================================
  // ルアー（中〜上級者向け・単価高め）
  // ============================================
  {
    id: "p8",
    name: "ダイワ 月下美人 アジング 60UL-S",
    description:
      "ルアーでアジを狙うアジング専用ロッド。繊細なティップで小さなアタリも逃さない。軽量ジグヘッドの操作性に優れたモデル。",
    priceRange: "8,000〜10,000円",
    imageDescription: "ダイワ 月下美人 アジングロッド",
    amazonAsin: "B09KN5G6ZP",
    rakutenSearchQuery: "ダイワ 月下美人 アジング ロッド",
    category: "rod",
    difficulty: "intermediate",
    relatedMethods: ["ajing", "mebaring"],
    relatedFish: ["aji", "mebaru"],
    priority: 8,
  },
  {
    id: "p9",
    name: "メジャークラフト ジグパラ ショート 30g",
    description:
      "ショアジギングの定番メタルジグ。ただ巻きでもよく泳ぎ、初心者でも扱いやすい。青物からフラットフィッシュまで対応。",
    priceRange: "500〜700円",
    imageDescription: "メジャークラフト ジグパラ ショート",
    amazonAsin: "B00G3L15V0",
    rakutenSearchQuery: "メジャークラフト ジグパラ ショート",
    category: "tackle",
    difficulty: "intermediate",
    relatedMethods: ["shorejigging", "lure"],
    relatedFish: ["inada", "saba", "kamasu", "hirame", "magochi", "buri"],
    priority: 9,
  },
  {
    id: "p10",
    name: "ダイワ エメラルダス ラトル 3.5号",
    description:
      "アオリイカ狙いのエギング定番エギ。ラトル入りで音でもアピール。ダートアクションの切れが良く、初心者でも操作しやすい。",
    priceRange: "700〜1,000円",
    imageDescription: "ダイワ エメラルダス エギ",
    amazonAsin: "B07L5N7CZX",
    rakutenSearchQuery: "ダイワ エメラルダス エギ 3.5号",
    category: "tackle",
    difficulty: "intermediate",
    relatedMethods: ["eging"],
    relatedFish: ["aoriika", "yariika", "kouika"],
    priority: 10,
  },

  // ============================================
  // アクセサリー（高利益率）
  // ============================================
  {
    id: "p11",
    name: "シマノ ラフトエアジャケット（ライフジャケット）",
    description:
      "国土交通省認定の膨張式ライフジャケット。ウエストタイプで動きやすく、堤防釣りでも邪魔になりません。安全のための必須アイテム。",
    priceRange: "4,000〜6,000円",
    imageDescription: "シマノ ライフジャケット ウエストタイプ",
    amazonAsin: "B0CMP3RCT3",
    rakutenSearchQuery: "シマノ ライフジャケット 膨張式 ウエスト",
    category: "accessory",
    difficulty: "beginner",
    relatedMethods: ["sabiki", "ukifishing", "choinage", "ajing", "eging"],
    relatedFish: [],
    priority: 11,
  },
  {
    id: "p12",
    name: "ダイワ クールラインα3 S1500",
    description:
      "釣った魚の鮮度を保つ15Lクーラーボックス。軽量で持ち運びやすく、堤防釣りにちょうどいいサイズ。保冷力も抜群。",
    priceRange: "4,000〜6,000円",
    imageDescription: "ダイワ クーラーボックス 15L",
    amazonAsin: "B0CVYV893K",
    rakutenSearchQuery: "ダイワ クーラーボックス 15L 釣り",
    category: "cooler",
    difficulty: "beginner",
    relatedMethods: ["sabiki", "ukifishing", "choinage"],
    relatedFish: [],
    priority: 12,
  },
  {
    id: "p13",
    name: "ウミボウズ フィッシュグリップ",
    description:
      "魚を安全につかむためのグリップ。ヒレのトゲや歯から手を守ります。計量機能付きで釣果の記録にも便利。",
    priceRange: "1,500〜2,500円",
    imageDescription: "フィッシュグリップ",
    amazonAsin: "B074P3D6R9",
    rakutenSearchQuery: "フィッシュグリップ 計量 釣り",
    category: "accessory",
    difficulty: "beginner",
    relatedMethods: ["sabiki", "ukifishing", "choinage", "ajing", "lure"],
    relatedFish: [],
    priority: 13,
  },
  {
    id: "p14",
    name: "第一精工 高速リサイクラー 2.0",
    description:
      "リールの糸巻き・糸交換が簡単にできるラインワインダー。自宅でのライン交換の必需品。時間と手間を大幅に節約。",
    priceRange: "2,000〜3,000円",
    imageDescription: "第一精工 高速リサイクラー",
    amazonAsin: "B001FWIQDW",
    rakutenSearchQuery: "第一精工 高速リサイクラー",
    category: "accessory",
    difficulty: "beginner",
    relatedMethods: [],
    relatedFish: [],
    priority: 14,
  },
  {
    id: "p15",
    name: "冒険王 偏光サングラス SC-10",
    description:
      "水面のギラつきを抑え、水中の魚影や地形が見やすくなる偏光グラス。紫外線カットで目の保護にも。釣り全般に必須。",
    priceRange: "1,500〜2,500円",
    imageDescription: "偏光サングラス フィッシング用",
    amazonAsin: "B0741FXFQZ",
    rakutenSearchQuery: "偏光サングラス 釣り フィッシング",
    category: "wear",
    difficulty: "beginner",
    relatedMethods: [],
    relatedFish: [],
    priority: 15,
  },
  // ============================================
  // 上級者向け大型魚ターゲット（アカメ・シーバス・ヒラスズキ等）
  // ============================================
  {
    id: "p20",
    name: "シマノ ディアルーナ S96MH",
    description:
      "大型シーバスからアカメまで対応するパワーロッド。9.6ftのレングスで飛距離を稼ぎつつ、MHパワーでメーター級の大型魚とも勝負できる。河口・サーフ・磯とフィールドを選ばない万能さ。",
    priceRange: "20,000〜28,000円",
    imageDescription: "シマノ ディアルーナ シーバスロッド",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenSearchQuery: "シマノ ディアルーナ S96MH シーバスロッド",
    category: "rod",
    difficulty: "advanced",
    relatedMethods: ["lure"],
    relatedFish: ["akame", "seabass", "hiramasa", "buri"],
    priority: 20,
  },
  {
    id: "p21",
    name: "シマノ ツインパワー 4000XG",
    description:
      "高剛性メタルボディで大型魚の強烈な引きに対応するハイエンドリール。4000番のXGギアでルアー回収が速く、アカメの激しいエラ洗いにも負けないドラグ性能。",
    priceRange: "30,000〜40,000円",
    imageDescription: "シマノ ツインパワー スピニングリール",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenSearchQuery: "シマノ ツインパワー 4000XG スピニングリール",
    category: "reel",
    difficulty: "advanced",
    relatedMethods: ["lure"],
    relatedFish: ["akame", "seabass", "hiramasa", "buri"],
    priority: 21,
  },
  {
    id: "p22",
    name: "東レ スーパーストロング PE×8 2号 200m",
    description:
      "8本編みの高強度PEライン。2号で約35lbの引張強度があり、アカメや大型シーバスの強烈なファイトにも対応。高密度編みでガイドの摩擦にも強く、飛距離も出る。",
    priceRange: "2,500〜3,500円",
    imageDescription: "東レ PEライン 2号",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenSearchQuery: "東レ スーパーストロング PE 2号 8本編み",
    category: "tackle",
    difficulty: "advanced",
    relatedMethods: ["lure"],
    relatedFish: ["akame", "seabass", "hiramasa", "buri", "shiira"],
    priority: 22,
  },
  {
    id: "p23",
    name: "クレハ シーガー グランドマックスFX 10号（40lb）",
    description:
      "アカメ・大型根魚用のショックリーダー。フロロカーボン100%で根ズレに強く、10号（40lb）で大型魚のファイトにも余裕の強度。しなやかさと強度を両立。",
    priceRange: "1,500〜2,500円",
    imageDescription: "クレハ フロロカーボン ショックリーダー",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenSearchQuery: "シーガー グランドマックス フロロカーボン リーダー 10号",
    category: "tackle",
    difficulty: "advanced",
    relatedMethods: ["lure"],
    relatedFish: ["akame", "seabass", "hiramasa", "buri"],
    priority: 23,
  },
  {
    id: "p24",
    name: "ボガグリップ 30lb フィッシュグリップ",
    description:
      "大型魚対応のフィッシュグリップ。アカメのような歯やエラが鋭い魚を安全にホールドできる。計量機能付きで最大30lb（約13.6kg）まで計測可能。",
    priceRange: "3,000〜5,000円",
    imageDescription: "大型フィッシュグリップ 計量付き",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenSearchQuery: "フィッシュグリップ 大型魚 計量 ステンレス",
    category: "accessory",
    difficulty: "advanced",
    relatedMethods: ["lure"],
    relatedFish: ["akame", "seabass", "hiramasa", "buri", "shiira", "magochi"],
    priority: 24,
  },
];

/**
 * カテゴリでフィルタリング
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return products
    .filter((p) => p.category === category)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * 難易度でフィルタリング
 */
export function getProductsByDifficulty(difficulty: ProductDifficulty): Product[] {
  return products
    .filter((p) => p.difficulty === difficulty)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * 釣り方でフィルタリング
 */
export function getProductsByMethod(method: string): Product[] {
  return products
    .filter((p) => p.relatedMethods.includes(method))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * 対象魚でフィルタリング
 */
export function getProductsByFish(fishSlug: string): Product[] {
  return products
    .filter((p) => p.relatedFish.includes(fishSlug))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * 優先度上位の商品を取得
 */
export function getTopProducts(count: number): Product[] {
  return [...products].sort((a, b) => a.priority - b.priority).slice(0, count);
}

/**
 * 初心者向け必須アイテムを取得
 */
export function getBeginnerEssentials(): Product[] {
  return products
    .filter((p) => p.difficulty === "beginner")
    .sort((a, b) => a.priority - b.priority);
}

/**
 * カテゴリラベルの定義
 */
export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  rod: "ロッド（竿）",
  reel: "リール",
  tackle: "仕掛け・ルアー",
  accessory: "アクセサリー",
  wear: "ウェア",
  cooler: "クーラー・保冷",
  other: "セット・その他",
};
