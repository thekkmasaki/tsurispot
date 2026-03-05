import type { Metadata } from "next";
import Link from "next/link";
import {
  ChefHat,
  Fish,
  Snowflake,
  Award,
  Scissors,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FishRecipeTabs } from "./fish-recipe-tabs";

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title:
    "釣った魚の簡単レシピ集｜アジ・サバ・メバルなど10魚種｜ツリスポ",
  description:
    "釣った魚を美味しく食べるための初心者向けレシピ集。アジの刺身・なめろう、サバの味噌煮、メバルの煮付け、カサゴの味噌汁、クロダイの刺身、シーバスのムニエル、アオリイカの天ぷらなど10魚種・全27レシピ。下処理の基本から保存方法まで完全解説。",
  openGraph: {
    title: "釣った魚の簡単レシピ集｜10魚種27レシピ｜ツリスポ",
    description:
      "アジ・サバ・イワシ・メバル・カサゴ・クロダイ・シーバス・アオリイカ・キス・カレイの簡単レシピ27品と下処理・保存方法を徹底解説。",
    type: "article",
    url: "https://tsurispot.com/guide/fish-recipes",
    siteName: "ツリスポ",
    images: [{
      url: `/api/og?title=${encodeURIComponent("釣った魚の簡単レシピ集")}&emoji=${encodeURIComponent("🍳")}`,
      width: 1200,
      height: 630,
    }],
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/fish-recipes",
  },
};

/* ------------------------------------------------------------------ */
/*  JSON-LD structured data                                           */
/* ------------------------------------------------------------------ */

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://tsurispot.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "釣りの始め方ガイド",
      item: "https://tsurispot.com/guide",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "釣った魚の簡単レシピ集",
      item: "https://tsurispot.com/guide/fish-recipes",
    },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "釣った魚の簡単レシピ集｜10魚種27レシピ",
  description:
    "釣った魚を美味しく食べるための初心者向けレシピ集。下処理のやり方から三枚おろし、保存方法まで完全解説。",
  datePublished: "2026-03-05",
  dateModified: new Date().toISOString().split("T")[0],
  author: {
    "@type": "Person",
    name: "正木 家康",
    jobTitle: "編集長",
    url: "https://tsurispot.com/about",
  },
  publisher: {
    "@type": "Organization",
    name: "ツリスポ",
    url: "https://tsurispot.com",
    logo: {
      "@type": "ImageObject",
      url: "https://tsurispot.com/logo.svg",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://tsurispot.com/guide/fish-recipes",
  },
};

/** Recipe JSON-LD（代表的なレシピ） */
const recipeJsonLdList = [
  {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "アジの刺身（なめろう風）",
    description:
      "釣りたてのアジを三枚おろしにして薄切りにする基本の刺身。味噌と薬味で叩けば「なめろう」にもアレンジ可能。",
    author: { "@type": "Person", name: "正木 家康" },
    prepTime: "PT10M",
    cookTime: "PT5M",
    totalTime: "PT15M",
    recipeCategory: "魚料理",
    recipeCuisine: "日本料理",
    recipeIngredient: [
      "アジ 2尾",
      "大葉 3枚",
      "生姜 1片",
      "醤油 適量",
      "味噌 大さじ1（なめろうの場合）",
    ],
    recipeInstructions: [
      {
        "@type": "HowToStep",
        text: "アジのウロコを取り、頭を落として内臓を除く。",
      },
      {
        "@type": "HowToStep",
        text: "三枚おろしにし、腹骨をすき取る。皮を引く。",
      },
      {
        "@type": "HowToStep",
        text: "刺身：薄切りにして大葉と生姜を添え、醤油でいただく。",
      },
      {
        "@type": "HowToStep",
        text: "なめろう：身を細かく刻み、味噌・大葉・生姜と一緒にたたいて混ぜ合わせる。",
      },
    ],
    recipeYield: "2人分",
  },
  {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "サバの味噌煮",
    description:
      "脂がのったサバをコクのある味噌ダレでじっくり煮込む定番の家庭料理。ご飯が何杯でもすすむ。",
    author: { "@type": "Person", name: "正木 家康" },
    prepTime: "PT10M",
    cookTime: "PT20M",
    totalTime: "PT30M",
    recipeCategory: "魚料理",
    recipeCuisine: "日本料理",
    recipeIngredient: [
      "サバ 半身（2切れ）",
      "味噌 大さじ3",
      "酒 100ml",
      "みりん 大さじ2",
      "砂糖 大さじ1",
      "生姜 1片（薄切り）",
      "水 150ml",
    ],
    recipeInstructions: [
      {
        "@type": "HowToStep",
        text: "サバを食べやすい大きさに切り、皮に十字の切り込みを入れる。熱湯をかけて霜降りにする。",
      },
      {
        "@type": "HowToStep",
        text: "鍋に水・酒・みりん・砂糖・生姜を入れて煮立て、サバを並べる。",
      },
      {
        "@type": "HowToStep",
        text: "落とし蓋をして中火で15分煮たら、味噌を溶き入れてさらに5分煮込む。",
      },
    ],
    recipeYield: "2人分",
  },
  {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "カサゴの味噌汁",
    description:
      "丸ごとのカサゴから出る極上の出汁が決め手。身もホロホロで最高の一杯に。",
    author: { "@type": "Person", name: "正木 家康" },
    prepTime: "PT5M",
    cookTime: "PT15M",
    totalTime: "PT20M",
    recipeCategory: "汁物",
    recipeCuisine: "日本料理",
    recipeIngredient: [
      "カサゴ 1尾",
      "味噌 大さじ2",
      "豆腐 1/4丁",
      "長ネギ 適量",
      "水 600ml",
    ],
    recipeInstructions: [
      {
        "@type": "HowToStep",
        text: "カサゴのウロコ・エラ・内臓を取り、水洗いして水気を拭く。",
      },
      {
        "@type": "HowToStep",
        text: "鍋に水とカサゴを入れ、中火にかける。アクを丁寧に取る。",
      },
      {
        "@type": "HowToStep",
        text: "10分ほど煮たら豆腐を加え、火を弱めて味噌を溶き入れる。",
      },
      {
        "@type": "HowToStep",
        text: "器に盛り、刻みネギを散らして完成。",
      },
    ],
    recipeYield: "2人分",
  },
  {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "キスの天ぷら",
    description:
      "釣りたてのキスをカラッと揚げる王道天ぷら。サクサクの衣とふわふわの身が絶品。",
    author: { "@type": "Person", name: "正木 家康" },
    prepTime: "PT15M",
    cookTime: "PT10M",
    totalTime: "PT25M",
    recipeCategory: "揚げ物",
    recipeCuisine: "日本料理",
    recipeIngredient: [
      "キス 6尾",
      "天ぷら粉 100g",
      "冷水 150ml",
      "揚げ油 適量",
      "天つゆ・塩 お好みで",
    ],
    recipeInstructions: [
      {
        "@type": "HowToStep",
        text: "キスのウロコ・頭・内臓を取り、背開きにして骨を外す。",
      },
      {
        "@type": "HowToStep",
        text: "天ぷら粉を冷水で溶く。混ぜすぎないのがサクサクのコツ。",
      },
      {
        "@type": "HowToStep",
        text: "180℃の油でキスを揚げる。衣が固まったら裏返し、きつね色になったら引き上げる。",
      },
      {
        "@type": "HowToStep",
        text: "天つゆや塩でいただく。レモンを添えるとさらに美味しい。",
      },
    ],
    recipeYield: "2人分",
  },
  {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "メバルの煮付け",
    description:
      "春告魚と呼ばれるメバルを甘辛い煮汁でふっくら煮上げる、春を代表する魚料理。",
    author: { "@type": "Person", name: "正木 家康" },
    prepTime: "PT5M",
    cookTime: "PT20M",
    totalTime: "PT25M",
    recipeCategory: "魚料理",
    recipeCuisine: "日本料理",
    recipeIngredient: [
      "メバル 2尾",
      "水 150ml",
      "酒 100ml",
      "醤油 大さじ3",
      "みりん 大さじ3",
      "砂糖 大さじ1",
      "生姜 1片（薄切り）",
    ],
    recipeInstructions: [
      {
        "@type": "HowToStep",
        text: "メバルの両面に浅く切り込みを入れる。",
      },
      {
        "@type": "HowToStep",
        text: "鍋に水・酒・醤油・みりん・砂糖・生姜を入れて煮立てる。",
      },
      {
        "@type": "HowToStep",
        text: "メバルを入れ、落とし蓋をして中火で15分煮る。途中で煮汁をスプーンでかける。",
      },
      {
        "@type": "HowToStep",
        text: "木の芽や針生姜を添えて完成。",
      },
    ],
    recipeYield: "2人分",
  },
  {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: "アオリイカの刺身",
    description:
      "釣りたてのアオリイカの甘みとねっとりした食感は格別。イカ好きにはたまらない一品。",
    author: { "@type": "Person", name: "正木 家康" },
    prepTime: "PT10M",
    cookTime: "PT0M",
    totalTime: "PT10M",
    recipeCategory: "魚料理",
    recipeCuisine: "日本料理",
    recipeIngredient: [
      "アオリイカ 1杯",
      "大葉 3枚",
      "醤油 適量",
      "わさび 適量",
    ],
    recipeInstructions: [
      {
        "@type": "HowToStep",
        text: "胴体と足を引き離し、内臓と軟骨を取り除く。",
      },
      {
        "@type": "HowToStep",
        text: "胴体の皮を丁寧に剥がす。キッチンペーパーで掴むと剥がしやすい。",
      },
      {
        "@type": "HowToStep",
        text: "縦方向に細く切り、大葉を敷いた皿に盛り付ける。わさび醤油でいただく。",
      },
    ],
    recipeYield: "2人分",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "釣った魚はどのくらい保存できますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "適切に下処理した場合、冷蔵（チルド室）で2〜3日、冷凍で約1ヶ月が目安です。刺身で食べる場合は当日〜翌日がベストです。内臓は傷みやすいので、持ち帰ったらできるだけ早く下処理しましょう。",
      },
    },
    {
      "@type": "Question",
      name: "釣った魚の刺身は安全ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "鮮度が良い状態で適切に処理すれば、多くの魚は刺身で食べられます。ただし、アニサキスなどの寄生虫リスクがあるため、内臓を早めに取り除くことが重要です。不安な場合は一度-20℃以下で24時間以上冷凍するか、加熱調理を選びましょう。サバは特にアニサキスリスクが高いので注意が必要です。",
      },
    },
    {
      "@type": "Question",
      name: "三枚おろしが上手くできません。コツはありますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "まずは15cm程度のアジで練習するのがおすすめです。コツは3つ：(1)よく切れる包丁を使う (2)中骨に沿って包丁を滑らせるように動かす (3)一気に切ろうとせず、数回に分けて少しずつ切り進める。最初は身が多少残っても大丈夫です。残った中骨は味噌汁や骨せんべいにして無駄なく使えます。",
      },
    },
    {
      "@type": "Question",
      name: "小さい魚はリリースすべきですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "一般的に10cm以下の魚は食べる身も少ないため、リリースが推奨されます。リリースする場合は、手を水で濡らしてから魚を持ち、素早くやさしく海に戻しましょう。食べる分だけ持ち帰り、それ以外はリリースするのが良いでしょう。",
      },
    },
    {
      "@type": "Question",
      name: "釣った魚を冷凍保存するコツは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "下処理後、キッチンペーパーで水気をしっかり拭き取り、1切れずつラップで空気を抜きながらぴったり包みます。さらにフリーザーバッグに入れ、日付と魚種を記入して冷凍庫へ。急速冷凍できると品質がさらに良くなります。解凍は冷蔵庫で半日かけてゆっくり行うのがベストです。",
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

export interface FishRecipe {
  name: string;
  time: string;
  difficulty: 1 | 2 | 3;
  isRecommended?: boolean;
  ingredients: string[];
  steps: string[];
  tips?: string;
}

export interface FishRecipeData {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  preparation: string;
  recipes: FishRecipe[];
}

const fishRecipeData: FishRecipeData[] = [
  {
    id: "aji",
    name: "アジ",
    slug: "aji",
    emoji: "🐟",
    preparation:
      "ゼイゴ（尾の付け根にあるトゲ状の硬いウロコ）を尾から頭に向かって包丁で削ぎ取ります。その後、ウロコ取り→頭を落とす→内臓を出す→流水で腹の中をきれいに洗って水気を拭き取ります。",
    recipes: [
      {
        name: "刺身・なめろう",
        time: "15分",
        difficulty: 2,
        isRecommended: true,
        ingredients: [
          "アジ 2尾",
          "大葉 3枚",
          "おろし生姜 1片分",
          "醤油 適量",
          "味噌 大さじ1（なめろうの場合）",
          "長ネギ 5cm（なめろうの場合）",
        ],
        steps: [
          "三枚おろしにして腹骨をすき取り、皮を引く",
          "刺身：薄切りにして大葉・おろし生姜と盛り付け。醤油でいただく",
          "なめろう：身を細かく刻み、味噌・大葉・生姜・ネギと一緒にトントン叩いて混ぜ合わせる。ご飯にも酒の肴にも最高",
        ],
        tips: "なめろうは粘りが出るまでしっかり叩くのがコツ。残ったら焼いて「さんが焼き」にもアレンジできます",
      },
      {
        name: "アジフライ",
        time: "20分",
        difficulty: 1,
        ingredients: [
          "アジ 2尾",
          "小麦粉 適量",
          "溶き卵 1個分",
          "パン粉 適量",
          "塩・コショウ 少々",
          "揚げ油 適量",
        ],
        steps: [
          "三枚おろし（または背開き）にして、塩コショウを軽く振る",
          "小麦粉→溶き卵→パン粉の順に衣をつける",
          "170〜180℃の油できつね色になるまで揚げる（3〜4分）",
          "中濃ソースやタルタルソースを添えて完成",
        ],
        tips: "衣をつける前に水気をしっかり拭くと油はねを防げます。二度揚げするとさらにサクサクに",
      },
      {
        name: "南蛮漬け",
        time: "30分",
        difficulty: 2,
        ingredients: [
          "小アジ 6〜8尾（または大きいアジ2尾）",
          "片栗粉 適量",
          "揚げ油 適量",
          "玉ねぎ 1/2個（スライス）",
          "酢 100ml",
          "醤油 大さじ2",
          "砂糖 大さじ2",
          "鷹の爪 1本",
        ],
        steps: [
          "小アジなら丸ごと、大きいものは三枚おろしにしてひと口大に切る",
          "片栗粉をまぶして170℃の油でカラッと揚げる",
          "酢・醤油・砂糖・鷹の爪・スライス玉ねぎを合わせた南蛮酢を用意",
          "揚げたてのアジを南蛮酢に漬け込む。冷蔵庫で30分以上置くと味が染みて絶品",
        ],
        tips: "翌日はさらに味が染みて美味しくなります。冷蔵で3〜4日保存可能",
      },
    ],
  },
  {
    id: "saba",
    name: "サバ",
    slug: "saba",
    emoji: "🐟",
    preparation:
      "ウロコを取り（サバのウロコは細かいので包丁の背でこする）、頭を落として内臓を出します。血合いをしっかり洗い流すのが臭みを抑えるコツ。サバは傷みが特に早いので、釣ったらすぐに氷締めしましょう。",
    recipes: [
      {
        name: "塩焼き",
        time: "20分",
        difficulty: 1,
        ingredients: [
          "サバ 半身（2切れ）",
          "塩 適量",
          "大根おろし 適量",
          "すだち 1個",
        ],
        steps: [
          "サバを食べやすい大きさに切り、両面にまんべんなく塩を振る",
          "20分ほど置いて出てきた水分をキッチンペーパーで拭き取る",
          "グリルを強火で予熱し、皮目を上にして中火で7〜8分焼く。裏返して5分焼く",
          "大根おろしとすだちを添えて完成。脂がのったサバはシンプルな塩焼きが一番旨い",
        ],
        tips: "塩を振って出てくる水分が臭みの元。しっかり拭き取るのが美味しく焼くコツです",
      },
      {
        name: "味噌煮",
        time: "30分",
        difficulty: 2,
        isRecommended: true,
        ingredients: [
          "サバ 半身（2切れ）",
          "味噌 大さじ3",
          "酒 100ml",
          "みりん 大さじ2",
          "砂糖 大さじ1",
          "生姜 1片（薄切り）",
          "水 150ml",
        ],
        steps: [
          "サバを食べやすい大きさに切り、皮に十字の切り込みを入れる。熱湯をかけて臭みを取る（霜降り）",
          "鍋に水・酒・みりん・砂糖・生姜スライスを入れて煮立て、サバを並べる",
          "落とし蓋をして中火で15分煮たら、味噌を溶き入れてさらに5分煮込む",
          "煮汁をかけながら照りを出して完成。ご飯が何杯でもすすむ定番料理",
        ],
        tips: "味噌は火を弱めてから溶き入れると風味が飛びません。生姜は多めが美味しい",
      },
      {
        name: "しめ鯖",
        time: "30分＋漬け時間",
        difficulty: 3,
        ingredients: [
          "サバ 半身",
          "塩 たっぷり",
          "酢 200ml",
          "砂糖 大さじ1",
          "昆布 5cm角1枚",
        ],
        steps: [
          "三枚おろしにした身の両面にたっぷりの塩を振り、バットに並べて冷蔵庫で2〜3時間置く",
          "塩を洗い流し、水気を拭き取ったら酢（砂糖・昆布入り）に30分〜1時間漬ける",
          "酢から引き上げ、腹骨をすき取り、血合い骨を毛抜きで抜く。皮を頭側から剥がす",
          "好みの厚さに切って盛り付ける。辛子醤油や酢醤油でいただく",
        ],
        tips: "アニサキス対策として、一度-20℃以下で24時間以上冷凍してから作ると安心です",
      },
    ],
  },
  {
    id: "iwashi",
    name: "イワシ",
    slug: "iwashi",
    emoji: "🐠",
    preparation:
      "ウロコは手でこするだけで簡単に取れます。頭を落としたら腹を少し切り開いて内臓を出し、流水で洗います。イワシは身が柔らかく傷みやすいので、手早く処理するのがポイントです。",
    recipes: [
      {
        name: "刺身・手開き",
        time: "10分",
        difficulty: 1,
        isRecommended: true,
        ingredients: [
          "イワシ 4尾",
          "大葉 3枚",
          "おろし生姜 1片分",
          "醤油 適量",
        ],
        steps: [
          "頭を落として内臓を出し、流水で洗う",
          "親指を中骨に沿わせるようにして、頭側から尾に向かって身を開く（包丁不要）",
          "中骨を尾の付け根で折って取り外す。腹骨もすき取る",
          "皮を頭側からゆっくり剥がし、薄切りにして生姜醤油でいただく",
        ],
        tips: "イワシの手開きは包丁不要で初心者にも簡単。鮮度が良いほど身がしっかりして開きやすい",
      },
      {
        name: "つみれ汁",
        time: "25分",
        difficulty: 2,
        ingredients: [
          "イワシ 4〜6尾",
          "味噌 大さじ1",
          "おろし生姜 1片分",
          "片栗粉 大さじ1",
          "長ネギ 1/2本",
          "だし汁 600ml",
          "醤油 大さじ1",
        ],
        steps: [
          "手開きにしたイワシの身を包丁で細かく叩く",
          "叩いた身に味噌・おろし生姜・片栗粉・刻みネギを加えてよく練り混ぜる",
          "鍋にだし汁を沸かし、スプーンで丸めたつみれを落としていく",
          "つみれが浮き上がったら2〜3分煮て、醤油で味を調えて完成",
        ],
        tips: "つみれは練りすぎないのがふんわり仕上がるコツ。体が温まる優しい味わい",
      },
      {
        name: "蒲焼き",
        time: "15分",
        difficulty: 1,
        ingredients: [
          "イワシ 4尾",
          "片栗粉 適量",
          "醤油 大さじ2",
          "みりん 大さじ2",
          "酒 大さじ2",
          "砂糖 大さじ1",
          "サラダ油 大さじ1",
        ],
        steps: [
          "手開きにしたイワシに片栗粉を薄くまぶす",
          "フライパンに油を引き、中火で両面を焼く（皮目から）",
          "醤油・みりん・酒・砂糖を混ぜたタレを回しかける",
          "タレを絡めながら照りが出るまで焼き上げる。ご飯に載せて蒲焼き丼にしても美味しい",
        ],
        tips: "タレは事前に混ぜ合わせておくと手際よく調理できます",
      },
    ],
  },
  {
    id: "mebaru",
    name: "メバル",
    slug: "mebaru",
    emoji: "🐟",
    preparation:
      "ウロコを取り、エラと内臓を出します。メバルのウロコは細かいので、ウロコ取りでしっかりこすりましょう。背ビレにトゲがあるので注意。丸ごと調理に向いた魚です。",
    recipes: [
      {
        name: "煮付け",
        time: "25分",
        difficulty: 2,
        isRecommended: true,
        ingredients: [
          "メバル 2尾",
          "水 150ml",
          "酒 100ml",
          "醤油 大さじ3",
          "みりん 大さじ3",
          "砂糖 大さじ1",
          "生姜 1片（薄切り）",
        ],
        steps: [
          "メバルの両面に浅く切り込みを入れる",
          "鍋に水・酒・醤油・みりん・砂糖・生姜を入れて煮立てる",
          "メバルを入れ、落とし蓋をして中火で15分煮る。途中で煮汁をスプーンでかける",
          "仕上げに木の芽や針生姜を添える。「春告魚」の名にふさわしい上品な旨み",
        ],
        tips: "煮付けは煮汁を先に煮立ててから魚を入れるのが基本。身崩れしにくくなります",
      },
      {
        name: "塩焼き",
        time: "20分",
        difficulty: 1,
        ingredients: [
          "メバル 2尾",
          "塩 適量",
          "レモン 1/2個",
        ],
        steps: [
          "下処理したメバルの両面に塩を振り、20分ほど置いて水気を出す",
          "表面の水気をキッチンペーパーで拭き取る",
          "グリルを強火で予熱し、中火で片面7〜8分ずつ焼く",
          "皮がパリッと焼けたら完成。レモンを搾っていただく",
        ],
        tips: "シンプルながら素材の良さが際立つ食べ方。化粧塩（ヒレに多めの塩）をすると見栄えも良い",
      },
    ],
  },
  {
    id: "kasago",
    name: "カサゴ",
    slug: "kasago",
    emoji: "🐡",
    preparation:
      "背ビレや胸ビレにトゲがあるので、キッチンバサミで先に切り落とすと安全です。ウロコを取り、エラと内臓を出して流水で洗います。丸ごと調理することが多い魚なので、ウロコの取り残しがないよう丁寧に処理しましょう。",
    recipes: [
      {
        name: "味噌汁",
        time: "20分",
        difficulty: 1,
        isRecommended: true,
        ingredients: [
          "カサゴ 1尾",
          "味噌 大さじ2",
          "豆腐 1/4丁",
          "長ネギ 適量",
          "水 600ml",
        ],
        steps: [
          "下処理したカサゴを丸ごと（大きい場合は半分に切る）鍋に入れる",
          "水を加えて中火にかけ、沸いたらアクを丁寧に取る",
          "弱火で10〜15分じっくり煮出す。カサゴから極上の出汁が出る",
          "豆腐を加えて温まったら、火を弱めて味噌を溶き入れる。刻みネギを散らして完成",
        ],
        tips: "釣り人が「一番うまい」と口を揃える逸品。出汁が出るので昆布やだしの素は不要です",
      },
      {
        name: "唐揚げ（丸ごと二度揚げ）",
        time: "20分",
        difficulty: 2,
        ingredients: [
          "カサゴ 2尾",
          "片栗粉 適量",
          "塩 少々",
          "揚げ油 適量",
          "レモン 1/2個",
        ],
        steps: [
          "下処理したカサゴに塩を振って10分置き、水気を拭く",
          "片栗粉をまんべんなくまぶし、160℃の油で5〜6分じっくり揚げる（一度目）",
          "いったん取り出して3分休ませる",
          "180℃に上げた油で1〜2分揚げる（二度目）。ヒレや骨までパリパリに仕上がる",
        ],
        tips: "二度揚げすることで骨までカリカリに。丸ごとかぶりつけるのが最高の贅沢",
      },
    ],
  },
  {
    id: "kurodai",
    name: "クロダイ（チヌ）",
    slug: "kurodai",
    emoji: "🐟",
    preparation:
      "ウロコが硬くて大きいので、ウロコ取りでしっかり処理します。頭を落として内臓を出し、血合いを流水で丁寧に洗い流します。三枚おろしが基本。臭みが気になる場合は、塩を振ってしばらく置き、出てきた水分を拭き取ってから調理しましょう。",
    recipes: [
      {
        name: "刺身",
        time: "15分",
        difficulty: 2,
        isRecommended: true,
        ingredients: [
          "クロダイ 1尾（30cm以上）",
          "大葉 3枚",
          "おろしわさび 適量",
          "醤油 適量",
        ],
        steps: [
          "三枚おろしにして腹骨をすき取り、血合い骨を毛抜きで抜く",
          "皮を引き、刺身にする。薄造りか平造りはお好みで",
          "大葉を敷いた皿に盛り付け、わさびを添える",
          "醤油でいただく。釣りたてのクロダイは上品な甘みと歯ごたえが楽しめる",
        ],
        tips: "皮を引く際は、尾側の端をしっかり押さえながら包丁を寝かせて滑らせるとうまくいきます",
      },
      {
        name: "塩焼き",
        time: "25分",
        difficulty: 1,
        ingredients: [
          "クロダイ 切り身2切れ（または1尾丸ごと）",
          "塩 適量",
          "すだち 1個",
          "大根おろし 適量",
        ],
        steps: [
          "切り身の場合は両面に塩を振る。丸ごとの場合は腹に切り込みを入れて塩を振る",
          "20分ほど置いて出てきた水分をキッチンペーパーで拭き取る",
          "グリルを予熱し、中火で両面をしっかり焼く（片面7〜8分目安）",
          "大根おろしとすだちを添えて完成。淡泊で上品な白身が堪能できる",
        ],
        tips: "丸ごと焼く場合は化粧塩（ヒレに多めの塩）をつけると焦げ防止に。見た目も美しく仕上がります",
      },
    ],
  },
  {
    id: "seabass",
    name: "シーバス（スズキ）",
    slug: "seabass",
    emoji: "🐟",
    preparation:
      "ウロコが大きく硬いので、ウロコ取りでしっかり処理します。頭を落とし、内臓を出して血合いを流水でよく洗い流します。大型が多いので三枚おろしが基本。身は淡泊で臭みの少ない上質な白身です。",
    recipes: [
      {
        name: "洗い（刺身）",
        time: "15分",
        difficulty: 2,
        isRecommended: true,
        ingredients: [
          "シーバス 半身",
          "氷水 ボウル1杯",
          "大葉 3枚",
          "みょうが 1本",
          "ポン酢または梅肉醤油 適量",
        ],
        steps: [
          "三枚おろしにして皮を引き、薄造りにする",
          "氷水をボウルに用意し、切った身をサッとくぐらせる（身がキュッと締まる）",
          "氷水から引き上げ、キッチンペーパーで水気を取る",
          "大葉やみょうがを添え、ポン酢や梅肉醤油でいただく",
        ],
        tips: "夏場のスズキは脂がのっていて、洗いにすると格別。氷水に浸すのは数秒でOK",
      },
      {
        name: "ムニエル",
        time: "20分",
        difficulty: 2,
        ingredients: [
          "シーバス 切り身2切れ",
          "バター 大さじ2",
          "オリーブオイル 大さじ1",
          "小麦粉 適量",
          "塩・コショウ 少々",
          "レモン汁 大さじ1",
        ],
        steps: [
          "切り身に塩コショウを振り、小麦粉を薄くまぶす（余分な粉は落とす）",
          "フライパンにバター大さじ1とオリーブオイルを熱し、皮目から中火で焼く",
          "皮がパリッとしたら裏返し、蓋をして弱火で3分ほど蒸し焼きにする",
          "仕上げにバター大さじ1とレモン汁を加え、ソースをスプーンでかけながら仕上げる",
        ],
        tips: "バターは焦がさないよう注意。ワインにもよく合う洋風メニューです",
      },
    ],
  },
  {
    id: "aoriika",
    name: "アオリイカ",
    slug: "aoriika",
    emoji: "🦑",
    preparation:
      "胴体と足をゆっくり引き離し、内臓と墨袋を取り除きます。胴体の中にある透明な軟骨（フネ）を引き抜きます。胴体の皮は外側の茶色い薄皮と内側の透明な薄皮の2枚があるので、両方丁寧に剥がしましょう。",
    recipes: [
      {
        name: "刺身",
        time: "10分",
        difficulty: 1,
        isRecommended: true,
        ingredients: [
          "アオリイカ 1杯",
          "大葉 3枚",
          "醤油 適量",
          "わさび 適量",
        ],
        steps: [
          "胴体と足を引き離し、内臓と軟骨を取り除く",
          "胴体の皮を丁寧に剥がす。キッチンペーパーで掴むと剥がしやすい",
          "縦方向に細く切り（糸造り）、大葉を敷いた皿に盛り付ける",
          "わさび醤油でいただく。ねっとりとした甘みは釣りたてならでは",
        ],
        tips: "包丁を入れる方向で食感が変わります。繊維に沿って縦に切るとねっとり、横に切るとコリコリに",
      },
      {
        name: "天ぷら",
        time: "20分",
        difficulty: 2,
        ingredients: [
          "アオリイカ 1杯",
          "天ぷら粉 100g",
          "冷水 150ml",
          "揚げ油 適量",
          "天つゆ・塩 お好みで",
        ],
        steps: [
          "下処理した胴体を開いて、食べやすい大きさに切る。表面に浅く格子状の切り込みを入れる",
          "水気をしっかり拭き取り、天ぷら粉を冷水で溶く",
          "180℃の油でサッと揚げる（1〜2分）。揚げすぎると硬くなるので注意",
          "天つゆや塩でいただく。プリプリの食感がたまらない",
        ],
        tips: "格子状の切り込みが油はね防止と火の通りの均一化に効果的。揚げ時間は短めがコツ",
      },
    ],
  },
  {
    id: "kisu",
    name: "キス",
    slug: "kisu",
    emoji: "🐟",
    preparation:
      "ウロコを取り、頭を落として内臓を出します。キスは身が細いので、背開きにするのが基本。包丁を背中側から入れて中骨に沿って開き、腹骨と中骨をすき取ります。",
    recipes: [
      {
        name: "天ぷら",
        time: "25分",
        difficulty: 2,
        isRecommended: true,
        ingredients: [
          "キス 6尾",
          "天ぷら粉 100g",
          "冷水 150ml",
          "揚げ油 適量",
          "天つゆ・塩 お好みで",
        ],
        steps: [
          "キスを背開きにして骨を外し、水気をしっかり拭き取る",
          "天ぷら粉を冷水で溶く。ダマが少し残るくらいでOK（混ぜすぎ注意）",
          "180℃の油にキスを衣にくぐらせてから静かに入れる。衣が固まるまで触らない",
          "きつね色になったら引き上げて油を切る。天つゆでも塩でも美味しい",
        ],
        tips: "「最高の天ぷらネタ」として釣り人の間で愛される一品。衣は薄めにつけるのが上品に仕上がるコツ",
      },
      {
        name: "塩焼き",
        time: "15分",
        difficulty: 1,
        ingredients: [
          "キス 6尾",
          "塩 適量",
          "すだち 1個",
        ],
        steps: [
          "下処理したキスに竹串を波打つように刺す（踊り串）",
          "全体に塩を振り、ヒレには化粧塩（多めの塩）をつける",
          "グリルの強火で片面4〜5分ずつ焼く",
          "香ばしく焼けたらすだちを添えて完成",
        ],
        tips: "踊り串を打つと見栄えが良く、均一に火が通ります。上品な白身の味わいを楽しめる",
      },
    ],
  },
  {
    id: "karei",
    name: "カレイ",
    slug: "karei",
    emoji: "🐟",
    preparation:
      "表側（目のある方）のウロコを尾から頭に向かって取ります。裏側（白い方）はウロコが少ないので軽くこする程度でOK。頭を落とし、内臓を出して流水で洗います。縁側（ヒレの付け根の身）は珍味なので残しましょう。",
    recipes: [
      {
        name: "煮付け",
        time: "25分",
        difficulty: 2,
        isRecommended: true,
        ingredients: [
          "カレイ 2切れ（または1尾丸ごと）",
          "水 150ml",
          "酒 100ml",
          "醤油 大さじ3",
          "みりん 大さじ3",
          "砂糖 大さじ1",
          "生姜 1片（薄切り）",
        ],
        steps: [
          "カレイの表側に浅くX字の切り込みを入れる（味が染みやすくなる）",
          "鍋に水・酒・醤油・みりん・砂糖・生姜を入れて煮立てる",
          "カレイを入れ、落とし蓋をして中火で15分煮る。途中で煮汁をスプーンでかける",
          "煮汁にとろみが出たら完成。身離れが良く、ふっくらした白身が絶品",
        ],
        tips: "煮付けはカレイ料理の王道。縁側のゼラチン質がとろけて美味しい。木綿豆腐を一緒に煮ても合います",
      },
      {
        name: "唐揚げ",
        time: "20分",
        difficulty: 1,
        ingredients: [
          "カレイ 2切れ（小ぶりなら丸ごと）",
          "片栗粉 適量",
          "塩・コショウ 少々",
          "揚げ油 適量",
          "レモン 1/2個",
        ],
        steps: [
          "カレイに塩コショウを振って10分置き、出てきた水気を拭く",
          "片栗粉をまんべんなくまぶす",
          "170℃の油で5〜6分、こんがりと揚げる。小さいカレイなら骨ごと食べられる",
          "レモンを添えて完成。外はカリカリ、中はふわふわの食感が楽しめる",
        ],
        tips: "小ぶりのカレイは二度揚げすると骨までパリパリに。ビールのお供に最高",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Shared sub-components (server)                                    */
/* ------------------------------------------------------------------ */

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          {Icon && <Icon className="size-5 text-primary" />}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function FishRecipesGuidePage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      {recipeJsonLdList.map((r, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(r) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />

      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* パンくず */}
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "釣りガイド", href: "/guide" },
            { label: "釣った魚の簡単レシピ集" },
          ]}
        />

        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣った魚の簡単レシピ集
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            10魚種・全27レシピ｜初心者でもできるシンプルな調理法
          </p>
        </div>

        {/* リード文 */}
        <div className="mb-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">
            釣った魚は鮮度が命。
          </span>
          スーパーの魚とは段違いの美味しさを体験できるのが釣り人の特権です。このページでは、堤防・サビキ・エギングなどでよく釣れる10魚種（アジ・サバ・イワシ・メバル・カサゴ・クロダイ・シーバス・アオリイカ・キス・カレイ）について、初心者でもできる全27レシピを紹介します。各レシピに材料・手順・コツを掲載しているので、釣った日にすぐ作れます。
        </div>

        {/* 目次 */}
        <div className="mb-8 rounded-lg border p-4">
          <h2 className="mb-3 text-base font-bold">このページの内容</h2>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            <li>
              <a href="#preparation" className="text-primary hover:underline">
                下処理の基本（ウロコ取り・内臓処理・三枚おろし）
              </a>
            </li>
            <li>
              <a href="#recipes" className="text-primary hover:underline">
                魚種別レシピ（10魚種・27品）
              </a>
            </li>
            <li>
              <a href="#storage" className="text-primary hover:underline">
                保存方法（クーラーボックス・冷蔵・冷凍）
              </a>
            </li>
            <li>
              <a href="#faq" className="text-primary hover:underline">
                よくある質問
              </a>
            </li>
          </ul>
        </div>

        {/* ---- 基本の下処理セクション ---- */}
        <div id="preparation" className="mb-8 space-y-6">
          <SectionCard title="下処理の基本" icon={Scissors}>
            <p className="mb-4 text-sm text-muted-foreground">
              どの魚を料理するにも、まず下処理が必要です。慣れれば5分で終わる基本の4ステップを覚えましょう。
            </p>
            <ol className="list-none space-y-3">
              {[
                {
                  title: "ウロコを取る",
                  desc: "尾から頭に向かって、包丁の背やウロコ取りでこすります。シンクの中で作業するとウロコの飛び散りを防げます。",
                },
                {
                  title: "エラを取る",
                  desc: "エラ蓋を開き、エラの付け根を切ってエラ全体を引き出します。丸ごと調理する場合は特に重要（臭みの原因になります）。",
                },
                {
                  title: "内臓を出す",
                  desc: "腹を肛門から頭方向に切り開き、内臓をかき出します。苦玉（胆のう）を潰さないよう注意。潰すと身に苦味がうつります。",
                },
                {
                  title: "流水で洗う",
                  desc: "腹の中の血合いを歯ブラシなどでこすり取りながら、流水できれいに洗います。最後にキッチンペーパーで水気をしっかり拭き取ります。",
                },
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard title="三枚おろしの手順" icon={ChefHat}>
            <p className="mb-4 text-sm text-muted-foreground">
              刺身やフライを作るなら三枚おろしは必須スキル。最初は15cm程度のアジで練習するのがおすすめです。
            </p>
            <ol className="list-none space-y-3">
              {[
                {
                  title: "頭を落とす",
                  desc: "胸ビレと腹ビレの後ろに斜めに包丁を入れ、反対側も同様に。中骨を断ち切って頭を切り離します。",
                },
                {
                  title: "腹側から包丁を入れる",
                  desc: "腹側を手前にして、尾から頭方向に中骨に沿って包丁を滑らせます。一度で切ろうとせず、少しずつ切り進めるのがコツ。",
                },
                {
                  title: "背側から包丁を入れる",
                  desc: "魚を反転させ、背中側からも中骨に沿って包丁を入れます。",
                },
                {
                  title: "身を切り離す",
                  desc: "尾の付け根から包丁を入れ、中骨から身を切り離します。これで片身が取れます。",
                },
                {
                  title: "反対側も同様に",
                  desc: "裏返して反対側も同じ手順で身を外します。これで「身2枚＋中骨1枚」の三枚おろし完成。残った中骨はアラ汁や骨せんべいに活用できます。",
                },
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <span className="font-medium">ポイント：</span>
              よく切れる包丁を使うのが上達の近道です。切れない包丁だと力が入りすぎて身が崩れる原因に。出刃包丁がベストですが、なければ普通の三徳包丁でも大丈夫です。
            </div>
          </SectionCard>
        </div>

        {/* ---- 魚種別レシピ（タブ切り替え） ---- */}
        <div id="recipes" className="mb-8">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">
            魚種別レシピ
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            魚を選んでレシピを見ましょう。各レシピに調理時間・材料（2人分）・手順・コツを掲載しています。
          </p>
          <FishRecipeTabs fishData={fishRecipeData} />
        </div>

        {/* ---- 保存方法 ---- */}
        <div id="storage" className="mb-8 space-y-6">
          <SectionCard title="保存方法" icon={Snowflake}>
            <p className="mb-4 text-sm text-muted-foreground">
              美味しく食べるために、釣り場から自宅まで鮮度を落とさない工夫が大切です。
            </p>

            <h3 className="mb-3 font-medium text-foreground">クーラーボックスでの持ち帰り方</h3>
            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
              {[
                {
                  title: "氷は容量の1/3以上",
                  desc: "ペットボトルを凍らせたものや板氷を使うと溶けにくく長持ちします。",
                },
                {
                  title: "小型魚は氷締め",
                  desc: "アジやイワシなどの小型魚は、海水と氷を入れたクーラーボックスに生きたまま入れます。急速に冷えて鮮度が保たれます。",
                },
                {
                  title: "直接氷に触れさせない",
                  desc: "魚は新聞紙やビニール袋で包んでからクーラーボックスに入れると「氷焼け」を防げます。",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">{item.title}</span>
                    &nbsp;&mdash;&nbsp;{item.desc}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="mb-3 font-medium text-foreground">冷蔵・冷凍保存のコツ</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {[
                {
                  title: "帰宅後すぐに下処理",
                  desc: "内臓は最も傷みやすい部分。帰ったらできるだけ早くウロコ・内臓を取り除き、流水で洗いましょう。",
                },
                {
                  title: "冷蔵保存（2〜3日）",
                  desc: "キッチンペーパーで水気を拭き取り、新しいペーパーで包んでからラップで密封。チルド室（0〜2℃）で保存します。",
                },
                {
                  title: "冷凍保存（約1ヶ月）",
                  desc: "1切れずつラップで空気を抜きながらぴったり包み、フリーザーバッグに入れて冷凍庫へ。日付と魚種を記入しておくと便利です。",
                },
                {
                  title: "解凍方法",
                  desc: "冷蔵庫で半日かけてゆっくり解凍するのがベスト。急ぐ場合は流水解凍（ビニール袋に入れて流水に当てる）がおすすめ。電子レンジ解凍は身がパサつくので避けましょう。",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">{item.title}</span>
                    &nbsp;&mdash;&nbsp;{item.desc}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 持って帰れない時 */}
          <SectionCard title="食べきれない時は" icon={Fish}>
            <p className="mb-3 text-sm text-muted-foreground">
              クーラーボックスが一杯になったり、食べきれない量を釣ったりした場合は、迷わずリリースしましょう。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">手を水で濡らしてから魚を持つ</span>
                  &nbsp;&mdash;&nbsp;乾いた手で触ると魚の体表粘膜が傷ついてしまいます。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">できるだけ素早くリリース</span>
                  &nbsp;&mdash;&nbsp;空気中に長く置くほど魚のダメージが大きくなります。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">やさしく海に戻す</span>
                  &nbsp;&mdash;&nbsp;投げ入れず、水面近くでそっと離しましょう。魚が自分で泳ぎ出すのを確認します。
                </span>
              </li>
            </ul>
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">食べる分だけ持ち帰る</span>
              のが釣り人のマナーです。無駄にしないことが、釣り場環境を守ることにもつながります。
            </div>
          </SectionCard>
        </div>

        {/* ---- FAQ ---- */}
        <div id="faq" className="mb-8">
          <SectionCard title="よくある質問" icon={Award}>
            <div className="divide-y">
              {(
                faqJsonLd.mainEntity as {
                  name: string;
                  acceptedAnswer: { text: string };
                }[]
              ).map((faq, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="mb-2 font-medium text-foreground">
                    Q. {faq.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {faq.acceptedAnswer.text}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ---- 関連ガイド ---- */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/guide/fish-handling"
                    className="text-primary hover:underline"
                  >
                    釣った魚の持ち帰り方ガイド
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    - 締め方・血抜き・保冷のコツ
                  </span>
                </li>
                <li>
                  <Link
                    href="/guide/handling"
                    className="text-primary hover:underline"
                  >
                    魚の締め方・持ち帰りガイド（詳細版）
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    - 氷締め・脳締め・血抜き・神経締めの詳細解説
                  </span>
                </li>
                <li>
                  <Link
                    href="/guide/sabiki"
                    className="text-primary hover:underline"
                  >
                    サビキ釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    - アジ・イワシ・サバを狙う初心者の定番
                  </span>
                </li>
                <li>
                  <Link
                    href="/guide/eging"
                    className="text-primary hover:underline"
                  >
                    エギング完全ガイド
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    - アオリイカを狙うルアー釣り
                  </span>
                </li>
                <li>
                  <Link
                    href="/guide/choinage"
                    className="text-primary hover:underline"
                  >
                    ちょい投げ釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    - キス・カレイを狙う釣り方
                  </span>
                </li>
                <li>
                  <Link
                    href="/guide/float-fishing"
                    className="text-primary hover:underline"
                  >
                    ウキ釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    - クロダイ・メジナを狙う釣り方
                  </span>
                </li>
                <li>
                  <Link
                    href="/guide/anazuri"
                    className="text-primary hover:underline"
                  >
                    穴釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    - カサゴ・メバルを狙う釣り方
                  </span>
                </li>
                <li>
                  <Link
                    href="/guide/casting"
                    className="text-primary hover:underline"
                  >
                    投げ釣りガイド
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    - カレイ・キスを遠投で狙う
                  </span>
                </li>
                <li>
                  <Link
                    href="/guide/beginner"
                    className="text-primary hover:underline"
                  >
                    釣り初心者完全ガイド
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    - これから釣りを始める方へ
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            美味しく食べるなら、正しい持ち帰り方も大切です。
          </p>
          <Link
            href="/guide/fish-handling"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            持ち帰り方ガイドへ
          </Link>
        </div>

        <div className="mt-8 sm:mt-12"></div>
      </main>
    </>
  );
}
