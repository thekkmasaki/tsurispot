export interface SeasonInfo {
  slug: string;
  nameJa: string;
  emoji: string;
  months: number[];
  monthSlugs: string[];
  description: string;
  fishingHighlights: string;
  colorTheme: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
}

export const seasons: SeasonInfo[] = [
  {
    slug: "spring",
    nameJa: "春",
    emoji: "\u{1F338}",
    months: [3, 4, 5],
    monthSlugs: ["march", "april", "may"],
    description:
      "春は水温が10\u301c20\u2103へと上昇し、冬の間じっとしていた魚たちが一斉に動き出す季節です。「春告魚」メバルの荒食いやクロダイのノッコミ、アオリイカの春イカシーズンなど、陸っぱりからの釣りが最も楽しくなる時期。桜の季節とともに渓流解禁を迎え、山から海まであらゆるフィールドが活気づきます。",
    fishingHighlights:
      "春の釣りは変化の連続です。3月はメバリングの最盛期で、産卵後の荒食いに入ったメバルがワームやプラグに積極的に反応します。4月になるとクロダイが産卵を控えて浅場に接岸する「ノッコミ」シーズンに突入し、フカセ釣りで50cmオーバーの大型も夢ではありません。5月にはキスのちょい投げが解禁し、アオリイカの春イカも最盛期を迎えます。GW前後はアジのサビキ釣りも安定し始め、ファミリーフィッシングにも最適な季節です。三寒四温の気候に合わせて脱ぎ着しやすい服装と、花粉対策を忘れずに準備しましょう。",
    colorTheme: {
      bg: "bg-pink-50",
      text: "text-pink-800",
      border: "border-pink-200",
      badge: "bg-pink-100 text-pink-800",
    },
  },
  {
    slug: "summer",
    nameJa: "夏",
    emoji: "\u2600\uFE0F",
    months: [6, 7, 8],
    monthSlugs: ["june", "july", "august"],
    description:
      "夏は水温が18\u301c30\u2103に達し、年間で最も多くの魚種が活発になるハイシーズンです。サビキ釣りでアジ・サバ・イワシの数釣りが楽しめ、タチウオの夜釣りや青物のショアジギングなど、初心者から上級者まで夢中になれるターゲットが勢揃いします。梅雨明け後は早朝釣行がベスト、熱中症対策が最優先です。",
    fishingHighlights:
      "夏の釣りは朝夕のゴールデンタイムが勝負です。6月は梅雨の雨後に濁りが入り、アジのサビキ釣りが全開モードに突入。イサキの旬と重なり船釣りの人気も急上昇します。7月には水温23\u301c27\u2103で回遊魚が最も活発になり、タチウオのワインド釣法が開幕。青物（イナダ・ソウダガツオ）のショアジギングもスタートします。8月は最盛期で、サビキの入れ食いやナブラ撃ちが日常になりますが、日中の猛暑は熱中症リスクが極めて高く、早朝4\u301c7時の釣行か夕マズメ以降の夜釣りが鉄則です。クーラーボックスに氷をたっぷり入れて鮮度管理を徹底しましょう。",
    colorTheme: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-800",
    },
  },
  {
    slug: "autumn",
    nameJa: "秋",
    emoji: "\u{1F341}",
    months: [9, 10, 11],
    monthSlugs: ["september", "october", "november"],
    description:
      "秋は魚たちが冬の越冬に向けてエサを荒食いする「食欲の秋」。水温が24\u2103から16\u2103へ徐々に下がるなか、アオリイカの秋シーズン、青物の回遊ピーク、タチウオの最盛期など大物チャンスが目白押しです。気温も過ごしやすく、1年で最も快適に釣りを楽しめる季節といえます。",
    fishingHighlights:
      "秋は「釣りのゴールデンシーズン」です。9月にアオリイカの秋シーズンが開幕し、新子のエギングで数釣りが楽しめます。タチウオは最盛期で堤防から安定した釣果が出続けます。10月は年間ベストの釣り月で、青物（イナダ・ワラサ）が冬を前に荒食いに入り、ショアジギングでナブラを撃つ興奮は格別です。カワハギの肝パンシーズンも始まります。11月は根魚シーズンが本格化し、シーバスのランカー狙いも面白い時期。アジは脂の乗りがピークを迎え、食味のベストシーズンです。台風や日没の早まりに注意しつつ、多彩なターゲットを狙い撃ちましょう。",
    colorTheme: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-200",
      badge: "bg-orange-100 text-orange-800",
    },
  },
  {
    slug: "winter",
    nameJa: "冬",
    emoji: "\u2744\uFE0F",
    months: [12, 1, 2],
    monthSlugs: ["december", "january", "february"],
    description:
      "冬は水温が7\u301c14\u2103に下がり魚の活性は落ちますが、根魚のハイシーズンが到来します。カレイの投げ釣り、メバリング、カサゴの穴釣りなど冬ならではのターゲットが豊富で、人が少ない釣り場で良型を独り占めできるチャンスも。防寒対策を万全にすれば、澄んだ冬空の下で贅沢な釣りが楽しめます。",
    fishingHighlights:
      "冬の釣りは「静の美学」です。12月はカレイの投げ釣りが全盛期を迎え、大潮前後の満潮時に40cmオーバーの良型が期待できます。メバリングが本格シーズンインし、常夜灯周りで産卵前の良型が活発にルアーを追います。1月は最寒期ですが、カサゴの穴釣りは水温低下に関係なく安定した釣果が得られ、ワカサギ釣りも最盛期です。2月はメバリングの最盛期で、スローリトリーブに反応する25cm超の良型も狙えます。管理釣り場ではトラウトフィッシングが快適で、寒さが苦手な方にもおすすめです。防寒装備はインナーからアウターまでの3層構造が基本、温かい飲み物とカイロを必ず持参しましょう。",
    colorTheme: {
      bg: "bg-cyan-50",
      text: "text-cyan-800",
      border: "border-cyan-200",
      badge: "bg-cyan-100 text-cyan-800",
    },
  },
];

export const seasonSlugs = ["spring", "summer", "autumn", "winter"];

export function getSeasonBySlug(slug: string): SeasonInfo | undefined {
  return seasons.find((s) => s.slug === slug);
}

export function getSeasonByMonth(month: number): SeasonInfo | undefined {
  return seasons.find((s) => s.months.includes(month));
}
