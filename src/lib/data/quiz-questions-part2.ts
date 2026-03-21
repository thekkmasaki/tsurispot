/**
 * クイズ問題データ Part2
 * カテゴリ: danger-fish, glossary, rules-manners, local
 */
import type { QuizQuestion } from "@/types/quiz";

export const quizQuestionsPart2: QuizQuestion[] = [
  // ========================================
  // danger-fish (毒魚・危険生物クイズ) 20問
  // ========================================
  {
    id: "danger-001",
    category: "danger-fish",
    difficulty: "beginner",
    question: "ゴンズイに刺された場合の正しい応急処置は？",
    choices: [
      "冷水で冷やす",
      "患部を吸う",
      "40〜45℃のお湯に浸ける",
      "アルコール消毒する",
    ],
    correctIndex: 2,
    explanation:
      "ゴンズイの毒はタンパク毒で熱に弱い性質があります。40〜45℃のお湯に30分以上浸けると痛みが和らぎます。",
    relatedLinks: [
      { label: "ゴンズイの詳細", href: "/fish/gonzui" },
      { label: "安全情報", href: "/safety" },
    ],
  },
  {
    id: "danger-002",
    category: "danger-fish",
    difficulty: "beginner",
    question: "アカエイに刺される事故が多い場所は？",
    choices: [
      "深海",
      "岩場の上",
      "砂浜の浅瀬",
      "河川の上流",
    ],
    correctIndex: 2,
    explanation:
      "アカエイは砂浜の浅瀬に潜んでいることが多く、気づかず踏んでしまい尾の毒棘に刺される事故が起きます。",
    relatedLinks: [
      { label: "アカエイの詳細", href: "/fish/akaei" },
      { label: "安全情報", href: "/safety" },
    ],
  },
  {
    id: "danger-003",
    category: "danger-fish",
    difficulty: "beginner",
    question: "ハオコゼの毒棘はどこにある？",
    choices: [
      "尾びれ",
      "背びれ",
      "口の中",
      "腹部",
    ],
    correctIndex: 1,
    explanation:
      "ハオコゼは背びれの棘に毒があります。小さくてカサゴに似ているため、うっかり掴んで刺される事故が多い魚です。",
    relatedLinks: [
      { label: "ハオコゼの詳細", href: "/fish/haokoze" },
      { label: "安全情報", href: "/safety" },
    ],
  },
  {
    id: "danger-004",
    category: "danger-fish",
    difficulty: "beginner",
    question: "毒魚を釣ってしまった時の正しい対処法は？",
    choices: [
      "素手で針を外す",
      "魚つかみやプライヤーを使い直接触れない",
      "そのまま放置する",
      "足で踏んで固定する",
    ],
    correctIndex: 1,
    explanation:
      "毒魚は素手で触ると危険です。魚つかみやプライヤー（ペンチ）を使って針を外し、直接触れないようにしましょう。",
    relatedLinks: [{ label: "安全情報", href: "/safety" }],
  },
  {
    id: "danger-005",
    category: "danger-fish",
    difficulty: "beginner",
    question: "ゴンズイの見た目の特徴は？",
    choices: [
      "赤い体に白い斑点",
      "黒褐色の体に2本の黄色い縦線",
      "銀色に光る体",
      "緑色の体に横縞",
    ],
    correctIndex: 1,
    explanation:
      "ゴンズイは黒褐色の体に頭から尾にかけて2本の黄色い縦線が走るのが特徴です。ナマズに似た形をしています。",
    relatedLinks: [{ label: "ゴンズイの詳細", href: "/fish/gonzui" }],
  },
  {
    id: "danger-006",
    category: "danger-fish",
    difficulty: "beginner",
    question: "アイゴ（バリ）の毒棘がある場所は？",
    choices: [
      "背びれ・腹びれ・臀びれ",
      "尾びれのみ",
      "口の中",
      "体表全体",
    ],
    correctIndex: 0,
    explanation:
      "アイゴは背びれ・腹びれ・臀びれの棘に毒があります。ひれを広げた状態で触ると刺されるため注意が必要です。",
    relatedLinks: [
      { label: "アイゴの詳細", href: "/fish/aigo" },
      { label: "安全情報", href: "/safety" },
    ],
  },
  {
    id: "danger-007",
    category: "danger-fish",
    difficulty: "intermediate",
    question: "オニオコゼに刺された場合、どの程度の痛みがある？",
    choices: [
      "ほとんど痛みはない",
      "軽いかゆみ程度",
      "激しい痛みが数時間〜数日続く",
      "痛みはないが麻痺が起こる",
    ],
    correctIndex: 2,
    explanation:
      "オニオコゼの毒は非常に強く、刺されると激痛が数時間から数日続きます。重症の場合は病院での治療が必要です。",
    relatedLinks: [
      { label: "オニオコゼの詳細", href: "/fish/oniokoze" },
      { label: "安全情報", href: "/safety" },
    ],
  },
  {
    id: "danger-008",
    category: "danger-fish",
    difficulty: "intermediate",
    question: "釣り場でクラゲに刺された場合の応急処置として正しいのは？",
    choices: [
      "真水で洗う",
      "酢をかける（種類による）",
      "砂で擦る",
      "患部を温める",
    ],
    correctIndex: 1,
    explanation:
      "クラゲに刺された場合、触手を取り除いてから海水で洗います。カツオノエボシ以外のクラゲには酢が有効な場合があります。",
    relatedLinks: [{ label: "安全情報", href: "/safety" }],
  },
  {
    id: "danger-009",
    category: "danger-fish",
    difficulty: "intermediate",
    question: "フグの毒（テトロドトキシン）が特に多い部位は？",
    choices: [
      "筋肉（身）",
      "肝臓・卵巣",
      "ひれ",
      "うろこ",
    ],
    correctIndex: 1,
    explanation:
      "フグ毒は肝臓と卵巣に最も多く含まれます。フグの調理には専門の免許が必要で、素人の調理は危険です。",
    relatedLinks: [
      { label: "フグの詳細", href: "/fish/fugu" },
      { label: "安全情報", href: "/safety" },
    ],
  },
  {
    id: "danger-010",
    category: "danger-fish",
    difficulty: "intermediate",
    question: "ウツボが人を噛む主な状況は？",
    choices: [
      "泳いでいる人を積極的に襲う",
      "岩の隙間に手を入れた時に防衛的に噛む",
      "エサを与えた時",
      "夜間に海岸を歩いている時",
    ],
    correctIndex: 1,
    explanation:
      "ウツボは臆病な性格で自ら襲うことは稀ですが、隠れている岩穴に手を入れると防衛的に噛みつきます。鋭い歯で大怪我になります。",
    relatedLinks: [{ label: "ウツボの詳細", href: "/fish/utsubo" }],
  },
  {
    id: "danger-011",
    category: "danger-fish",
    difficulty: "intermediate",
    question: "「ゴンズイ玉」とは何のこと？",
    choices: [
      "ゴンズイの卵の塊",
      "ゴンズイの幼魚が球状に群れる行動",
      "ゴンズイの毒を固めたもの",
      "ゴンズイ釣りの仕掛け",
    ],
    correctIndex: 1,
    explanation:
      "ゴンズイ玉はゴンズイの幼魚が密集して球状の群れを作る行動です。数百匹が集まって一つの塊のように見えます。",
    relatedLinks: [{ label: "ゴンズイの詳細", href: "/fish/gonzui" }],
  },
  {
    id: "danger-012",
    category: "danger-fish",
    difficulty: "intermediate",
    question: "ヒョウモンダコの毒の種類は？",
    choices: [
      "タンパク毒",
      "テトロドトキシン（フグと同じ毒）",
      "神経毒（ヘビと同じ）",
      "溶血毒",
    ],
    correctIndex: 1,
    explanation:
      "ヒョウモンダコはフグと同じテトロドトキシンを持ちます。小さくても命に関わる危険な生物で、触らないことが最重要です。",
    relatedLinks: [{ label: "安全情報", href: "/safety" }],
  },
  {
    id: "danger-013",
    category: "danger-fish",
    difficulty: "beginner",
    question: "毒魚に刺された時、まず最初にすべきことは？",
    choices: [
      "そのまま釣りを続ける",
      "患部を確認し、毒棘が残っていれば抜く",
      "走って体を温める",
      "海水に浸かる",
    ],
    correctIndex: 1,
    explanation:
      "毒魚に刺されたら、まず棘が残っていないか確認して取り除き、応急処置をしてから病院を受診しましょう。",
    relatedLinks: [{ label: "安全情報", href: "/safety" }],
  },
  {
    id: "danger-014",
    category: "danger-fish",
    difficulty: "advanced",
    question: "オニダルマオコゼが「世界最強の毒魚」と呼ばれる理由は？",
    choices: [
      "体が巨大だから",
      "毒の量が多いから",
      "岩に擬態して気づかれにくく、毒が極めて強いから",
      "攻撃的な性格だから",
    ],
    correctIndex: 2,
    explanation:
      "オニダルマオコゼは岩そっくりに擬態するため踏んでしまいやすく、背びれの毒は魚類最強クラスで命に関わります。",
    relatedLinks: [{ label: "安全情報", href: "/safety" }],
  },
  {
    id: "danger-015",
    category: "danger-fish",
    difficulty: "advanced",
    question: "アカエイの毒棘の特徴として正しいのは？",
    choices: [
      "何度でも再生する",
      "返しがあり一度刺さると抜けにくい",
      "毒は弱いが感染症のリスクがある",
      "乾燥すると無毒化する",
    ],
    correctIndex: 1,
    explanation:
      "アカエイの毒棘にはノコギリ状の返しがあり、刺さると抜けにくく傷口が大きくなります。毒の痛みも非常に強力です。",
    relatedLinks: [
      { label: "アカエイの詳細", href: "/fish/akaei" },
      { label: "安全情報", href: "/safety" },
    ],
  },
  {
    id: "danger-016",
    category: "danger-fish",
    difficulty: "beginner",
    question: "釣りでよく遭遇する危険生物として当てはまらないのは？",
    choices: [
      "ゴンズイ",
      "ハオコゼ",
      "マダイ",
      "アカエイ",
    ],
    correctIndex: 2,
    explanation:
      "マダイは毒を持たない安全な魚です。ゴンズイ・ハオコゼ・アカエイは毒棘を持ち、釣りで遭遇しやすい危険生物です。",
    relatedLinks: [{ label: "安全情報", href: "/safety" }],
  },
  {
    id: "danger-017",
    category: "danger-fish",
    difficulty: "intermediate",
    question: "カサゴの背びれの棘には毒がある？",
    choices: [
      "全く毒はない",
      "弱い毒があり刺されると痛む",
      "致命的な猛毒がある",
      "アレルギー体質の人だけ反応する",
    ],
    correctIndex: 1,
    explanation:
      "カサゴの背びれの棘には弱い毒があり、刺されると腫れて痛みます。致命的ではありませんが注意が必要です。",
    relatedLinks: [{ label: "カサゴの詳細", href: "/fish/kasago" }],
  },
  {
    id: "danger-018",
    category: "danger-fish",
    difficulty: "advanced",
    question: "ソウシハギが危険とされる理由は？",
    choices: [
      "鋭い歯で噛みつく",
      "内臓にパリトキシンという猛毒を持つ可能性がある",
      "棘に毒がある",
      "触るとかぶれる",
    ],
    correctIndex: 1,
    explanation:
      "ソウシハギはカワハギの仲間ですが、内臓にパリトキシンを持つ場合があり、食べると命に関わる危険があります。",
    relatedLinks: [{ label: "安全情報", href: "/safety" }],
  },
  {
    id: "danger-019",
    category: "danger-fish",
    difficulty: "advanced",
    question: "毒魚対策として釣りに持っていくべきアイテムは？",
    choices: [
      "日焼け止めだけで十分",
      "魚つかみ・プライヤー・ポイズンリムーバー",
      "虫除けスプレー",
      "特に何も必要ない",
    ],
    correctIndex: 1,
    explanation:
      "毒魚対策には直接触れずに扱える魚つかみ、針を外すプライヤー、万一に備えたポイズンリムーバーが有効です。",
    relatedLinks: [{ label: "安全情報", href: "/safety" }],
  },
  {
    id: "danger-020",
    category: "danger-fish",
    difficulty: "beginner",
    question: "「タンパク毒」を持つ魚に刺された時の共通する応急処置は？",
    choices: [
      "氷で冷やす",
      "お湯（40〜45℃）に浸ける",
      "包帯できつく縛る",
      "何もせず様子を見る",
    ],
    correctIndex: 1,
    explanation:
      "ゴンズイ・アカエイ・ハオコゼなどのタンパク毒は熱に弱いため、40〜45℃のお湯に浸けることで痛みが緩和します。",
    relatedLinks: [{ label: "安全情報", href: "/safety" }],
  },

  // ========================================
  // glossary (釣り用語クイズ) 30問
  // ========================================
  {
    id: "glossary-001",
    category: "glossary",
    difficulty: "beginner",
    question: "「マヅメ」とはどのような時間帯？",
    choices: [
      "正午前後",
      "深夜0時頃",
      "日の出・日の入り前後の薄暗い時間帯",
      "満潮の時間帯",
    ],
    correctIndex: 2,
    explanation:
      "マヅメは日の出前後（朝マヅメ）と日没前後（夕マヅメ）の時間帯で、魚の活性が最も高くなる釣りのゴールデンタイムです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-002",
    category: "glossary",
    difficulty: "beginner",
    question: "「ボウズ」とはどういう意味？",
    choices: [
      "大漁だったこと",
      "1匹も釣れなかったこと",
      "坊主頭の釣り人",
      "丸い形のオモリ",
    ],
    correctIndex: 1,
    explanation:
      "ボウズは釣りで1匹も魚が釣れなかったことを指す用語です。「オデコ」とも言います。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-003",
    category: "glossary",
    difficulty: "beginner",
    question: "「ドラグ」とは何のこと？",
    choices: [
      "竿の先端部分",
      "リールの糸放出制動装置",
      "エサの種類",
      "仕掛けのパーツ名",
    ],
    correctIndex: 1,
    explanation:
      "ドラグはリールに内蔵された制動装置で、魚の引きが強い時に糸が切れないよう一定の力で糸を送り出します。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-004",
    category: "glossary",
    difficulty: "beginner",
    question: "「アタリ」とは何のこと？",
    choices: [
      "釣り場が混雑していること",
      "魚がエサに食いついた時の反応",
      "天気が良いこと",
      "大物が釣れたこと",
    ],
    correctIndex: 1,
    explanation:
      "アタリは魚がエサやルアーに食いついた時に竿先やウキ、ラインに出る反応のことです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-005",
    category: "glossary",
    difficulty: "beginner",
    question: "「外道」とはどういう意味？",
    choices: [
      "悪い釣り人",
      "毒のある魚",
      "狙っていない魚が釣れること、またはその魚",
      "釣り禁止の魚",
    ],
    correctIndex: 2,
    explanation:
      "外道は本命（狙っている魚）以外の魚が釣れることや、その魚自体を指します。思わぬ嬉しい外道もあります。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-006",
    category: "glossary",
    difficulty: "beginner",
    question: "「シャクリ」とはどのような動作？",
    choices: [
      "リールを速く巻くこと",
      "竿を上下に鋭く煽る動作",
      "糸を切ること",
      "エサを付け替えること",
    ],
    correctIndex: 1,
    explanation:
      "シャクリは竿を上方向に鋭く煽り、エギやジグを跳ね上げる動作です。エギングやジギングの基本アクションです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-007",
    category: "glossary",
    difficulty: "beginner",
    question: "「根魚」とはどのような魚の総称？",
    choices: [
      "植物を食べる草食魚",
      "岩礁や障害物の周りに棲む魚",
      "根が生えているように動かない魚",
      "木の根の下に潜む淡水魚",
    ],
    correctIndex: 1,
    explanation:
      "根魚は岩礁帯やテトラなどの障害物（根）の周りに棲む魚の総称で、カサゴ・メバル・アイナメなどが代表的です。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-008",
    category: "glossary",
    difficulty: "beginner",
    question: "「タックル」とは何のこと？",
    choices: [
      "魚を締める道具",
      "釣り道具一式（竿・リール・仕掛けなど）",
      "釣り場の地形",
      "魚の大きさを測る道具",
    ],
    correctIndex: 1,
    explanation:
      "タックルは竿（ロッド）・リール・ライン・仕掛けなど、釣りに使う道具一式のことを指します。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-009",
    category: "glossary",
    difficulty: "intermediate",
    question: "「潮止まり」とはどのような状態？",
    choices: [
      "潮が完全に干上がること",
      "満潮と干潮の間で潮の動きが止まる時間",
      "塩分濃度がゼロになること",
      "波が完全に消えること",
    ],
    correctIndex: 1,
    explanation:
      "潮止まりは満潮・干潮の前後に潮の流れが止まるタイミングで、一般的に魚の活性が下がると言われています。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-010",
    category: "glossary",
    difficulty: "intermediate",
    question: "「ラインブレイク」とはどういう意味？",
    choices: [
      "ラインを新品に交換すること",
      "釣り糸が切れてしまうこと",
      "ラインが絡まること",
      "休憩のこと",
    ],
    correctIndex: 1,
    explanation:
      "ラインブレイクは魚の引きや根掛かりなどで釣り糸が切れてしまうことです。適切なラインの太さとドラグ設定で防げます。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-011",
    category: "glossary",
    difficulty: "intermediate",
    question: "「リトリーブ」とは何をすること？",
    choices: [
      "仕掛けを投げること",
      "リールを巻いてルアーを引くこと",
      "魚を取り込むこと",
      "竿をしまうこと",
    ],
    correctIndex: 1,
    explanation:
      "リトリーブはリールを巻いてルアーを手元に引き寄せる動作のことです。巻きの速さや緩急で魚を誘います。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-012",
    category: "glossary",
    difficulty: "intermediate",
    question: "「ストラクチャー」とは釣り用語で何を意味する？",
    choices: [
      "竿の構造",
      "水中の障害物や地形変化（岩・杭・橋脚など）",
      "仕掛けの組み方",
      "リールの内部構造",
    ],
    correctIndex: 1,
    explanation:
      "ストラクチャーは水中の岩・杭・橋脚・沈み根など、魚が集まりやすい障害物や地形変化のことです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-013",
    category: "glossary",
    difficulty: "intermediate",
    question: "「バラシ」とはどういう状態？",
    choices: [
      "仕掛けがバラバラになること",
      "針に掛かった魚が外れて逃げること",
      "エサが散らばること",
      "他の釣り人に場所を譲ること",
    ],
    correctIndex: 1,
    explanation:
      "バラシは一度針に掛かった魚が合わせの失敗やラインテンション不足などで外れて逃げてしまうことです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-014",
    category: "glossary",
    difficulty: "intermediate",
    question: "「ベイトフィッシュ」とは何のこと？",
    choices: [
      "ベイトリールで釣る魚",
      "フィッシュイーターのエサとなる小魚",
      "餌釣り専用の魚",
      "養殖された魚",
    ],
    correctIndex: 1,
    explanation:
      "ベイトフィッシュは大型魚のエサになる小魚（イワシ・アジの幼魚など）のことで、ベイトがいる場所は好ポイントです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-015",
    category: "glossary",
    difficulty: "intermediate",
    question: "「フォール」とは何のこと？",
    choices: [
      "竿が折れること",
      "ルアーやエギが水中で沈んでいくこと",
      "魚が落ちること",
      "転倒すること",
    ],
    correctIndex: 1,
    explanation:
      "フォールはルアーやエギが重力で水中を沈んでいく動きのことで、この沈下中に魚がバイト（食いつき）することが多いです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-016",
    category: "glossary",
    difficulty: "beginner",
    question: "「ハリス」とは何のこと？",
    choices: [
      "竿のグリップ部分",
      "針に結ぶ糸（鉤素）",
      "リールの部品",
      "魚を入れるネット",
    ],
    correctIndex: 1,
    explanation:
      "ハリスは針に直接結ぶ糸のことで、道糸より細いものを使うのが一般的です。魚に見えにくいフロロカーボンがよく使われます。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-017",
    category: "glossary",
    difficulty: "beginner",
    question: "「道糸」とは何のこと？",
    choices: [
      "予備の糸",
      "リールに巻いてあるメインの糸",
      "針に結ぶ糸",
      "仕掛けを作る糸",
    ],
    correctIndex: 1,
    explanation:
      "道糸はリールに巻いてある本線の糸で、メインラインとも呼ばれます。ナイロン・フロロ・PEラインなどの種類があります。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-018",
    category: "glossary",
    difficulty: "intermediate",
    question: "「サラシ」とはどのような状態？",
    choices: [
      "砂が舞い上がって濁ること",
      "磯に波がぶつかって白い泡が広がる状態",
      "日差しで海面が白く光ること",
      "霧で前が見えない状態",
    ],
    correctIndex: 1,
    explanation:
      "サラシは波が磯にぶつかって白い泡状になる部分で、溶存酸素が多くスズキやヒラスズキの好ポイントです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-019",
    category: "glossary",
    difficulty: "intermediate",
    question: "「スレ」とはどのような状態の魚？",
    choices: [
      "体が擦れて傷ついた魚",
      "釣り人のルアーやエサに警戒して食わなくなった魚",
      "寄生虫がついた魚",
      "群れからはぐれた魚",
    ],
    correctIndex: 1,
    explanation:
      "スレ（スレた魚）は多くの釣り人に狙われて学習し、ルアーやエサに反応しにくくなった状態の魚です。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-020",
    category: "glossary",
    difficulty: "advanced",
    question: "「潮目」とはどのような場所？",
    choices: [
      "潮が引いた跡",
      "異なる潮流がぶつかり合う境目",
      "潮の高さの目盛り",
      "海底の溝",
    ],
    correctIndex: 1,
    explanation:
      "潮目は異なる流れ・水温・塩分濃度の海水がぶつかる境目で、プランクトンやゴミが溜まり魚が集まる好ポイントです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-021",
    category: "glossary",
    difficulty: "advanced",
    question: "「レングス」とは何の長さ？",
    choices: [
      "竿の長さ",
      "魚の全長",
      "釣り場までの距離",
      "糸の太さ",
    ],
    correctIndex: 1,
    explanation:
      "レングス（length）は釣った魚の全長のことです。「40cmのレングス」のように使い、釣果を表現する際に使います。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-022",
    category: "glossary",
    difficulty: "advanced",
    question: "「サミング」とは何のテクニック？",
    choices: [
      "親指でスプールを押さえてライン放出を調整すること",
      "魚を親指で持つこと",
      "サムズアップで合図すること",
      "エサを指で付けること",
    ],
    correctIndex: 0,
    explanation:
      "サミングはキャスト時に親指（thumb）でリールのスプールを押さえ、ラインの放出を微調整するテクニックです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-023",
    category: "glossary",
    difficulty: "advanced",
    question: "「二枚潮」とはどのような状態？",
    choices: [
      "一日に干満が二回あること",
      "表層と底層で潮の流れる方向が異なる状態",
      "二つの川が合流すること",
      "潮位差が二倍になること",
    ],
    correctIndex: 1,
    explanation:
      "二枚潮は表層と底層で潮の流れる方向や速さが異なる状態で、仕掛けが狙い通りに流れず釣りが難しくなります。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-024",
    category: "glossary",
    difficulty: "beginner",
    question: "「五目釣り」とは何のこと？",
    choices: [
      "5人で同時に釣ること",
      "5種類以上の魚を釣ること",
      "5本の竿を使うこと",
      "5時間以上釣り続けること",
    ],
    correctIndex: 1,
    explanation:
      "五目釣りは複数種類の魚を釣ることを楽しむ釣り方で、必ずしも5種類でなくても色々な魚を釣ることを指します。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-025",
    category: "glossary",
    difficulty: "intermediate",
    question: "「居着き」とはどのような魚？",
    choices: [
      "養殖場にいる魚",
      "回遊せずに特定の場所に棲み続ける魚",
      "死んで浮いている魚",
      "人に懐いた魚",
    ],
    correctIndex: 1,
    explanation:
      "居着きは回遊せず、堤防や磯などの特定の場所に棲み続ける魚のことです。回遊魚に対して使われる表現です。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-026",
    category: "glossary",
    difficulty: "advanced",
    question: "「PEライン」の「PE」は何の略？",
    choices: [
      "ポリエステル",
      "ポリエチレン",
      "パーフェクトエディション",
      "プロフェッショナルエキップメント",
    ],
    correctIndex: 1,
    explanation:
      "PEラインのPEはポリエチレン（Polyethylene）の略です。細い繊維を編み込んで作られ、強度が高く伸びが少ないのが特徴です。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-027",
    category: "glossary",
    difficulty: "intermediate",
    question: "「ランガン」とはどのような釣りスタイル？",
    choices: [
      "一箇所でじっくり粘る釣り",
      "走りながら釣ること",
      "ポイントを次々と移動しながら釣り歩くこと",
      "ランチを食べながら釣ること",
    ],
    correctIndex: 2,
    explanation:
      "ランガンは「Run & Gun」の略で、一箇所に留まらずポイントを次々と移動しながら魚を探す釣りスタイルです。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-028",
    category: "glossary",
    difficulty: "advanced",
    question: "「ベタ凪」とはどのような海の状態？",
    choices: [
      "大荒れの状態",
      "波がほとんどなく穏やかな状態",
      "霧が出ている状態",
      "赤潮が発生した状態",
    ],
    correctIndex: 1,
    explanation:
      "ベタ凪は波がほとんどなく海面がべったりと穏やかな状態です。船釣りには最適ですが、磯釣りではサラシが出ず不向きな場合もあります。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-029",
    category: "glossary",
    difficulty: "beginner",
    question: "「仕掛け」とは何のこと？",
    choices: [
      "罠を仕掛けること",
      "針・ハリス・オモリ・ウキなどを組み合わせた釣りの装置",
      "魚を調理する準備",
      "釣り場を設営すること",
    ],
    correctIndex: 1,
    explanation:
      "仕掛けは針・ハリス・オモリ・ウキなどを組み合わせた釣りの装置です。釣法やターゲットに合わせて様々な仕掛けがあります。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },
  {
    id: "glossary-030",
    category: "glossary",
    difficulty: "intermediate",
    question: "「エラ洗い」とはどのような現象？",
    choices: [
      "魚のエラを洗浄すること",
      "掛かった魚が水面でエラを開いて頭を振りジャンプすること",
      "リールが壊れること",
      "潮が急に変わること",
    ],
    correctIndex: 1,
    explanation:
      "エラ洗いはスズキなどが針に掛かった際に水面でジャンプしてエラを広げ首を振り、針を外そうとする行動です。",
    relatedLinks: [{ label: "釣り用語集", href: "/glossary" }],
  },

  // ========================================
  // rules-manners (釣りルール・マナークイズ) 20問
  // ========================================
  {
    id: "rules-001",
    category: "rules-manners",
    difficulty: "beginner",
    question: "釣り場で出たゴミの正しい処理方法は？",
    choices: [
      "海に捨てる",
      "その場に置いていく",
      "全て持ち帰る",
      "燃やして処分する",
    ],
    correctIndex: 2,
    explanation:
      "釣り場で出たゴミは仕掛けの切れ端やエサの袋も含め全て持ち帰るのがマナーです。ゴミ放置は釣り場閉鎖の原因になります。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-002",
    category: "rules-manners",
    difficulty: "beginner",
    question: "先に釣りをしている人がいる場合、どうすべき？",
    choices: [
      "割り込んで場所を確保する",
      "挨拶をして十分な間隔を空けて釣り座を構える",
      "大声で退くように言う",
      "すぐ隣に入る",
    ],
    correctIndex: 1,
    explanation:
      "先行者優先は釣りの基本マナーです。挨拶をして、仕掛けが絡まない十分な距離を空けて釣り座を構えましょう。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-003",
    category: "rules-manners",
    difficulty: "beginner",
    question: "漁業権が設定されている場所で注意すべきことは？",
    choices: [
      "何を釣っても自由",
      "アワビ・サザエなどの採取は漁業権侵害になる場合がある",
      "漁業権は釣り人には関係ない",
      "船を出さなければ問題ない",
    ],
    correctIndex: 1,
    explanation:
      "漁業権が設定されている海域でアワビ・サザエ・ウニなどを採取すると漁業権侵害（密漁）となり罰則があります。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-004",
    category: "rules-manners",
    difficulty: "beginner",
    question: "釣り場での駐車マナーとして正しいのは？",
    choices: [
      "路上駐車はどこでもOK",
      "漁港の作業スペースに駐車する",
      "指定の駐車場を利用し、路上駐車しない",
      "空いていればどこに停めてもよい",
    ],
    correctIndex: 2,
    explanation:
      "違法駐車や漁港内の作業スペースへの駐車は迷惑行為です。指定の駐車場を利用しましょう。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-005",
    category: "rules-manners",
    difficulty: "beginner",
    question: "立入禁止区域で釣りをするとどうなる可能性がある？",
    choices: [
      "特に問題ない",
      "法律違反で罰金や書類送検の対象になる",
      "注意されるだけ",
      "魚が釣れやすい",
    ],
    correctIndex: 1,
    explanation:
      "立入禁止区域への侵入は軽犯罪法違反や港湾法違反に問われる可能性があります。絶対に入らないでください。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-006",
    category: "rules-manners",
    difficulty: "beginner",
    question: "ライフジャケットの着用が推奨される理由は？",
    choices: [
      "ファッションのため",
      "落水時の命を守るため",
      "日焼け防止のため",
      "暖かいから",
    ],
    correctIndex: 1,
    explanation:
      "堤防や磯からの落水事故は毎年発生しており、ライフジャケットは命を守る最も重要な安全装備です。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-007",
    category: "rules-manners",
    difficulty: "intermediate",
    question: "小さな魚（幼魚）が釣れた場合のマナーとして正しいのは？",
    choices: [
      "全て持ち帰る",
      "リリース（放流）して資源保護に協力する",
      "エサとして使う",
      "他の釣り人にあげる",
    ],
    correctIndex: 1,
    explanation:
      "小さな魚は成長前の幼魚なので、できるだけリリースして水産資源の保護に協力しましょう。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-008",
    category: "rules-manners",
    difficulty: "intermediate",
    question: "コマセ（撒き餌）を使った後の正しい行動は？",
    choices: [
      "そのまま放置する",
      "海水で釣り座を洗い流して帰る",
      "翌日来る人のために残しておく",
      "コマセは自然に消えるので何もしなくてよい",
    ],
    correctIndex: 1,
    explanation:
      "コマセは放置すると悪臭の原因になります。帰る前に海水をかけて釣り座を洗い流すのがマナーです。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-009",
    category: "rules-manners",
    difficulty: "intermediate",
    question: "遊漁券（入漁券）が必要なのは主にどのような場所？",
    choices: [
      "全ての海",
      "漁協が管理する河川や湖",
      "公園の池",
      "プライベートビーチ",
    ],
    correctIndex: 1,
    explanation:
      "遊漁券は漁業協同組合が管理する河川や湖で釣りをする際に必要です。アユやヤマメの釣りでは必須の場合が多いです。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-010",
    category: "rules-manners",
    difficulty: "intermediate",
    question: "夜釣りで気をつけるべきマナーは？",
    choices: [
      "大声で話して存在を知らせる",
      "近隣住民に配慮し静かに行動する",
      "ヘッドライトを常に最大で照らす",
      "車のエンジンをかけっぱなしにする",
    ],
    correctIndex: 1,
    explanation:
      "夜釣りでは近隣住民への騒音配慮が重要です。車のアイドリング、大声、不要なライトの照射は控えましょう。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-011",
    category: "rules-manners",
    difficulty: "intermediate",
    question: "キャスト（投げる）時に確認すべきことは？",
    choices: [
      "風の方向だけ確認する",
      "後方と周囲に人がいないか安全確認する",
      "竿の長さを測る",
      "特に確認不要",
    ],
    correctIndex: 1,
    explanation:
      "キャスト時は後方と周囲に人がいないか必ず確認しましょう。針やオモリが人に当たると大怪我につながります。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-012",
    category: "rules-manners",
    difficulty: "beginner",
    question: "釣り場で他の人の仕掛けと絡んでしまった（お祭り）時の対応は？",
    choices: [
      "相手の糸を勝手に切る",
      "黙って自分の糸だけ切る",
      "お互い声を掛け合って協力してほどく",
      "その場を離れる",
    ],
    correctIndex: 2,
    explanation:
      "仕掛けが絡んだ場合は「すみません」と声を掛け、お互い協力してほどきましょう。無言で糸を切るのはマナー違反です。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-013",
    category: "rules-manners",
    difficulty: "intermediate",
    question: "ブラックバスやブルーギルを釣った後の正しい取り扱いは？",
    choices: [
      "他の水域に放流する",
      "特定外来生物のためリリースが禁止されている地域もある",
      "どこでも自由にリリースしてよい",
      "飼育して育てる",
    ],
    correctIndex: 1,
    explanation:
      "ブラックバスやブルーギルは特定外来生物に指定されており、地域によってはリリースが条例で禁止されています。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-014",
    category: "rules-manners",
    difficulty: "advanced",
    question: "船釣りでのライフジャケット着用義務について正しいのは？",
    choices: [
      "着用は任意",
      "子供だけ着用義務がある",
      "小型船舶では全員着用が義務（桜マーク付き）",
      "船長だけ着用すればよい",
    ],
    correctIndex: 2,
    explanation:
      "2018年から小型船舶での全員ライフジャケット着用が義務化されました。国土交通省認定の桜マーク付きが必要です。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-015",
    category: "rules-manners",
    difficulty: "advanced",
    question: "「根がかりでルアーを水中に残してしまう」ことの環境問題は？",
    choices: [
      "環境への影響はない",
      "鉛のオモリや針が海洋汚染の原因になる",
      "魚がルアーを食べて大きくなる",
      "ルアーは自然に分解される",
    ],
    correctIndex: 1,
    explanation:
      "水中に残された鉛のオモリは海洋汚染の原因になり、針は海洋生物を傷つけます。根掛かりを減らす工夫が大切です。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-016",
    category: "rules-manners",
    difficulty: "beginner",
    question: "釣り場でバーベキューやキャンプをする際の注意点は？",
    choices: [
      "どこでも自由にしてよい",
      "火気厳禁の場所や禁止区域では行わない",
      "釣り場なら全てOK",
      "夜間ならOK",
    ],
    correctIndex: 1,
    explanation:
      "多くの釣り場や漁港は火気厳禁です。バーベキューやキャンプが許可されている場所かどうか事前に確認しましょう。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-017",
    category: "rules-manners",
    difficulty: "intermediate",
    question: "サイズ規制（持ち帰りサイズの制限）がある理由は？",
    choices: [
      "大きい魚だけ価値があるから",
      "水産資源を守り、魚が産卵できるサイズまで成長させるため",
      "小さい魚は美味しくないから",
      "漁師が困るから",
    ],
    correctIndex: 1,
    explanation:
      "サイズ規制は魚が十分に成長して産卵できるようになる前に獲りすぎることを防ぎ、水産資源を持続させるための制度です。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-018",
    category: "rules-manners",
    difficulty: "advanced",
    question: "磯釣りで落水事故を防ぐために最も重要な装備は？",
    choices: [
      "偏光サングラス",
      "磯靴（フェルトスパイク底）とライフジャケット",
      "帽子と手袋",
      "クーラーボックス",
    ],
    correctIndex: 1,
    explanation:
      "磯は濡れた岩で滑りやすく、磯靴（フェルトスパイクソール）とライフジャケットは命を守る最重要装備です。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-019",
    category: "rules-manners",
    difficulty: "advanced",
    question: "釣り場の閉鎖が増えている主な原因は？",
    choices: [
      "魚がいなくなったから",
      "釣り人のゴミ放置・違法駐車・事故などのマナー違反",
      "海水温の上昇",
      "地震の影響",
    ],
    correctIndex: 1,
    explanation:
      "全国で釣り場閉鎖が増加している主な原因は釣り人のマナー違反です。一人一人の心がけが釣り場を守ります。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "rules-020",
    category: "rules-manners",
    difficulty: "intermediate",
    question: "釣りで使い終わった余った餌の正しい処分方法は？",
    choices: [
      "海に全て投げ込む",
      "その場に放置する",
      "持ち帰って家庭ゴミとして処分する",
      "他の釣り人に押し付ける",
    ],
    correctIndex: 2,
    explanation:
      "余った餌は持ち帰って処分するのがマナーです。大量に海に投棄すると水質悪化の原因になります。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },

  // ========================================
  // local (ご当地釣りクイズ) 30問
  // ========================================
  {
    id: "local-001",
    category: "local",
    difficulty: "beginner",
    question: "「明石のタイ」が有名な理由は？",
    choices: [
      "養殖が盛んだから",
      "明石海峡の速い潮流で身が引き締まっているから",
      "明石でしか獲れない品種だから",
      "明石の水が特別な成分を含むから",
    ],
    correctIndex: 1,
    explanation:
      "明石のマダイは明石海峡の速い潮流の中で育ち、身が引き締まって味が良いことで全国的に有名です。",
    relatedLinks: [{ label: "兵庫県の釣り場", href: "/prefecture/hyogo" }],
  },
  {
    id: "local-002",
    category: "local",
    difficulty: "beginner",
    question: "東京湾の「江戸前」として有名な魚は？",
    choices: [
      "サケ",
      "アナゴ・ハゼ",
      "マグロ",
      "サンマ",
    ],
    correctIndex: 1,
    explanation:
      "東京湾の「江戸前」としてアナゴやハゼが有名です。江戸前寿司のネタとしても古くから親しまれています。",
    relatedLinks: [{ label: "東京都の釣り場", href: "/prefecture/tokyo" }],
  },
  {
    id: "local-003",
    category: "local",
    difficulty: "beginner",
    question: "高知県の名物料理「カツオのたたき」で使う薬味として定番なのは？",
    choices: [
      "わさびのみ",
      "にんにくスライスとみょうが",
      "マヨネーズ",
      "唐辛子のみ",
    ],
    correctIndex: 1,
    explanation:
      "高知のカツオのたたきはにんにくスライス・みょうが・大葉・玉ねぎなどの薬味をたっぷりのせて食べるのが特徴です。",
    relatedLinks: [{ label: "高知県の釣り場", href: "/prefecture/kochi" }],
  },
  {
    id: "local-004",
    category: "local",
    difficulty: "beginner",
    question: "北海道で秋に河川に遡上する魚は？",
    choices: [
      "マグロ",
      "サケ（シロザケ）",
      "ブリ",
      "タチウオ",
    ],
    correctIndex: 1,
    explanation:
      "北海道では秋になるとシロザケが産卵のため河川に遡上します。河口域での鮭釣りは北海道の秋の風物詩です。",
    relatedLinks: [{ label: "北海道の釣り場", href: "/prefecture/hokkaido" }],
  },
  {
    id: "local-005",
    category: "local",
    difficulty: "beginner",
    question: "「氷見の寒ブリ」で有名な氷見市がある県は？",
    choices: [
      "石川県",
      "富山県",
      "新潟県",
      "福井県",
    ],
    correctIndex: 1,
    explanation:
      "氷見市は富山県にあり、冬の「氷見ブリ」は脂がのった最高級品として全国的に知られています。",
    relatedLinks: [{ label: "富山県の釣り場", href: "/prefecture/toyama" }],
  },
  {
    id: "local-006",
    category: "local",
    difficulty: "beginner",
    question: "福岡市の屋台で人気の魚料理「ごまさば」に使われる魚は？",
    choices: [
      "マダイ",
      "マサバ",
      "マアジ",
      "カツオ",
    ],
    correctIndex: 1,
    explanation:
      "福岡名物「ごまさば」は新鮮なマサバの刺身をごまだれで和えた料理で、玄界灘で獲れる新鮮なサバだからこそ可能です。",
    relatedLinks: [{ label: "福岡県の釣り場", href: "/prefecture/fukuoka" }],
  },
  {
    id: "local-007",
    category: "local",
    difficulty: "intermediate",
    question: "大阪湾の「泉南エリア」が釣り人に人気の理由は？",
    choices: [
      "大型マグロが釣れるから",
      "都市部から近く漁港・釣り公園が充実しているから",
      "海外の魚が放流されているから",
      "年中水温が一定だから",
    ],
    correctIndex: 1,
    explanation:
      "泉南エリアは大阪市内からアクセスが良く、多数の漁港や釣り公園があり、初心者から上級者まで楽しめる人気エリアです。",
    relatedLinks: [{ label: "大阪府の釣り場", href: "/prefecture/osaka" }],
  },
  {
    id: "local-008",
    category: "local",
    difficulty: "intermediate",
    question: "伊豆半島で盛んな釣りは？",
    choices: [
      "ワカサギの氷上釣り",
      "サケの河口釣り",
      "磯釣り（メジナ・イシダイ）やエギング",
      "管理釣り場のみ",
    ],
    correctIndex: 2,
    explanation:
      "伊豆半島は黒潮の影響を受ける好漁場で、磯からのメジナ・イシダイ釣りやアオリイカのエギングが盛んです。",
    relatedLinks: [{ label: "静岡県の釣り場", href: "/prefecture/shizuoka" }],
  },
  {
    id: "local-009",
    category: "local",
    difficulty: "intermediate",
    question: "「関あじ・関さば」のブランドで有名な海域は？",
    choices: [
      "関門海峡",
      "豊予海峡（大分県佐賀関沖）",
      "鳴門海峡",
      "津軽海峡",
    ],
    correctIndex: 1,
    explanation:
      "「関あじ・関さば」は大分県佐賀関沖の豊予海峡で一本釣りされたアジ・サバのブランド名で、高級魚として取引されます。",
    relatedLinks: [{ label: "大分県の釣り場", href: "/prefecture/oita" }],
  },
  {
    id: "local-010",
    category: "local",
    difficulty: "intermediate",
    question: "神奈川県の三浦半島で人気の釣りターゲットは？",
    choices: [
      "サケ・マス",
      "マグロ・カジキ",
      "マダイ・カワハギ・アオリイカ",
      "ワカサギ・コイ",
    ],
    correctIndex: 2,
    explanation:
      "三浦半島は相模湾と東京湾に面し、マダイ・カワハギ・アオリイカなど多彩な魚種が狙える人気の釣りエリアです。",
    relatedLinks: [{ label: "神奈川県の釣り場", href: "/prefecture/kanagawa" }],
  },
  {
    id: "local-011",
    category: "local",
    difficulty: "intermediate",
    question: "秋田県の県魚にもなっている魚は？",
    choices: [
      "マダイ",
      "ハタハタ",
      "サケ",
      "アユ",
    ],
    correctIndex: 1,
    explanation:
      "ハタハタは秋田県の県魚で、冬に産卵のため沿岸に大挙して押し寄せます。しょっつる鍋が秋田の郷土料理です。",
    relatedLinks: [{ label: "秋田県の釣り場", href: "/prefecture/akita" }],
  },
  {
    id: "local-012",
    category: "local",
    difficulty: "intermediate",
    question: "琵琶湖でしか釣れない固有種の魚は？",
    choices: [
      "ブラックバス",
      "ビワマス",
      "ニジマス",
      "ヤマメ",
    ],
    correctIndex: 1,
    explanation:
      "ビワマスは琵琶湖の固有種で、サケ科の魚です。琵琶湖のトローリングやルアー釣りで人気のターゲットです。",
    relatedLinks: [{ label: "滋賀県の釣り場", href: "/prefecture/shiga" }],
  },
  {
    id: "local-013",
    category: "local",
    difficulty: "intermediate",
    question: "千葉県の房総半島南部が磯釣りのメッカとされる理由は？",
    choices: [
      "淡水魚が釣れるから",
      "黒潮の影響で温暖な水温と豊富な魚種に恵まれるから",
      "人工的に魚を放流しているから",
      "管理釣り場が多いから",
    ],
    correctIndex: 1,
    explanation:
      "房総半島南部は黒潮の影響で水温が高く、メジナ・イシダイ・ヒラマサなどの磯釣りが年間を通じて楽しめます。",
    relatedLinks: [{ label: "千葉県の釣り場", href: "/prefecture/chiba" }],
  },
  {
    id: "local-014",
    category: "local",
    difficulty: "beginner",
    question: "「明石焼き」（玉子焼き）の中に入っている海産物は？",
    choices: [
      "エビ",
      "タコ",
      "イカ",
      "カニ",
    ],
    correctIndex: 1,
    explanation:
      "明石焼きは明石海峡で獲れるマダコを使った玉子焼きで、だし汁に浸けて食べる明石の名物料理です。",
    relatedLinks: [{ label: "兵庫県の釣り場", href: "/prefecture/hyogo" }],
  },
  {
    id: "local-015",
    category: "local",
    difficulty: "intermediate",
    question: "和歌山県の串本周辺が釣りで有名な理由は？",
    choices: [
      "湖が多いから",
      "本州最南端で黒潮が最も接近し暖かい海に恵まれるから",
      "人工島があるから",
      "火山の温泉水が海に流れるから",
    ],
    correctIndex: 1,
    explanation:
      "串本は本州最南端に位置し、黒潮が最も接近するため暖かい海に恵まれ、サンゴや南方系の魚も見られます。",
    relatedLinks: [{ label: "和歌山県の釣り場", href: "/prefecture/wakayama" }],
  },
  {
    id: "local-016",
    category: "local",
    difficulty: "advanced",
    question: "「鳴門の渦潮」付近で釣れる魚の特徴は？",
    choices: [
      "全く魚がいない",
      "速い潮流で鍛えられた身の引き締まった魚が多い",
      "深海魚のみ",
      "淡水魚が混在する",
    ],
    correctIndex: 1,
    explanation:
      "鳴門海峡の速い潮流で育った魚は身が引き締まり、特にマダイやワカメは「鳴門」ブランドとして高い評価を受けています。",
    relatedLinks: [{ label: "徳島県の釣り場", href: "/prefecture/tokushima" }],
  },
  {
    id: "local-017",
    category: "local",
    difficulty: "advanced",
    question: "長崎県の平戸・五島列島が釣りの聖地と呼ばれる主な魚種は？",
    choices: [
      "ワカサギ・コイ",
      "ヒラマサ・クロ（メジナ）・イシダイ",
      "サケ・マス",
      "ブラックバス",
    ],
    correctIndex: 1,
    explanation:
      "五島列島・平戸は対馬暖流の影響で豊富な魚種に恵まれ、特にヒラマサ・クロ・イシダイの磯釣りで全国に知られます。",
    relatedLinks: [{ label: "長崎県の釣り場", href: "/prefecture/nagasaki" }],
  },
  {
    id: "local-018",
    category: "local",
    difficulty: "beginner",
    question: "沖縄で人気の大物ルアーフィッシングのターゲットは？",
    choices: [
      "マダイ",
      "ロウニンアジ（GT）",
      "サケ",
      "ワカサギ",
    ],
    correctIndex: 1,
    explanation:
      "沖縄ではロウニンアジ（GT＝Giant Trevally）を狙うGTフィッシングが盛んで、世界中からアングラーが訪れます。",
    relatedLinks: [{ label: "沖縄県の釣り場", href: "/prefecture/okinawa" }],
  },
  {
    id: "local-019",
    category: "local",
    difficulty: "intermediate",
    question: "宮城県の仙台湾で冬に盛り上がる釣りは？",
    choices: [
      "アユの友釣り",
      "カレイの投げ釣り",
      "トラウトのフライフィッシング",
      "アオリイカのエギング",
    ],
    correctIndex: 1,
    explanation:
      "仙台湾は冬のカレイ釣りのメッカで、マコガレイやイシガレイの大物が狙えます。投げ釣り大会も開催されます。",
    relatedLinks: [{ label: "宮城県の釣り場", href: "/prefecture/miyagi" }],
  },
  {
    id: "local-020",
    category: "local",
    difficulty: "intermediate",
    question: "知多半島（愛知県）がファミリーフィッシングに人気の理由は？",
    choices: [
      "入場料が全て無料だから",
      "名古屋から近く整備された釣り場が多いから",
      "亜熱帯の魚が釣れるから",
      "全ての釣り場にガイドがいるから",
    ],
    correctIndex: 1,
    explanation:
      "知多半島は名古屋から車で1時間圏内で、師崎港などの整備された漁港や釣り公園が多く家族連れに人気です。",
    relatedLinks: [{ label: "愛知県の釣り場", href: "/prefecture/aichi" }],
  },
  {
    id: "local-021",
    category: "local",
    difficulty: "advanced",
    question: "「隠岐のヒラマサ」が大物釣り師に人気の理由は？",
    choices: [
      "養殖が盛んだから",
      "対馬暖流の影響で10kg超の大型個体が回遊するから",
      "ルアーが禁止されているから",
      "冬しか釣れないから",
    ],
    correctIndex: 1,
    explanation:
      "隠岐諸島は対馬暖流の影響で10kgを超えるヒラマサの大物が回遊し、磯からのキャスティングゲームが人気です。",
    relatedLinks: [{ label: "島根県の釣り場", href: "/prefecture/shimane" }],
  },
  {
    id: "local-022",
    category: "local",
    difficulty: "beginner",
    question: "横浜・本牧海づり施設がある県は？",
    choices: [
      "東京都",
      "千葉県",
      "神奈川県",
      "静岡県",
    ],
    correctIndex: 2,
    explanation:
      "本牧海づり施設は神奈川県横浜市にある人気の釣り公園で、アジ・イワシ・カサゴなどが手軽に楽しめます。",
    relatedLinks: [{ label: "神奈川県の釣り場", href: "/prefecture/kanagawa" }],
  },
  {
    id: "local-023",
    category: "local",
    difficulty: "intermediate",
    question: "小樽港（北海道）で冬に人気の釣りターゲットは？",
    choices: [
      "カツオ",
      "ニシン",
      "マグロ",
      "シイラ",
    ],
    correctIndex: 1,
    explanation:
      "小樽港では冬〜春にニシンが回遊し、サビキ釣りで狙えます。かつての「ニシン御殿」の歴史がある港町です。",
    relatedLinks: [{ label: "北海道の釣り場", href: "/prefecture/hokkaido" }],
  },
  {
    id: "local-024",
    category: "local",
    difficulty: "advanced",
    question: "屋久島周辺で釣れる魚の特徴は？",
    choices: [
      "淡水魚のみ",
      "黒潮直撃で南方系の大物（カンパチ・GT等）が狙える",
      "小型魚のみ",
      "渓流魚のみ",
    ],
    correctIndex: 1,
    explanation:
      "屋久島は黒潮が直撃する位置にあり、カンパチ・ロウニンアジ・キハダマグロなど南方系の大物が磯から狙えます。",
    relatedLinks: [{ label: "鹿児島県の釣り場", href: "/prefecture/kagoshima" }],
  },
  {
    id: "local-025",
    category: "local",
    difficulty: "intermediate",
    question: "瀬戸内海の「しまなみ海道」周辺で釣れる代表魚は？",
    choices: [
      "サケ・マス",
      "マダイ・メバル・アオリイカ",
      "マグロ・カジキ",
      "イトウ",
    ],
    correctIndex: 1,
    explanation:
      "しまなみ海道周辺は潮流が速く、マダイ・メバル・アオリイカなどの好ポイントが島々に点在しています。",
    relatedLinks: [{ label: "広島県の釣り場", href: "/prefecture/hiroshima" }],
  },
  {
    id: "local-026",
    category: "local",
    difficulty: "advanced",
    question: "「下関のフグ」が有名な下関市がある県は？",
    choices: [
      "広島県",
      "福岡県",
      "山口県",
      "島根県",
    ],
    correctIndex: 2,
    explanation:
      "下関市は山口県にあり、トラフグの水揚げ量日本一として知られています。下関ではフグを「ふく（福）」と呼びます。",
    relatedLinks: [{ label: "山口県の釣り場", href: "/prefecture/yamaguchi" }],
  },
  {
    id: "local-027",
    category: "local",
    difficulty: "beginner",
    question: "「タコの街」として知られる明石の名産品は？",
    choices: [
      "明石焼き（玉子焼き）",
      "たこ焼き",
      "イカ焼き",
      "焼き魚定食",
    ],
    correctIndex: 0,
    explanation:
      "明石は全国有数のタコの産地で、明石焼き（玉子焼き）は明石のマダコを使った名物料理です。大阪のたこ焼きとは別物です。",
    relatedLinks: [{ label: "兵庫県の釣り場", href: "/prefecture/hyogo" }],
  },
  {
    id: "local-028",
    category: "local",
    difficulty: "advanced",
    question: "男鹿半島（秋田県）の磯釣りで人気のターゲットは？",
    choices: [
      "マダイ・クロダイ・メジナ",
      "サケのみ",
      "淡水魚",
      "カジキマグロ",
    ],
    correctIndex: 0,
    explanation:
      "男鹿半島は日本海に突き出た地形で潮通しが良く、マダイ・クロダイ・メジナなどの磯釣りが盛んです。",
    relatedLinks: [{ label: "秋田県の釣り場", href: "/prefecture/akita" }],
  },
  {
    id: "local-029",
    category: "local",
    difficulty: "intermediate",
    question: "「天草」がある都道府県は？",
    choices: [
      "長崎県",
      "大分県",
      "熊本県",
      "鹿児島県",
    ],
    correctIndex: 2,
    explanation:
      "天草は熊本県にある島々で、マダイ・ヒラメ・アオリイカなど豊富な魚種が釣れる九州屈指の釣りスポットです。",
    relatedLinks: [{ label: "熊本県の釣り場", href: "/prefecture/kumamoto" }],
  },
  {
    id: "local-030",
    category: "local",
    difficulty: "advanced",
    question: "佐渡島（新潟県）が釣りで注目される魚種は？",
    choices: [
      "カジキマグロのみ",
      "ブリ・マダイ・アオリイカなど日本海の豊富な魚種",
      "淡水魚のみ",
      "ハタハタのみ",
    ],
    correctIndex: 1,
    explanation:
      "佐渡島は対馬暖流の影響でブリ・マダイ・アオリイカなど多彩な魚種に恵まれ、離島ならではの大物が期待できます。",
    relatedLinks: [{ label: "新潟県の釣り場", href: "/prefecture/niigata" }],
  },
];