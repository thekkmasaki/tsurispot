import { fishSpecies } from "./fish";
import { fishingSpots } from "./spots";
import type { FishSpecies, FishingSpot } from "@/types";

// ===== 釣り方定義 =====
export interface FishingMethodDef {
  slug: string;
  name: string;
  methods: string[]; // fish.fishingMethods.methodName or spot.catchableFish.method に一致するキー
  icon: string;
  guide: string;
  description: string;
}

export const FISHING_METHODS: FishingMethodDef[] = [
  {
    slug: "sabiki",
    name: "サビキ釣り",
    methods: ["サビキ釣り", "ジグサビキ"],
    icon: "🎣",
    guide: "/guide/sabiki",
    description:
      "コマセ（撒き餌）で魚を寄せて、疑似餌の付いたサビキ仕掛けで釣る最も手軽な方法。初心者やファミリーにおすすめ。",
  },
  {
    slug: "choinage",
    name: "ちょい投げ",
    methods: ["ちょい投げ", "投げ釣り", "ぶっこみ釣り"],
    icon: "🏖️",
    guide: "/guide/choinage",
    description:
      "仕掛けを軽く投げて底物を狙う釣り方。キスやカレイなどの砂底の魚が主なターゲット。",
  },
  {
    slug: "float-fishing",
    name: "ウキ釣り",
    methods: ["ウキ釣り", "ウキフカセ", "フカセ釣り", "ウキフカセ釣り"],
    icon: "🔴",
    guide: "/guide/float-fishing",
    description:
      "ウキを使って仕掛けを一定の深さに漂わせて釣る方法。メジナやクロダイなど多彩な魚種が狙える。",
  },
  {
    slug: "eging",
    name: "エギング",
    methods: ["エギング"],
    icon: "🦑",
    guide: "/guide/eging",
    description:
      "エギ（餌木）と呼ばれるルアーでアオリイカやコウイカを狙う釣り方。独特のシャクリアクションが特徴。",
  },
  {
    slug: "lure",
    name: "ルアー",
    methods: [
      "ルアー",
      "メバリング",
      "アジング",
      "ショアジギング",
      "サーフルアーフィッシング",
    ],
    icon: "🐟",
    guide: "/guide/lure",
    description:
      "疑似餌（ルアー）を使って魚を誘い出す釣り方。メバリング、アジング、ショアジギングなど多彩なスタイルがある。",
  },
];

// ===== 月定義 =====
export interface MonthDef {
  slug: string;
  num: number;
  name: string;
  season: string;
}

export const MONTHS: MonthDef[] = [
  { slug: "january", num: 1, name: "1月", season: "冬" },
  { slug: "february", num: 2, name: "2月", season: "冬" },
  { slug: "march", num: 3, name: "3月", season: "春" },
  { slug: "april", num: 4, name: "4月", season: "春" },
  { slug: "may", num: 5, name: "5月", season: "春" },
  { slug: "june", num: 6, name: "6月", season: "夏" },
  { slug: "july", num: 7, name: "7月", season: "夏" },
  { slug: "august", num: 8, name: "8月", season: "夏" },
  { slug: "september", num: 9, name: "9月", season: "秋" },
  { slug: "october", num: 10, name: "10月", season: "秋" },
  { slug: "november", num: 11, name: "11月", season: "秋" },
  { slug: "december", num: 12, name: "12月", season: "冬" },
];

// ===== ヘルパー =====

export function getMethodBySlug(slug: string): FishingMethodDef | undefined {
  return FISHING_METHODS.find((m) => m.slug === slug);
}

export function getMonthBySlug(slug: string): MonthDef | undefined {
  return MONTHS.find((m) => m.slug === slug);
}

/**
 * monthStart/monthEnd のラップ対応判定（10月〜3月のような年またぎ）
 */
export function isMonthInRange(
  month: number,
  start: number,
  end: number
): boolean {
  if (start <= end) {
    return month >= start && month <= end;
  }
  // 年またぎ（例: 10月〜3月）
  return month >= start || month <= end;
}

/**
 * 指定月 × 指定釣り方で釣れる魚一覧
 * fishingMethods に該当メソッド名がある＋seasonMonths にその月が含まれる魚を抽出
 */
export function getFishForMethodAndMonth(
  method: FishingMethodDef,
  monthNum: number
): (FishSpecies & { isPeak: boolean })[] {
  return fishSpecies
    .filter((f) => {
      if (!f.seasonMonths.includes(monthNum)) return false;
      if (!f.fishingMethods || f.fishingMethods.length === 0) return false;
      return f.fishingMethods.some((fm) =>
        method.methods.includes(fm.methodName)
      );
    })
    .map((f) => ({
      ...f,
      isPeak: f.peakMonths.includes(monthNum),
    }))
    .sort((a, b) => {
      // 最盛期の魚を先に
      if (a.isPeak !== b.isPeak) return a.isPeak ? -1 : 1;
      return (a.popularity ?? 999) - (b.popularity ?? 999);
    });
}

/**
 * 指定月 × 指定釣り方でおすすめスポットTOP10
 * catchableFish の method が該当し、monthStart〜monthEnd にその月が含まれるスポットを抽出
 */
export function getSpotsForMethodAndMonth(
  method: FishingMethodDef,
  monthNum: number,
  limit: number = 10
): (FishingSpot & { matchingFishCount: number })[] {
  return fishingSpots
    .filter((spot) =>
      spot.catchableFish.some(
        (cf) =>
          method.methods.includes(cf.method) &&
          isMonthInRange(monthNum, cf.monthStart, cf.monthEnd)
      )
    )
    .map((spot) => ({
      ...spot,
      matchingFishCount: spot.catchableFish.filter(
        (cf) =>
          method.methods.includes(cf.method) &&
          isMonthInRange(monthNum, cf.monthStart, cf.monthEnd)
      ).length,
    }))
    .sort((a, b) => {
      // まずマッチする魚数 → 次に rating
      if (b.matchingFishCount !== a.matchingFishCount)
        return b.matchingFishCount - a.matchingFishCount;
      return b.rating - a.rating;
    })
    .slice(0, limit);
}

/**
 * 月ごとの概要テキスト（水温特徴）
 */
const MONTH_CONDITIONS: Record<
  number,
  { waterTemp: string; feature: string }
> = {
  1: { waterTemp: "8〜12℃", feature: "厳寒期で魚の活性は低め。根魚や底物狙いがメイン" },
  2: { waterTemp: "7〜10℃", feature: "年間最低水温期。メバルやカサゴなど冬に強い魚がターゲット" },
  3: { waterTemp: "10〜14℃", feature: "水温が徐々に上昇し始め、春の魚が動き出す時期" },
  4: { waterTemp: "13〜17℃", feature: "乗っ込みシーズン開始。チヌやメバルの活性が高まる" },
  5: { waterTemp: "16〜20℃", feature: "多くの魚が活発に。回遊魚も接岸し始める好シーズン" },
  6: { waterTemp: "19〜23℃", feature: "梅雨時期で濁りが入りやすいが、魚の活性は高い" },
  7: { waterTemp: "22〜27℃", feature: "夏本番。回遊魚の回遊が活発化し数釣りが楽しめる" },
  8: { waterTemp: "25〜29℃", feature: "水温ピーク。朝夕のマズメ時を狙うのが効果的" },
  9: { waterTemp: "23〜27℃", feature: "秋の荒食いシーズン開始。多くの魚種が好調" },
  10: { waterTemp: "19〜23℃", feature: "秋の釣りシーズン最盛期。大型の回遊魚も狙える" },
  11: { waterTemp: "15〜19℃", feature: "越冬前の荒食いで釣果が上がりやすい時期" },
  12: { waterTemp: "11〜15℃", feature: "水温低下で魚の活性が下がり始める。根魚シーズンに突入" },
};

/**
 * 月×釣り方の概要テキスト自動生成
 */
export function generateOverview(
  method: FishingMethodDef,
  month: MonthDef
): { waterTemp: string; overview: string } {
  const cond = MONTH_CONDITIONS[month.num];
  const fish = getFishForMethodAndMonth(method, month.num);
  const peakFish = fish.filter((f) => f.isPeak);
  const fishNames = fish.slice(0, 5).map((f) => f.name);

  let overview = `${month.name}（${month.season}）の${method.name}は、水温${cond.waterTemp}の環境で`;

  if (fish.length === 0) {
    overview += `対象魚が少なくオフシーズン気味です。他の釣り方を検討するのも良いでしょう。`;
  } else if (peakFish.length > 0) {
    const peakNames = peakFish.slice(0, 3).map((f) => f.name);
    overview += `${peakNames.join("・")}が最盛期を迎え、絶好のタイミングです。`;
    if (fishNames.length > peakNames.length) {
      const others = fishNames
        .filter((n) => !peakNames.includes(n))
        .slice(0, 3);
      if (others.length > 0) {
        overview += `他にも${others.join("・")}なども狙えます。`;
      }
    }
  } else {
    overview += `${fishNames.join("・")}などが狙えます。`;
  }

  overview += `${cond.feature}。`;

  return { waterTemp: cond.waterTemp, overview };
}

/**
 * FAQ自動生成（3問）
 */
export function generateFAQs(
  method: FishingMethodDef,
  month: MonthDef
): { question: string; answer: string }[] {
  const fish = getFishForMethodAndMonth(method, month.num);
  const spots = getSpotsForMethodAndMonth(method, month.num, 5);
  const peakFish = fish.filter((f) => f.isPeak);

  const fishNames =
    fish.length > 0
      ? fish.slice(0, 5).map((f) => f.name).join("・")
      : "対象魚が少なめ";
  const peakNames =
    peakFish.length > 0
      ? peakFish.slice(0, 3).map((f) => f.name).join("・")
      : "";
  const spotNames =
    spots.length > 0
      ? spots.slice(0, 3).map((s) => s.name).join("・")
      : "データなし";

  const faqs = [
    {
      question: `${month.name}に${method.name}で何が釣れますか？`,
      answer:
        fish.length > 0
          ? `${month.name}の${method.name}では${fishNames}などが釣れます。${peakNames ? `特に${peakNames}は最盛期で、好釣果が期待できます。` : ""}`
          : `${month.name}は${method.name}のオフシーズン気味で、対象魚は限られます。`,
    },
    {
      question: `${month.name}の${method.name}でおすすめのスポットは？`,
      answer:
        spots.length > 0
          ? `${month.name}の${method.name}には${spotNames}などがおすすめです。${spots.length >= 5 ? "他にも多数のスポットで楽しめます。" : ""}`
          : `${month.name}の${method.name}に適したスポット情報は現在準備中です。`,
    },
    {
      question: `${month.name}の${method.name}のコツは？`,
      answer: generateTipsAnswer(method, month),
    },
  ];

  return faqs;
}

function generateTipsAnswer(
  method: FishingMethodDef,
  month: MonthDef
): string {
  const cond = MONTH_CONDITIONS[month.num];
  const seasonTips: Record<string, string> = {
    冬: "防寒対策を万全にし、日中の暖かい時間帯を狙うのが効果的です。魚の活性が低いため、ゆっくりとした誘いや繊細な仕掛けが有効です。",
    春: "水温上昇に伴い魚の活性が高まる時期です。朝マズメ・夕マズメを中心に、潮通しの良いポイントを攻めましょう。",
    夏: "水温が高く魚の活性は高いですが、暑さ対策・水分補給も重要です。朝夕のマズメ時が特に有効で、日中は深場や日陰のポイントを狙いましょう。",
    秋: "荒食いシーズンで最も釣りやすい時期の一つです。幅広い釣り方が有効で、サイズアップも狙えます。",
  };

  return `${month.name}（水温${cond.waterTemp}）の${method.name}では、${seasonTips[month.season]}`;
}

// ===== HowTo スキーマ用データ =====

interface HowToStepData {
  name: string;
  text: string;
}

interface HowToData {
  steps: HowToStepData[];
  supply: string[];
  tool: string[];
  totalTime: string;
}

const METHOD_HOWTO_DATA: Record<string, HowToData> = {
  sabiki: {
    steps: [
      { name: "仕掛けをセットする", text: "竿にリールをセットし、糸をガイドに通します。サビキ仕掛けのスナップを結び、下カゴ式のコマセカゴを取り付けます。" },
      { name: "コマセをカゴに詰める", text: "コマセカゴにアミエビを7〜8分目まで詰めます。チューブタイプなら絞り入れるだけで簡単です。" },
      { name: "仕掛けを投入する", text: "足元に仕掛けを下ろします。まず底まで沈めてからリールを2〜3回巻き、底から少し浮かせた位置にセットします。" },
      { name: "コマセを振り出す", text: "竿を50cm〜1mほど上下にシャクり、コマセを海中に拡散させます。2〜3回シャクったら竿を止めます。" },
      { name: "アタリを待って合わせる", text: "10〜30秒待ち、竿先にブルブルと振動が伝わったら魚がかかった合図です。ゆっくり竿を立てて合わせましょう。" },
      { name: "魚を取り込む", text: "一定速度でリールを巻いて仕掛けを回収し、魚を針から外してクーラーボックスに入れます。" },
    ],
    supply: ["サビキ仕掛け（針4〜6号）", "コマセカゴ", "コマセ（アミエビまたはチューブ）"],
    tool: ["釣り竿（2〜3mの万能竿）", "スピニングリール（2000〜3000番）", "バケツ", "クーラーボックス"],
    totalTime: "PT3H",
  },
  choinage: {
    steps: [
      { name: "仕掛けをセットする", text: "竿にリールをセットし、道糸にちょい投げ用の天秤オモリを結びます。天秤の先に市販の投げ仕掛け（針7〜9号）をセットします。" },
      { name: "エサを針に付ける", text: "青イソメやジャリメを針に通し刺しにします。タラシは2〜3cmほど残すと食いが良くなります。" },
      { name: "仕掛けを投げる", text: "後方の安全を確認し、竿を振って仕掛けを20〜30mほど投げます。力任せに投げず、竿のしなりを使うのがコツです。" },
      { name: "着底を確認する", text: "オモリが底に着いたら糸フケを取り、竿先に軽くテンションがかかる状態にします。竿立てがあると便利です。" },
      { name: "アタリを待って合わせる", text: "竿先の動きに集中します。コツコツと前アタリが出たら少し待ち、グーッと引き込まれたら竿を立てて合わせます。" },
      { name: "魚を取り込む", text: "リールを巻いて寄せ、波打ち際や足元まで来たら抜き上げて取り込みます。" },
    ],
    supply: ["ちょい投げ仕掛け（針7〜9号）", "天秤オモリ（5〜10号）", "エサ（青イソメ・ジャリメ）"],
    tool: ["釣り竿（2〜3mの万能竿またはコンパクトロッド）", "スピニングリール（2000〜3000番）", "竿立て", "クーラーボックス"],
    totalTime: "PT3H",
  },
  "float-fishing": {
    steps: [
      { name: "仕掛けをセットする", text: "道糸にウキ止め・シモリ玉・ウキを通し、サルカンの下にハリスと針をセットします。ガン玉でウキのバランスを調整します。" },
      { name: "タナ（深さ）を設定する", text: "ウキ止めの位置でタナを決めます。まずは1〜2ヒロ（約1.5〜3m）を目安にセットし、反応を見て調整します。" },
      { name: "エサを針に付ける", text: "オキアミや練りエサを針に付けます。オキアミは尾を切ってから刺すと外れにくくなります。" },
      { name: "仕掛けを投入する", text: "ウキごと仕掛けを狙いのポイントに投入します。コマセを使う場合は同じ位置に撒いて魚を寄せます。" },
      { name: "ウキの動きを見て合わせる", text: "ウキが沈んだり横に走ったりしたらアタリです。一呼吸おいてから竿を立てて合わせましょう。" },
      { name: "魚を取り込む", text: "魚の引きに合わせてリールを巻き、タモ網（玉網）があれば使って取り込みます。" },
    ],
    supply: ["ウキ（円錐ウキまたは棒ウキ）", "ハリス・針", "ガン玉", "エサ（オキアミ・練りエサ）"],
    tool: ["磯竿（1〜1.5号、4.5〜5.3m）", "スピニングリール（2500番）", "タモ網", "バッカン・クーラーボックス"],
    totalTime: "PT4H",
  },
  eging: {
    steps: [
      { name: "エギを選ぶ", text: "水深やイカの活性に合わせてエギ（3〜3.5号）を選びます。日中はナチュラル系、濁りがある日はオレンジやピンクが有効です。" },
      { name: "エギをセットする", text: "PEラインの先端にリーダー（フロロカーボン2〜2.5号）をFGノットで結び、スナップ経由でエギを接続します。" },
      { name: "エギをキャストする", text: "狙いのポイントにエギを投げ、着水したらラインを出しながらボトム（底）まで沈めます。" },
      { name: "シャクリを入れる", text: "竿を2〜3回鋭くシャクり上げてエギを跳ね上げます。これがイカを誘うアクションです。" },
      { name: "フォールさせてアタリを取る", text: "シャクリ後にラインを張った状態でエギをゆっくり沈めます。ラインが不自然に走ったり、テンションが変わったらイカが抱いた合図です。" },
      { name: "イカを取り込む", text: "穏やかに竿を立てて合わせ、一定の速度でリールを巻きます。イカは身切れしやすいのでドラグは緩めに設定しましょう。" },
    ],
    supply: ["エギ（3〜3.5号を数色）", "リーダー（フロロカーボン2〜2.5号）"],
    tool: ["エギングロッド（8〜8.6ft）", "スピニングリール（2500〜3000番）", "ギャフまたはタモ網", "イカ締めピック"],
    totalTime: "PT3H",
  },
  lure: {
    steps: [
      { name: "ルアーを選ぶ", text: "狙う魚種に合わせてルアーを選びます。メバル・アジにはジグヘッド+ワーム、青物にはメタルジグが定番です。" },
      { name: "ルアーをセットする", text: "リーダーの先にスナップを結び、ルアーをセットします。PEラインにはリーダー（フロロ1.5〜5号）を忘れずに接続します。" },
      { name: "キャストする", text: "狙いのポイントにルアーを投げます。着水後、狙うタナ（表層・中層・底層）まで沈めます。" },
      { name: "アクションを加える", text: "リールを巻きながらルアーを泳がせます。ただ巻き・トゥイッチ・リフト＆フォールなど、魚の反応を見て変化をつけます。" },
      { name: "アタリを合わせる", text: "ガツンと衝撃が伝わったらすぐにロッドを立てて合わせます。巻き合わせが基本で、大きく煽る必要はありません。" },
      { name: "魚を取り込む", text: "ドラグを活かしてやり取りし、手前まで寄せたらタモ網や抜き上げで取り込みます。" },
    ],
    supply: ["ルアー各種（ジグヘッド+ワーム、メタルジグ、ミノー等）", "リーダー（フロロカーボン）"],
    tool: ["ルアーロッド（ターゲットに応じた長さ・硬さ）", "スピニングリール（2000〜4000番）", "タモ網", "フィッシュグリップ"],
    totalTime: "PT3H",
  },
};

/**
 * 釣り方×月のHowTo JSON-LDスキーマを生成
 */
export function generateHowToJsonLd(
  method: FishingMethodDef,
  month: MonthDef,
  fish: { name: string; isPeak: boolean }[]
) {
  const howtoData = METHOD_HOWTO_DATA[method.slug];
  if (!howtoData) return null;

  const cond = MONTH_CONDITIONS[month.num];
  const peakFishNames = fish.filter((f) => f.isPeak).slice(0, 3).map((f) => f.name);
  const fishNames = fish.slice(0, 5).map((f) => f.name);

  const targetFishText = peakFishNames.length > 0
    ? `${peakFishNames.join("・")}が最盛期`
    : fishNames.length > 0
      ? `${fishNames.join("・")}が狙える`
      : "釣れる魚は限られる";

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${month.name}の${method.name}ガイド`,
    description: `${month.name}（水温${cond.waterTemp}）の${method.name}の手順を解説。${targetFishText}時期です。`,
    totalTime: howtoData.totalTime,
    supply: howtoData.supply.map((s) => ({
      "@type": "HowToSupply",
      name: s,
    })),
    tool: howtoData.tool.map((t) => ({
      "@type": "HowToTool",
      name: t,
    })),
    step: howtoData.steps.map((step, idx) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      position: idx + 1,
    })),
  };
}

/**
 * 月×釣り方のページで使う全データをまとめて取得
 */
export function getMethodMonthPageData(
  methodSlug: string,
  monthSlug: string
) {
  const method = getMethodBySlug(methodSlug);
  const month = getMonthBySlug(monthSlug);
  if (!method || !month) return null;

  const fish = getFishForMethodAndMonth(method, month.num);
  const spots = getSpotsForMethodAndMonth(method, month.num);
  const { waterTemp, overview } = generateOverview(method, month);
  const faqs = generateFAQs(method, month);
  const howToJsonLd = generateHowToJsonLd(method, month, fish);

  const prevMonth = MONTHS[(month.num - 2 + 12) % 12];
  const nextMonth = MONTHS[month.num % 12];

  return {
    method,
    month,
    fish,
    spots,
    waterTemp,
    overview,
    faqs,
    howToJsonLd,
    prevMonth,
    nextMonth,
  };
}
