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
    url: "https://amzn.to/4tJlbIR",
    description: "USB給電で暖かい電熱ベスト。冬の長時間釣行でも体を冷やさず、快適に釣りを楽しめます。",
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
