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
  category: "tackle" | "bait" | "wear" | "accessory" | "book";
  /** 特定の都道府県でのみ表示する（未指定なら全国対象） */
  prefectures?: string[];
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
    id: "af-egi-set",
    name: "エギ ルアー 10本セット（ラトル内蔵・夜光）",
    url: "https://amzn.to/3Nc9r10",
    description: "2.5号・3.0号・3.5号の餌木10本セット。ラトル内蔵で集魚力抜群、夜光タイプで夜釣りにも対応。アオリイカ・ヤリイカ・タコ狙いに。",
    methodKeywords: ["エギング", "タコエギ"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-tako-ball",
    name: "タコ釣りボール（12粒セット・貝殻容器付）",
    url: "https://amzn.to/3NNwHmh",
    description: "タコエギに付けるだけで集魚効果がアップする専用エサ。貝殻容器付きでセットも簡単。初心者からベテランまでタコ釣りの釣果アップに。",
    methodKeywords: ["タコエギ", "タコ", "テンヤ", "タコジグ"],
    seasons: ["summer", "autumn"],
    category: "bait",
  },
  {
    id: "af-eging-rod",
    name: "エギングロッド",
    url: "https://amzn.to/4rLFPqc",
    description: "エギング専用ロッド。しゃくりやすい軽量設計で、アオリイカやヤリイカ狙いに最適です。",
    methodKeywords: ["エギング"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-beginner-set",
    name: "釣り入門セット（ロッド・リール・仕掛け付き）",
    url: "https://amzn.to/4l80eDk",
    description: "ロッド・リール・仕掛けがすべて揃った初心者向け豪華セット。これ1つで釣りを始められます。",
    methodKeywords: ["サビキ", "ちょい投げ", "ウキ釣り", "探り釣り", "胴突き"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-rod-holder",
    name: "第一精工 受太郎 竿受け",
    url: "https://amzn.to/4cuGPu5",
    description: "堤防の柵やパイプに取り付けられる竿受け。ぶっこみ釣りやサビキの置き竿に便利で、両手が空くので仕掛け交換も楽々。",
    methodKeywords: ["サビキ", "ちょい投げ", "投げ釣り", "ぶっこみ", "胴突き", "泳がせ"],
    seasons: ["all"],
    category: "accessory",
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
  {
    id: "af-lifejacket",
    name: "ライフジャケット",
    url: "https://amzn.to/4s1DpU5",
    description: "装着感が良く、腰に巻いた感じも快適。お手頃価格で初心者やコストを抑えたい方におすすめです。磯釣り・堤防釣りの必需品。",
    methodKeywords: [],
    seasons: ["all"],
    category: "wear",
  },
  {
    id: "af-fishing-vest",
    name: "釣り用ベスト",
    url: "https://amzn.to/4kLuCTM",
    description: "小物をすぐ取り出せるフィッシングベスト。仕掛けやハサミなどをポケットに整理でき、釣りが格段に楽になります。",
    methodKeywords: [],
    seasons: ["all"],
    category: "wear",
  },
  {
    id: "af-polarized-glasses",
    name: "偏光サングラス",
    url: "https://amzn.to/3ZPBnuq",
    description: "水面の反射を抑えて魚が見える偏光グラス。調光レンズで天候を選ばず使えます。軽量コンパクトフレームで長時間でも快適。",
    methodKeywords: ["サイトフィッシング", "エギング", "アジング", "メバリング", "渓流ルアー"],
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-shimano-polarized-wellington",
    name: "シマノ 偏光グラス ウェリントングラス01",
    url: "https://amzn.to/4rzZOHr",
    description: "普段使いから釣りまで使えるシマノの定番偏光グラス。水面の反射を抑え、地形や潮の流れが見えるようになり釣果アップに直結。軽量フレームとテンプル特殊素材で長時間でも快適。紫外線カットで目の保護にも。",
    methodKeywords: ["サイトフィッシング", "エギング", "アジング", "メバリング", "渓流ルアー", "ショアジギ", "ルアー", "フカセ"],
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-line-recycler",
    name: "第一精工 高速リサイクラー2.0",
    url: "https://amzn.to/40kfHGS",
    description: "ラインの巻き替えが驚くほど楽になる高速リサイクラー。ライン交換の手間を大幅に短縮できます。",
    methodKeywords: [],
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-water",
    name: "飲料水（まとめ買い）",
    url: "https://amzn.to/3OWQtfi",
    description: "釣り場での水分補給は必須。特に夏場は熱中症対策として最低1リットルは持参しましょう。まとめ買いでストックしておくと安心です。",
    methodKeywords: [],
    seasons: ["all"],
    category: "accessory",
  },
  {
    id: "af-sagoshiz",
    name: "ダイワ サゴシーZ 95HS（サワラ専用ミノー）",
    url: "https://amzn.to/4ldWbp4",
    description: "サワラ（サゴシ）専用設計のヘビーシンキングミノー。高速巻きでの安定スイムがサワラの捕食本能を刺激。飛距離も抜群でショアからのサワラ狙いに最適です。",
    methodKeywords: ["ショアジギ", "ルアー", "キャスティング"],
    seasons: ["spring", "autumn"],
    category: "tackle",
  },
  {
    id: "af-jet-sinker",
    name: "ジェット天秤",
    url: "https://amzn.to/4l7BnQg",
    description: "ちょい投げ・投げ釣りの必需品。遠投性能が高く、海底を引いても根がかりしにくい設計です。",
    methodKeywords: ["ちょい投げ", "投げ釣り", "カレイ", "キス"],
    seasons: ["all"],
    category: "tackle",
  },
  {
    id: "af-drivemap-osaka-harima",
    name: "令和版 海釣りドライブマップ② 大阪湾〜播磨灘",
    url: "https://amzn.to/4qTgsSj",
    description: "大阪湾から播磨灘までの釣り場を網羅したドライブマップ。各ポイントのアクセス・駐車場・トイレ情報が詳しく、初めての釣り場でも安心です。",
    methodKeywords: [],
    seasons: ["all"],
    category: "book",
    prefectures: ["大阪府", "兵庫県"],
  },
  {
    id: "af-drivemap-ise-kito",
    name: "令和版 海釣りドライブマップ① 伊勢湾〜紀東",
    url: "https://amzn.to/4sp5Go3",
    description: "伊勢湾から紀東エリアの釣り場を完全収録したドライブマップ。ポイントごとの釣れる魚・時期・仕掛けも紹介されており、釣行計画に最適です。",
    methodKeywords: [],
    seasons: ["all"],
    category: "book",
    prefectures: ["三重県", "和歌山県"],
  },
  {
    id: "af-drivemap-tokyo-boso",
    name: "令和版 海釣りドライブマップ① 東京湾〜房総半島",
    url: "https://amzn.to/4lkVquI",
    description: "東京湾から房総半島までの釣り場を完全収録したドライブマップ。各ポイントの釣れる魚・アクセス・駐車場情報が充実しており、関東の釣行計画に最適です。",
    methodKeywords: [],
    seasons: ["all"],
    category: "book",
    prefectures: ["東京都", "神奈川県", "千葉県"],
  },
  {
    id: "af-drivemap-tokyo-miura",
    name: "令和版 海釣りドライブマップ 東京湾〜三浦半島",
    url: "https://amzn.to/4sxzoHj",
    description: "東京湾から三浦半島エリアの釣り場を網羅したドライブマップ。横須賀・三浦・葉山など人気ポイントのアクセス・駐車場・釣れる魚が詳しく、初めての釣り場でも安心です。",
    methodKeywords: [],
    seasons: ["all"],
    category: "book",
    prefectures: ["東京都", "神奈川県"],
  },
  {
    id: "af-drivemap-sagami",
    name: "令和版 相模湾海釣りドライブマップ",
    url: "https://amzn.to/4b0Z5Zy",
    description: "相模湾エリアの釣り場を完全収録したドライブマップ。湘南・小田原・真鶴など人気ポイントの釣れる魚・アクセス・駐車場情報が充実しています。",
    methodKeywords: [],
    seasons: ["all"],
    category: "book",
    prefectures: ["神奈川県", "静岡県"],
  },
];

/**
 * スポットの釣り方リストと現在の月に基づいて、関連するアフィリエイト商品を返す
 * @param methods スポットのcatchableFishから取得した釣り方の配列
 * @param currentMonth 現在の月 (1-12)
 * @param maxItems 最大表示数（デフォルト3）
 * @param isNightFishing 夜釣りが可能なスポットかどうか
 * @param prefecture スポットの都道府県（地域限定商品のフィルタに使用）
 */
export function getRelevantAffiliateProducts(
  methods: string[],
  currentMonth: number,
  maxItems: number = 3,
  isNightFishing: boolean = false,
  prefecture?: string
): AffiliateProduct[] {
  const currentSeason = getSeasonFromMonth(currentMonth);

  // 夜釣り関連の商品ID
  const nightFishingProductIds = ["af-mobile-battery", "af-anker-charger"];

  // 各商品のスコアリング
  const scored = affiliateProducts
    .filter((product) => {
      // 季節フィルタ: "all" を含むか、現在の季節と一致するもののみ
      if (!product.seasons.includes("all") && !product.seasons.includes(currentSeason)) return false;
      // 都道府県限定商品: 対象外なら除外
      if (product.prefectures && product.prefectures.length > 0) {
        if (!prefecture || !product.prefectures.includes(prefecture)) return false;
      }
      return true;
    })
    .map((product) => {
      let score = 0;

      if (product.methodKeywords.length === 0) {
        // 全釣法対象商品（手袋、バッテリー等）は低めのベーススコア
        score = 1;
        // 都道府県限定の書籍はスコアブースト
        if (product.prefectures && product.prefectures.length > 0) {
          score = 8;
        }
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

      // 夜釣り可能なスポットではモバイルバッテリー系のスコアをブースト
      if (isNightFishing && nightFishingProductIds.includes(product.id)) {
        score += 15;
      }

      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxItems).map((item) => item.product);
}
