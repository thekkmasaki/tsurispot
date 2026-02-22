/**
 * アフィリエイト商品データ
 *
 * ユーザー提供のアフィリエイトリンクのみを使用。
 * 勝手にリンクを生成しないこと。
 */

export interface AffiliateProduct {
  id: string;
  name: string;
  url: string;
  description: string;
  /** どの釣り方に関連するか（部分一致で判定） */
  methodKeywords: string[];
  /** どの季節に関連するか */
  seasons: ("spring" | "summer" | "autumn" | "winter" | "all")[];
  category: "tackle" | "bait" | "wear" | "accessory";
}

/**
 * 月から季節を判定
 */
export function getSeasonFromMonth(month: number): "spring" | "summer" | "autumn" | "winter" {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter"; // 12, 1, 2
}

/**
 * 提供済みアフィリエイト商品一覧
 */
export const affiliateProducts: AffiliateProduct[] = [
  {
    id: "af-harris",
    name: "ハリス（フロロカーボン）",
    url: "https://amzn.to/408jI1f",
    description: "フカセ釣りやウキ釣りに欠かせないハリス。魚に警戒されにくいフロロカーボン素材で、食い渋り時にも効果的です。",
    methodKeywords: ["フカセ", "ウキ釣り", "ウキフカセ", "カゴ釣り", "落とし込み", "ヘチ釣り", "胴突き", "探り釣り"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-fluorocarbon-line",
    name: "フロロカーボンライン",
    url: "https://amzn.to/4tKXyzu",
    description: "感度が高く根ズレに強いフロロカーボンライン。ルアーフィッシングのリーダーやメインラインに最適です。",
    methodKeywords: ["ルアー", "エギング", "アジング", "メバリング", "ショアジギ", "サーフルアー", "ワインド", "渓流ルアー"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-winter-gloves",
    name: "防寒フィッシンググローブ",
    url: "https://amzn.to/3ZOdinM",
    description: "冬の釣りの必需品。指先が出せるタイプで、仕掛けの操作もしやすい防寒手袋です。",
    methodKeywords: [], // 全釣法対象（冬季のみ）
    seasons: ["winter"],
    category: "wear",
  },
  {
    id: "af-heated-vest",
    name: "電熱ベスト",
    url: "https://amzn.to/40sdGZ6",
    description: "普段使いもできる電熱ベスト。大容量バッテリー付きで長持ちし、腰まで暖かいと好評。冬の長時間釣行の必需品です。",
    methodKeywords: [], // 全釣法対象（冬季のみ）
    seasons: ["winter"],
    category: "wear",
  },
  {
    id: "af-mobile-battery",
    name: "モバイルバッテリー",
    url: "https://amzn.to/4s3kDvE",
    description: "釣り場でのスマホ充電やライト・電熱ベストの給電に。大容量タイプで1日安心の備えです。",
    methodKeywords: [], // 全釣法対象（通年）
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-amihime",
    name: "マルキュー アミ姫（コマセ）",
    url: "https://amzn.to/4c6gaUn",
    description: "チューブタイプで手が汚れにくいコマセ。フルーティーな香りでにおいも少なく、サビキ釣りの必須アイテムです。",
    methodKeywords: ["サビキ"],
    seasons: ["all"],
    category: "bait",
  },
  {
    id: "af-pe-line",
    name: "東レ PEライン（道糸）",
    url: "https://amzn.to/4s45H0i",
    description: "日本繊維メーカー最大手・東レ製のPEライン。感度と強度に優れ、ルアーフィッシングやショアジギングの道糸に最適です。",
    methodKeywords: ["ルアー", "ショアジギ", "エギング", "アジング", "メバリング", "サーフルアー", "ワインド", "ジギング"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-nylon-line",
    name: "東レ ナイロンライン（道糸）",
    url: "https://amzn.to/4s1SPaX",
    description: "視認性が高く天候を選ばず見やすいナイロンライン。強度も高く風にも強い。アタリの把握がしやすいと好評です。",
    methodKeywords: ["サビキ", "ウキ釣り", "フカセ", "カゴ釣り", "投げ釣り", "ちょい投げ", "胴突き"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-anker-charger",
    name: "Anker モバイルバッテリー",
    url: "https://amzn.to/4s2zhmT",
    description: "信頼のAnker製モバイルバッテリー。電熱ベストの給電やスマホ充電に。釣り場での長時間使用も安心です。",
    methodKeywords: [],
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-balaclava",
    name: "バラクラバ ネックウォーマー",
    url: "https://amzn.to/3ZMtLc7",
    description: "首元からの冷風をしっかりガード。保温性が高く、釣りだけでなく普段使いもできるネックウォーマーです。",
    methodKeywords: [],
    seasons: ["winter"],
    category: "wear",
  },
  {
    id: "af-fishing-bag-rakuten",
    name: "釣りバッグ",
    url: "https://a.r10.to/h5iiZA",
    description: "釣り道具の持ち運びに便利なフィッシングバッグ。あると無難な必需品です。",
    methodKeywords: [],
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-fishing-bag-large",
    name: "大容量フィッシングバッグ（40L）",
    url: "https://amzn.to/4aOYPgo",
    description: "約40Lの大容量で釣り道具を一式収納。2層構造で整理しやすく、前後左右のポケットで効率よく分けて収納できます。",
    methodKeywords: [],
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-rod-shimano",
    name: "シマノ ロッド",
    url: "https://amzn.to/4s4i64m",
    description: "信頼のシマノ製ロッド。初心者から中級者まで幅広く使えるコスパの良い1本です。",
    methodKeywords: ["サビキ", "ウキ釣り", "ちょい投げ", "投げ釣り", "カゴ釣り", "探り釣り"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-reel-shimano",
    name: "シマノ リール",
    url: "https://amzn.to/4atW7Om",
    description: "シマノ製のコスパ最高リール。滑らかな巻き心地で初心者にもおすすめです。",
    methodKeywords: ["サビキ", "ウキ釣り", "ちょい投げ", "投げ釣り", "カゴ釣り", "ルアー", "エギング", "ショアジギ"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-sinker",
    name: "おもりセット",
    url: "https://amzn.to/4cFGDbl",
    description: "意外と忘れがちなおもり。まとめ買いがお得です。",
    methodKeywords: ["ちょい投げ", "投げ釣り", "ウキ釣り", "カゴ釣り", "胴突き", "探り釣り", "ぶっこみ"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-snap",
    name: "スナップ（まとめ買い）",
    url: "https://amzn.to/4c9oMcU",
    description: "ルアーや仕掛けの交換に必須のスナップ。まとめ買いが断然お得です。",
    methodKeywords: ["ルアー", "エギング", "アジング", "メバリング", "ショアジギ", "サーフルアー", "ワインド"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-tackle-box",
    name: "釣りボックス（座れる大容量）",
    url: "https://amzn.to/4rvRhGx",
    description: "大容量の収納力で座れるタックルボックス。ぶっこみ釣りや泳がせ釣りの待ち時間も快適です。",
    methodKeywords: [],
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-rod-stand",
    name: "ロッドスタンド",
    url: "https://amzn.to/3OwwVy8",
    description: "タックルボックスに設置できるロッドスタンド。ぶっこみ釣りや泳がせ釣りがとても楽になります。",
    methodKeywords: ["ぶっこみ", "泳がせ", "投げ釣り", "ちょい投げ"],
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-basket",
    name: "買い物かご（釣り用）",
    url: "https://amzn.to/3ME1wt6",
    description: "たまにしか釣りしない方に。買い物かごで道具をまとめて持ち運べます。座れないのが難点ですが、手軽に始められます。",
    methodKeywords: [],
    seasons: ["all"],
    category: "accessory",
  },
];

/**
 * スポットの釣り方リストと現在の月に基づいて、関連するアフィリエイト商品を返す
 * @param methods スポットのcatchableFishから取得した釣り方の配列
 * @param currentMonth 現在の月 (1-12)
 * @param maxItems 最大表示数（デフォルト3）
 */
export function getRelevantAffiliateProducts(
  methods: string[],
  currentMonth: number,
  maxItems: number = 3
): AffiliateProduct[] {
  const currentSeason = getSeasonFromMonth(currentMonth);

  // 各商品のスコアリング
  const scored = affiliateProducts
    .filter((product) => {
      // 季節フィルタ: "all" を含むか、現在の季節と一致するもののみ
      return product.seasons.includes("all") || product.seasons.includes(currentSeason);
    })
    .map((product) => {
      let score = 0;

      if (product.methodKeywords.length === 0) {
        // 全釣法対象商品（手袋、バッテリー等）は低めのベーススコア
        score = 1;
      } else {
        // 釣り方のキーワードマッチでスコアリング
        for (const method of methods) {
          for (const keyword of product.methodKeywords) {
            if (method.includes(keyword)) {
              score += 10;
              break; // 1メソッドにつき1回のみカウント
            }
          }
        }
      }

      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxItems).map((item) => item.product);
}
