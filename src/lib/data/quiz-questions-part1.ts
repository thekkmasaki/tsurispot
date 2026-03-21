/**
 * クイズ問題データ Part1
 * カテゴリ: fish-knowledge, seasonal-fish, fishing-methods, spot-detective
 */
import type { QuizQuestion } from "@/types/quiz";

export const quizQuestionsPart1: QuizQuestion[] = [
  // ========================================
  // fish-knowledge (魚種図鑑クイズ) 50問
  // ========================================
  {
    id: "fish-001",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "メバルの「メバル」という名前の由来は？",
    choices: [
      "目が大きく張り出している「目張」から",
      "春に群れて泳ぐ「群れ張る」から",
      "海面すれすれを泳ぐ「目端」から",
      "漁獲量が多い「恵張る」から",
    ],
    correctIndex: 0,
    explanation:
      "メバルは大きな目が特徴的な根魚で、「目が張っている」ことから「目張（メバル）」と名付けられました。",
    relatedLinks: [{ label: "メバルの詳細", href: "/fish/mebaru" }],
  },
  {
    id: "fish-002",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "アジの体側にある特徴的な構造は何と呼ばれる？",
    choices: [
      "鱗板（りんばん）",
      "稜鱗（ぜいご）",
      "側線鱗（そくせんりん）",
      "尾柄鱗（びへいりん）",
    ],
    correctIndex: 1,
    explanation:
      "アジの体側にある硬いトゲ状の鱗は「稜鱗（ぜいご）」と呼ばれ、アジ科の魚に共通する特徴です。",
    relatedLinks: [{ label: "アジの詳細", href: "/fish/aji" }],
  },
  {
    id: "fish-003",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "カサゴはどのような場所に生息する魚？",
    choices: [
      "外洋の表層を回遊する",
      "砂泥底に潜って暮らす",
      "岩礁やテトラの隙間に潜む",
      "河川の上流域に棲む",
    ],
    correctIndex: 2,
    explanation:
      "カサゴは代表的な根魚で、岩礁帯やテトラポッドの隙間など障害物の周りに生息しています。",
    relatedLinks: [{ label: "カサゴの詳細", href: "/fish/kasago" }],
  },
  {
    id: "fish-004",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "イワシの漢字「鰯」に含まれる意味は？",
    choices: [
      "強い魚",
      "弱い魚",
      "速い魚",
      "光る魚",
    ],
    correctIndex: 1,
    explanation:
      "イワシは漢字で「鰯」と書き、魚へんに弱いという字が使われています。水揚げ後すぐに傷むことが由来です。",
    relatedLinks: [{ label: "イワシの詳細", href: "/fish/iwashi" }],
  },
  {
    id: "fish-005",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "クロダイの別名として最も一般的なものは？",
    choices: [
      "グレ",
      "チヌ",
      "セイゴ",
      "ハネ",
    ],
    correctIndex: 1,
    explanation:
      "クロダイは関西を中心に「チヌ」という別名で広く知られています。グレはメジナの別名です。",
    relatedLinks: [{ label: "クロダイの詳細", href: "/fish/kurodai" }],
  },
  {
    id: "fish-006",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "キスが好む海底の環境は？",
    choices: [
      "岩礁帯",
      "砂地の海底",
      "海藻が茂る磯場",
      "深海の泥底",
    ],
    correctIndex: 1,
    explanation:
      "キスは砂地の海底を好み、砂に潜む虫やエビなどを食べています。投げ釣りの人気ターゲットです。",
    relatedLinks: [{ label: "キスの詳細", href: "/fish/kisu" }],
  },
  {
    id: "fish-007",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "スズキの出世名で正しい順番は？",
    choices: [
      "セイゴ → フッコ → スズキ",
      "フッコ → セイゴ → スズキ",
      "スズキ → セイゴ → フッコ",
      "ハネ → スズキ → セイゴ",
    ],
    correctIndex: 0,
    explanation:
      "スズキは出世魚で、関東では小さい順にセイゴ→フッコ→スズキと名前が変わります。",
    relatedLinks: [{ label: "スズキの詳細", href: "/fish/seabass" }],
  },
  {
    id: "fish-008",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "サバの体表に見られる特徴的な模様は？",
    choices: [
      "縦縞模様",
      "水玉模様",
      "波状の横縞模様",
      "無地で光沢がある",
    ],
    correctIndex: 2,
    explanation:
      "マサバの背中には青緑色の波状の横縞模様があり、「サバの生き腐れ」と言われるほど鮮度が落ちやすい魚です。",
    relatedLinks: [{ label: "サバの詳細", href: "/fish/saba" }],
  },
  {
    id: "fish-009",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "カレイとヒラメの見分け方で正しいのは？",
    choices: [
      "カレイは左向き、ヒラメは右向き",
      "カレイは右向き、ヒラメは左向き",
      "大きい方がヒラメ、小さい方がカレイ",
      "色が濃い方がカレイ",
    ],
    correctIndex: 1,
    explanation:
      "「左ヒラメに右カレイ」という覚え方があり、腹を下にして置いたとき左向きがヒラメ、右向きがカレイです。",
    relatedLinks: [
      { label: "カレイの詳細", href: "/fish/karei" },
      { label: "ヒラメの詳細", href: "/fish/hirame" },
    ],
  },
  {
    id: "fish-010",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "アオリイカの釣り方として最もポピュラーなのは？",
    choices: [
      "サビキ釣り",
      "投げ釣り",
      "エギング",
      "フライフィッシング",
    ],
    correctIndex: 2,
    explanation:
      "アオリイカはエビに似せた疑似餌「エギ」を使うエギングで狙うのが最もポピュラーです。",
    relatedLinks: [{ label: "アオリイカの詳細", href: "/fish/aoriika" }],
  },
  {
    id: "fish-011",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "タチウオの体の特徴として正しいのは？",
    choices: [
      "体が丸く太い",
      "体が平たく銀色に光る",
      "体に赤い斑点がある",
      "体が透明で骨が見える",
    ],
    correctIndex: 1,
    explanation:
      "タチウオは刀のように平たく銀色に輝く体が特徴です。名前も「太刀魚」に由来します。",
    relatedLinks: [{ label: "タチウオの詳細", href: "/fish/tachiuo" }],
  },
  {
    id: "fish-012",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "ハゼ釣りの代表的な餌は何？",
    choices: [
      "オキアミ",
      "青イソメ",
      "練り餌",
      "ルアー",
    ],
    correctIndex: 1,
    explanation:
      "ハゼ釣りでは青イソメ（アオイソメ）が最も一般的な餌です。ちょい投げやミャク釣りで手軽に楽しめます。",
    relatedLinks: [{ label: "ハゼの詳細", href: "/fish/haze" }],
  },
  {
    id: "fish-013",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "ブリの出世名として正しい組み合わせは？（関東）",
    choices: [
      "ワカシ → イナダ → ワラサ → ブリ",
      "ツバス → ハマチ → メジロ → ブリ",
      "イナダ → ワカシ → ブリ → ワラサ",
      "コブリ → チュウブリ → オオブリ → ブリ",
    ],
    correctIndex: 0,
    explanation:
      "ブリは関東ではワカシ→イナダ→ワラサ→ブリの順に名前が変わります。関西ではツバス→ハマチ→メジロ→ブリです。",
    relatedLinks: [{ label: "ブリの詳細", href: "/fish/buri" }],
  },
  {
    id: "fish-014",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "マダイが「おめでたい魚」とされる理由に最も関係するのは？",
    choices: [
      "味が甘いから",
      "赤い体色と「たい」の語呂合わせ",
      "産卵数が多いから",
      "寿命が長いから",
    ],
    correctIndex: 1,
    explanation:
      "マダイは美しい赤色の体と「めでたい」の語呂合わせから、祝い事に欠かせない魚とされています。",
    relatedLinks: [{ label: "マダイの詳細", href: "/fish/madai" }],
  },
  {
    id: "fish-015",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "メジナの関西での別名は？",
    choices: [
      "チヌ",
      "グレ",
      "クエ",
      "ハネ",
    ],
    correctIndex: 1,
    explanation:
      "メジナは関西では「グレ」と呼ばれ、磯釣りの人気ターゲットです。チヌはクロダイの別名です。",
    relatedLinks: [{ label: "メジナの詳細", href: "/fish/mejina" }],
  },
  {
    id: "fish-016",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "アイナメが属する魚のグループは？",
    choices: [
      "アジ科",
      "カサゴ目",
      "カジカ目（アイナメ科）",
      "スズキ目",
    ],
    correctIndex: 2,
    explanation:
      "アイナメはカジカ目アイナメ科に属する根魚で、岩礁帯に生息し穴釣りやブラクリで狙えます。",
    relatedLinks: [{ label: "アイナメの詳細", href: "/fish/ainame" }],
  },
  {
    id: "fish-017",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "カワハギが「エサ取り名人」と呼ばれる理由は？",
    choices: [
      "大量のエサを食べるから",
      "小さな口で器用にエサだけ取るから",
      "他の魚のエサを横取りするから",
      "エサを吐き出す習性があるから",
    ],
    correctIndex: 1,
    explanation:
      "カワハギはおちょぼ口で針に掛からずエサだけ器用に食べてしまうため「エサ取り名人」と呼ばれます。",
    relatedLinks: [{ label: "カワハギの詳細", href: "/fish/kawahagi" }],
  },
  {
    id: "fish-018",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "サヨリの口の特徴は？",
    choices: [
      "上顎が長く突き出ている",
      "下顎が長く突き出ている",
      "口が丸く大きい",
      "口がない（プランクトンを濾過する）",
    ],
    correctIndex: 1,
    explanation:
      "サヨリは下顎が細く長く突き出ているのが特徴です。この長い下顎は餌を捕らえるのに役立ちます。",
    relatedLinks: [{ label: "サヨリの詳細", href: "/fish/sayori" }],
  },
  {
    id: "fish-019",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "マダコの心臓はいくつある？",
    choices: [
      "1つ",
      "2つ",
      "3つ",
      "4つ",
    ],
    correctIndex: 2,
    explanation:
      "マダコには心臓が3つあります。1つがメインの心臓、残り2つはエラに血液を送るエラ心臓です。",
    relatedLinks: [{ label: "マダコの詳細", href: "/fish/madako" }],
  },
  {
    id: "fish-020",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "ヒラメの歯の特徴は？",
    choices: [
      "歯がほとんどない",
      "鋭い犬歯状の歯を持つ",
      "すり潰すための平らな歯",
      "くちばし状の歯",
    ],
    correctIndex: 1,
    explanation:
      "ヒラメは小魚を捕食するフィッシュイーターで、鋭い犬歯状の歯を持っています。カレイとの違いの一つです。",
    relatedLinks: [{ label: "ヒラメの詳細", href: "/fish/hirame" }],
  },
  {
    id: "fish-021",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "イシダイの幼魚に見られる特徴的な模様は？",
    choices: [
      "赤い水玉模様",
      "白と黒の縦縞模様",
      "青い横縞模様",
      "金色の斑点",
    ],
    correctIndex: 1,
    explanation:
      "イシダイの幼魚には白と黒の鮮明な縦縞模様があり「シマダイ」とも呼ばれます。成魚になると縞が薄れます。",
    relatedLinks: [{ label: "イシダイの詳細", href: "/fish/ishidai" }],
  },
  {
    id: "fish-022",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "カンパチとブリを見分けるポイントは？",
    choices: [
      "カンパチの方が体が細長い",
      "カンパチの頭部に八の字模様がある",
      "ブリの方が目が大きい",
      "カンパチには稜鱗がない",
    ],
    correctIndex: 1,
    explanation:
      "カンパチは頭部を正面から見ると目の上に漢字の「八」に見える暗色の帯があり、これが名前の由来です。",
    relatedLinks: [{ label: "カンパチの詳細", href: "/fish/kanpachi" }],
  },
  {
    id: "fish-023",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "ワカサギ釣りで最も知られる釣り方は？",
    choices: [
      "磯からのフカセ釣り",
      "氷上の穴釣り",
      "船からのジギング",
      "ルアーのキャスティング",
    ],
    correctIndex: 1,
    explanation:
      "ワカサギは冬に結氷した湖の氷に穴を開けて釣る「穴釣り」が有名で、冬のレジャーとして人気です。",
    relatedLinks: [{ label: "ワカサギの詳細", href: "/fish/wakasagi" }],
  },
  {
    id: "fish-024",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "マゴチが海底で獲物を待つときの姿勢は？",
    choices: [
      "岩陰に立って待つ",
      "砂に体を埋めて目だけ出す",
      "海藻に擬態する",
      "水中を旋回しながら待つ",
    ],
    correctIndex: 1,
    explanation:
      "マゴチは扁平な体を砂に埋めて目だけ出し、上を通る小魚やエビを待ち伏せて捕食します。",
    relatedLinks: [{ label: "マゴチの詳細", href: "/fish/magochi" }],
  },
  {
    id: "fish-025",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "ボラが水面からジャンプする行動の主な理由と考えられているのは？",
    choices: [
      "求愛行動",
      "寄生虫を落とすため",
      "天敵から逃げるため",
      "正確な理由は解明されていない",
    ],
    correctIndex: 3,
    explanation:
      "ボラのジャンプは有名ですが、寄生虫除去説や酸素摂取説など諸説あり、正確な理由は未だ解明されていません。",
    relatedLinks: [{ label: "ボラの詳細", href: "/fish/bora" }],
  },
  {
    id: "fish-026",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "クロソイとカサゴを見分けるポイントは？",
    choices: [
      "クロソイの方が体色が赤い",
      "クロソイの目の下に涙骨棘がある",
      "カサゴの方が体が大きい",
      "カサゴには背びれがない",
    ],
    correctIndex: 1,
    explanation:
      "クロソイは目の下に3本の涙骨棘（るいこつきょく）があるのが特徴です。カサゴにはこの棘がありません。",
    relatedLinks: [{ label: "クロソイの詳細", href: "/fish/kurosoi" }],
  },
  {
    id: "fish-027",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "アナゴとウナギの見分け方で正しいのは？",
    choices: [
      "アナゴは淡水、ウナギは海水に棲む",
      "アナゴには側線に沿った白い点がある",
      "ウナギの方が体が短い",
      "アナゴは下顎が出ている",
    ],
    correctIndex: 1,
    explanation:
      "アナゴは体の側面に白い点が一列に並んでいるのが特徴です。ウナギは下顎が出ていますがアナゴは上顎が出ています。",
    relatedLinks: [{ label: "アナゴの詳細", href: "/fish/anago" }],
  },
  {
    id: "fish-028",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "イサキの旬の時期はいつ頃？",
    choices: [
      "冬（12〜2月）",
      "春（3〜5月）",
      "初夏（6〜7月）",
      "秋（9〜11月）",
    ],
    correctIndex: 2,
    explanation:
      "イサキは梅雨の時期（6〜7月）が旬で、産卵前に脂がのって最も美味しくなります。「梅雨イサキ」と呼ばれます。",
    relatedLinks: [{ label: "イサキの詳細", href: "/fish/isaki" }],
  },
  {
    id: "fish-029",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "ホウボウが海底を「歩く」ように見える理由は？",
    choices: [
      "尾びれで砂を蹴る",
      "胸びれの一部が脚のように変化している",
      "腹びれを足のように使う",
      "体をくねらせて這う",
    ],
    correctIndex: 1,
    explanation:
      "ホウボウは胸びれの下部の軟条が指のように分離しており、これを使って海底を歩くように移動します。",
    relatedLinks: [{ label: "ホウボウの詳細", href: "/fish/houbou" }],
  },
  {
    id: "fish-030",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "フグ毒「テトロドトキシン」の特徴として正しいのは？",
    choices: [
      "加熱すれば無毒化できる",
      "フグ自身が体内で作り出す",
      "加熱しても分解されない",
      "アルコールで中和できる",
    ],
    correctIndex: 2,
    explanation:
      "テトロドトキシンは非常に安定した毒素で、通常の加熱調理では分解されません。フグは食物連鎖で毒を蓄積します。",
    relatedLinks: [{ label: "フグの詳細", href: "/fish/fugu" }],
  },
  {
    id: "fish-031",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "サビキ釣りで最もよく釣れる魚は？",
    choices: [
      "マダイ",
      "ヒラメ",
      "アジ・サバ・イワシ",
      "カレイ",
    ],
    correctIndex: 2,
    explanation:
      "サビキ釣りは疑似餌の仕掛けとコマセ（撒き餌）を使う釣り方で、アジ・サバ・イワシなどの回遊魚が主なターゲットです。",
    relatedLinks: [{ label: "アジの詳細", href: "/fish/aji" }],
  },
  {
    id: "fish-032",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "マダイの体色が赤い主な理由は？",
    choices: [
      "血液中のヘモグロビンが多いから",
      "エビやカニなど甲殻類を食べるから",
      "日光を多く浴びるから",
      "体温が高いから",
    ],
    correctIndex: 1,
    explanation:
      "マダイの赤色はエビやカニに含まれるアスタキサンチンという色素に由来します。甲殻類を食べることで体色が赤くなります。",
    relatedLinks: [{ label: "マダイの詳細", href: "/fish/madai" }],
  },
  {
    id: "fish-033",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "ウミタナゴの特徴的な繁殖方法は？",
    choices: [
      "卵を口の中で育てる",
      "稚魚を産む卵胎生",
      "オスが卵を守る",
      "サンゴに産卵する",
    ],
    correctIndex: 1,
    explanation:
      "ウミタナゴは卵胎生の魚で、メスの体内で卵が孵化し、稚魚の状態で産まれてきます。",
    relatedLinks: [{ label: "ウミタナゴの詳細", href: "/fish/umitanago" }],
  },
  {
    id: "fish-034",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "アユが「香魚」と呼ばれる理由は？",
    choices: [
      "花の匂いがするから",
      "スイカやキュウリに似た香りがするから",
      "焼くと煙が香ばしいから",
      "川の匂いを好むから",
    ],
    correctIndex: 1,
    explanation:
      "アユは新鮮な状態でスイカやキュウリに似た独特の芳香があり、「香魚」の別名を持ちます。",
    relatedLinks: [{ label: "アユの詳細", href: "/fish/ayu" }],
  },
  {
    id: "fish-035",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "ニジマスの名前の由来は？",
    choices: [
      "雨上がりに釣れやすいから",
      "体側に虹色の帯があるから",
      "7色の鱗を持つから",
      "虹の出る川に棲むから",
    ],
    correctIndex: 1,
    explanation:
      "ニジマスは体側にピンクから赤色の帯状の模様があり、虹のように見えることが名前の由来です。英名もRainbow Troutです。",
    relatedLinks: [{ label: "ニジマスの詳細", href: "/fish/nijimasu" }],
  },
  {
    id: "fish-036",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "カマスの食性として正しいのは？",
    choices: [
      "海藻を食べる草食性",
      "プランクトンを濾過する",
      "小魚を追いかけて食べる肉食性",
      "貝類を殻ごと食べる",
    ],
    correctIndex: 2,
    explanation:
      "カマスは鋭い歯を持つ肉食魚で、小魚を積極的に追いかけて捕食します。ルアーでもよく釣れます。",
    relatedLinks: [{ label: "カマスの詳細", href: "/fish/kamasu" }],
  },
  {
    id: "fish-037",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "サワラの漢字「鰆」に含まれる季節は？",
    choices: [
      "夏",
      "秋",
      "冬",
      "春",
    ],
    correctIndex: 3,
    explanation:
      "サワラは漢字で「鰆」と書き、魚へんに春です。瀬戸内海では春に多く獲れることが由来とされています。",
    relatedLinks: [{ label: "サワラの詳細", href: "/fish/sawara" }],
  },
  {
    id: "fish-038",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "コウイカの別名「スミイカ」の由来は？",
    choices: [
      "墨汁のように黒い体色だから",
      "大量の墨を吐くから",
      "墨のような味がするから",
      "墨田川で多く獲れたから",
    ],
    correctIndex: 1,
    explanation:
      "コウイカは他のイカに比べて多量の濃い墨を吐くことから「スミイカ」と呼ばれています。",
    relatedLinks: [{ label: "コウイカの詳細", href: "/fish/kouika" }],
  },
  {
    id: "fish-039",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "ブラックバスが日本に持ち込まれた元々の目的は？",
    choices: [
      "観賞用として",
      "食用の養殖目的",
      "害虫駆除のため",
      "釣りの対象魚として",
    ],
    correctIndex: 1,
    explanation:
      "ブラックバスは1925年に食用目的で芦ノ湖に放流されました。現在は特定外来生物に指定されています。",
    relatedLinks: [{ label: "ブラックバスの詳細", href: "/fish/blackbass" }],
  },
  {
    id: "fish-040",
    category: "fish-knowledge",
    difficulty: "intermediate",
    question: "シイラの英名は何？",
    choices: [
      "Yellowtail",
      "Mahi-mahi",
      "Swordfish",
      "Barracuda",
    ],
    correctIndex: 1,
    explanation:
      "シイラの英名はMahi-mahi（マヒマヒ）で、ハワイ語で「強い強い」を意味します。Dolphinfishとも呼ばれます。",
    relatedLinks: [{ label: "シイラの詳細", href: "/fish/shiira" }],
  },
  {
    id: "fish-041",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "イトウが「日本最大の淡水魚」と言われる最大体長はおよそ？",
    choices: [
      "50cm程度",
      "80cm程度",
      "1m程度",
      "1.5m程度",
    ],
    correctIndex: 3,
    explanation:
      "イトウは日本最大の淡水魚で、最大で1.5m以上に成長した記録があります。北海道に生息し、絶滅危惧種です。",
    relatedLinks: [{ label: "イトウの詳細", href: "/fish/itou" }],
  },
  {
    id: "fish-042",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "アカメが主に生息する地域は？",
    choices: [
      "北海道・東北",
      "関東・中部",
      "四国・九州の太平洋側",
      "沖縄",
    ],
    correctIndex: 2,
    explanation:
      "アカメは高知県の浦戸湾や宮崎県など、四国・九州の太平洋側にのみ生息する希少な魚です。",
    relatedLinks: [{ label: "アカメの詳細", href: "/fish/akame" }],
  },
  {
    id: "fish-043",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "クエの別名として知られるのは？",
    choices: [
      "アラ",
      "モロコ",
      "ハタ",
      "クエは地域によりアラ・モロコなど多数の別名を持つ",
    ],
    correctIndex: 3,
    explanation:
      "クエは九州では「アラ」、四国では「モロコ」など地域によって様々な別名があります。高級魚として珍重されます。",
    relatedLinks: [{ label: "クエの詳細", href: "/fish/kue" }],
  },
  {
    id: "fish-044",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "ヤリイカとケンサキイカの見分けで正しいのは？",
    choices: [
      "ヤリイカの方が胴が太い",
      "ヤリイカの方がエンペラ（ひれ）が小さく先が尖る",
      "ケンサキイカの方が体が小さい",
      "色だけで見分けられる",
    ],
    correctIndex: 1,
    explanation:
      "ヤリイカは胴が細く先端が槍のように尖り、エンペラも小さめです。ケンサキイカはエンペラが大きく丸みがあります。",
    relatedLinks: [
      { label: "ヤリイカの詳細", href: "/fish/yariika" },
      { label: "ケンサキイカの詳細", href: "/fish/kensaki-ika" },
    ],
  },
  {
    id: "fish-045",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "ハタハタの卵の別名は？",
    choices: [
      "イクラ",
      "ブリコ",
      "トビコ",
      "カズノコ",
    ],
    correctIndex: 1,
    explanation:
      "ハタハタの卵は「ブリコ」と呼ばれ、秋田県の名産品です。プチプチとした食感が特徴です。",
    relatedLinks: [{ label: "ハタハタの詳細", href: "/fish/hatahata" }],
  },
  {
    id: "fish-046",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "ロウニンアジ（GT）の「GT」は何の略？",
    choices: [
      "Great Tuna",
      "Giant Trevally",
      "Gold Tail",
      "Grand Trophy",
    ],
    correctIndex: 1,
    explanation:
      "GTはGiant Trevally（ジャイアント・トレバリー）の略で、和名のロウニンアジは浪人のように単独で行動することに由来します。",
    relatedLinks: [{ label: "ロウニンアジの詳細", href: "/fish/rounin-aji" }],
  },
  {
    id: "fish-047",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "イイダコの名前の由来は？",
    choices: [
      "飯田さんが発見したから",
      "体内の卵が米粒（飯）に見えるから",
      "稲穂の時期に獲れるから",
      "飯蛸という地名で多く獲れたから",
    ],
    correctIndex: 1,
    explanation:
      "イイダコのメスの胴には卵が詰まっており、その卵が炊いたご飯（飯）のように見えることが名前の由来です。",
    relatedLinks: [{ label: "イイダコの詳細", href: "/fish/iidako" }],
  },
  {
    id: "fish-048",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "カツオの「たたき」で有名な県は？",
    choices: [
      "静岡県",
      "高知県",
      "三重県",
      "宮崎県",
    ],
    correctIndex: 1,
    explanation:
      "カツオのたたきは高知県の郷土料理として有名です。表面を藁で炙り、薬味とポン酢で食べるのが伝統的な食べ方です。",
    relatedLinks: [{ label: "カツオの詳細", href: "/fish/katsuo" }],
  },
  {
    id: "fish-049",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "キンメダイは分類上どのグループに属する？",
    choices: [
      "タイ科の仲間",
      "キンメダイ目キンメダイ科",
      "スズキ目の仲間",
      "カサゴ目の仲間",
    ],
    correctIndex: 1,
    explanation:
      "キンメダイは名前に「タイ」とつきますがタイの仲間ではなく、キンメダイ目キンメダイ科に属する深海魚です。",
    relatedLinks: [{ label: "キンメダイの詳細", href: "/fish/kinmedai" }],
  },
  {
    id: "fish-050",
    category: "fish-knowledge",
    difficulty: "advanced",
    question: "エソが練り製品の原料として重宝される理由は？",
    choices: [
      "脂が多くジューシーだから",
      "身に弾力がありかまぼこに最適だから",
      "骨が柔らかいから",
      "大量に安く仕入れられるから",
    ],
    correctIndex: 1,
    explanation:
      "エソは小骨が多く刺身には不向きですが、身の弾力が強く高級かまぼこやちくわの原料として重宝されています。",
    relatedLinks: [{ label: "エソの詳細", href: "/fish/eso" }],
  },

  // ========================================
  // seasonal-fish (旬の魚クイズ) 30問
  // ========================================
  {
    id: "seasonal-001",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "「サビキ釣りのハイシーズン」と言えばどの時期？",
    choices: [
      "冬（12〜2月）",
      "春（3〜4月）",
      "夏〜秋（6〜11月）",
      "年間通して変わらない",
    ],
    correctIndex: 2,
    explanation:
      "サビキ釣りのハイシーズンは夏から秋にかけてで、アジ・サバ・イワシなどの回遊魚が岸に寄ってきます。",
    relatedLinks: [{ label: "6月の釣りガイド", href: "/seasonal/june" }],
  },
  {
    id: "seasonal-002",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "カレイ釣りのベストシーズンはいつ？",
    choices: [
      "春〜初夏",
      "真夏",
      "晩秋〜冬",
      "梅雨時期",
    ],
    correctIndex: 2,
    explanation:
      "カレイは晩秋から冬にかけて産卵のため浅場に寄ってくるため、投げ釣りの好期となります。",
    relatedLinks: [
      { label: "11月の釣りガイド", href: "/seasonal/november" },
      { label: "カレイの詳細", href: "/fish/karei" },
    ],
  },
  {
    id: "seasonal-003",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "「花見ガレイ」とはいつ頃のカレイのこと？",
    choices: [
      "秋の紅葉の時期",
      "春の桜の時期",
      "夏の花火の時期",
      "冬の雪の時期",
    ],
    correctIndex: 1,
    explanation:
      "「花見ガレイ」は春（3〜4月）に産卵後の体力回復のためエサを活発に食べるカレイのことを指します。",
    relatedLinks: [
      { label: "3月の釣りガイド", href: "/seasonal/march" },
      { label: "カレイの詳細", href: "/fish/karei" },
    ],
  },
  {
    id: "seasonal-004",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "アオリイカのエギング最盛期は年に何回ある？",
    choices: [
      "1回（秋のみ）",
      "2回（春と秋）",
      "3回（春・夏・秋）",
      "通年同じ",
    ],
    correctIndex: 1,
    explanation:
      "アオリイカは春（親イカ）と秋（新子）の年2回がベストシーズンです。春は大型、秋は数釣りが楽しめます。",
    relatedLinks: [{ label: "アオリイカの詳細", href: "/fish/aoriika" }],
  },
  {
    id: "seasonal-005",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "「寒ブリ」が最も美味しいとされる時期は？",
    choices: [
      "春（3〜5月）",
      "夏（6〜8月）",
      "秋（9〜11月）",
      "冬（12〜2月）",
    ],
    correctIndex: 3,
    explanation:
      "寒ブリは冬（12〜2月）に脂がのって最も美味しくなります。富山県の氷見や石川県が特に有名です。",
    relatedLinks: [
      { label: "12月の釣りガイド", href: "/seasonal/december" },
      { label: "ブリの詳細", href: "/fish/buri" },
    ],
  },
  {
    id: "seasonal-006",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "夏の堤防釣りで最も手軽に楽しめるターゲットは？",
    choices: [
      "ヒラメ",
      "マダイ",
      "アジ・イワシ",
      "カレイ",
    ],
    correctIndex: 2,
    explanation:
      "夏は海水温が上がりアジやイワシの回遊が活発になるため、堤防からのサビキ釣りで手軽に数釣りが楽しめます。",
    relatedLinks: [{ label: "7月の釣りガイド", href: "/seasonal/july" }],
  },
  {
    id: "seasonal-007",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "キスの投げ釣りシーズンはいつ頃？",
    choices: [
      "冬（12〜2月）",
      "春〜秋（5〜10月）",
      "梅雨のみ（6月）",
      "通年変わらない",
    ],
    correctIndex: 1,
    explanation:
      "キスは水温が上がる5月頃から接岸し始め、10月頃まで投げ釣りで狙えます。盛期は6〜9月です。",
    relatedLinks: [
      { label: "5月の釣りガイド", href: "/seasonal/may" },
      { label: "キスの詳細", href: "/fish/kisu" },
    ],
  },
  {
    id: "seasonal-008",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "冬に堤防から狙いやすい根魚はどれ？",
    choices: [
      "アジ",
      "カサゴ・メバル",
      "イワシ",
      "シイラ",
    ],
    correctIndex: 1,
    explanation:
      "冬は回遊魚が減りますが、カサゴやメバルなどの根魚は通年狙えます。特にメバルは冬が好シーズンです。",
    relatedLinks: [
      { label: "1月の釣りガイド", href: "/seasonal/january" },
      { label: "カサゴの詳細", href: "/fish/kasago" },
    ],
  },
  {
    id: "seasonal-009",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "「秋の荒食い」でタチウオが活発になる時期は？",
    choices: [
      "8月",
      "9〜11月",
      "12月",
      "1月",
    ],
    correctIndex: 1,
    explanation:
      "タチウオは秋（9〜11月）に越冬前の体力を蓄えるため活発にエサを食べる「荒食い」をします。",
    relatedLinks: [
      { label: "10月の釣りガイド", href: "/seasonal/october" },
      { label: "タチウオの詳細", href: "/fish/tachiuo" },
    ],
  },
  {
    id: "seasonal-010",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "「初ガツオ」と「戻りガツオ」、脂がのっているのは？",
    choices: [
      "初ガツオ（春〜初夏）",
      "戻りガツオ（秋）",
      "どちらも同じ",
      "時期ではなく個体差",
    ],
    correctIndex: 1,
    explanation:
      "戻りガツオ（秋）は北の海でたっぷりエサを食べて南下するため脂がのっています。初ガツオはさっぱりとした味わいです。",
    relatedLinks: [{ label: "カツオの詳細", href: "/fish/katsuo" }],
  },
  {
    id: "seasonal-011",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "ハゼ釣りの最盛期はいつ？",
    choices: [
      "春（3〜5月）",
      "夏〜秋（7〜10月）",
      "冬（12〜2月）",
      "梅雨（6月）",
    ],
    correctIndex: 1,
    explanation:
      "ハゼは夏に成長して秋にかけて型が良くなります。7〜10月が最盛期で、特に9〜10月は良型が期待できます。",
    relatedLinks: [
      { label: "9月の釣りガイド", href: "/seasonal/september" },
      { label: "ハゼの詳細", href: "/fish/haze" },
    ],
  },
  {
    id: "seasonal-012",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "メバルが「春告魚（はるつげうお）」と呼ばれる理由は？",
    choices: [
      "春にだけ釣れるから",
      "春に産卵するから",
      "早春に釣れ始め春の訪れを告げるから",
      "春に体色が変わるから",
    ],
    correctIndex: 2,
    explanation:
      "メバルは他の魚より早く2〜3月に活発になり始めるため、釣り人に春の訪れを告げる魚として「春告魚」と呼ばれます。",
    relatedLinks: [
      { label: "2月の釣りガイド", href: "/seasonal/february" },
      { label: "メバルの詳細", href: "/fish/mebaru" },
    ],
  },
  {
    id: "seasonal-013",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "マダコ釣りのベストシーズンは？",
    choices: [
      "春（3〜5月）",
      "夏（6〜8月）",
      "秋（9〜11月）",
      "冬（12〜2月）",
    ],
    correctIndex: 1,
    explanation:
      "マダコは夏（6〜8月）がベストシーズンで、産卵のために浅場に寄ってきて岸からでも狙いやすくなります。",
    relatedLinks: [
      { label: "7月の釣りガイド", href: "/seasonal/july" },
      { label: "マダコの詳細", href: "/fish/madako" },
    ],
  },
  {
    id: "seasonal-014",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "サヨリの堤防からの釣りシーズンは？",
    choices: [
      "春と秋",
      "夏のみ",
      "冬のみ",
      "通年同じ",
    ],
    correctIndex: 0,
    explanation:
      "サヨリは春（3〜5月）と秋（9〜11月）に沿岸に寄ってきます。特に秋は群れが大きく数釣りが楽しめます。",
    relatedLinks: [{ label: "サヨリの詳細", href: "/fish/sayori" }],
  },
  {
    id: "seasonal-015",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "クロダイ（チヌ）の「乗っ込み」とは何の時期？",
    choices: [
      "越冬のため深場に移動する時期",
      "産卵のため浅場に入ってくる時期",
      "エサが豊富で活発に動く夏",
      "稚魚が河口に集まる時期",
    ],
    correctIndex: 1,
    explanation:
      "「乗っ込み」は春（3〜5月）にクロダイが産卵のため浅場に入ってくる時期で、大型が岸から狙えるチャンスです。",
    relatedLinks: [
      { label: "4月の釣りガイド", href: "/seasonal/april" },
      { label: "クロダイの詳細", href: "/fish/kurodai" },
    ],
  },
  {
    id: "seasonal-016",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "「木枯らしカレイ」とはいつ頃釣れるカレイ？",
    choices: [
      "春風が吹く3月頃",
      "台風後の9月頃",
      "木枯らしが吹く11月頃",
      "真夏の8月頃",
    ],
    correctIndex: 2,
    explanation:
      "「木枯らしカレイ」は11月頃、北風（木枯らし）が吹き始める晩秋に産卵のため浅場に接岸するカレイのことです。",
    relatedLinks: [
      { label: "11月の釣りガイド", href: "/seasonal/november" },
      { label: "カレイの詳細", href: "/fish/karei" },
    ],
  },
  {
    id: "seasonal-017",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "アユの友釣り解禁は一般的にいつ頃？",
    choices: [
      "3月1日",
      "5月1日",
      "6月1日前後",
      "8月1日",
    ],
    correctIndex: 2,
    explanation:
      "アユの友釣り解禁は多くの河川で6月1日前後です。解禁日には多くの釣り人が河川に集まります。",
    relatedLinks: [
      { label: "6月の釣りガイド", href: "/seasonal/june" },
      { label: "アユの詳細", href: "/fish/ayu" },
    ],
  },
  {
    id: "seasonal-018",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "ヒラメ釣りの好期として知られる季節は？",
    choices: [
      "春〜初夏と秋〜初冬",
      "真夏のみ",
      "冬のみ",
      "梅雨時のみ",
    ],
    correctIndex: 0,
    explanation:
      "ヒラメは春〜初夏と秋〜初冬の年2回好期があります。特に秋は「秋ヒラメ」として脂がのり人気です。",
    relatedLinks: [{ label: "ヒラメの詳細", href: "/fish/hirame" }],
  },
  {
    id: "seasonal-019",
    category: "seasonal-fish",
    difficulty: "advanced",
    question: "「寒グレ」の釣りが最も盛り上がる時期と地域は？",
    choices: [
      "夏の北海道",
      "秋の東京湾",
      "冬の紀伊半島や四国の磯",
      "春の九州",
    ],
    correctIndex: 2,
    explanation:
      "メジナ（グレ）は冬の低水温期に磯際に寄り、紀伊半島や四国の磯では「寒グレ」シーズンとして人気を集めます。",
    relatedLinks: [
      { label: "1月の釣りガイド", href: "/seasonal/january" },
      { label: "メジナの詳細", href: "/fish/mejina" },
    ],
  },
  {
    id: "seasonal-020",
    category: "seasonal-fish",
    difficulty: "advanced",
    question: "ワカサギの氷上釣りが楽しめる時期は？",
    choices: [
      "10〜11月",
      "12〜3月",
      "4〜5月",
      "通年",
    ],
    correctIndex: 1,
    explanation:
      "ワカサギの氷上釣りは湖が結氷する12月下旬〜3月頃に楽しめます。諏訪湖や網走湖などが有名です。",
    relatedLinks: [
      { label: "1月の釣りガイド", href: "/seasonal/january" },
      { label: "ワカサギの詳細", href: "/fish/wakasagi" },
    ],
  },
  {
    id: "seasonal-021",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "春のエギングで狙うアオリイカの特徴は？",
    choices: [
      "小型だが数が多い",
      "大型の親イカが産卵で接岸する",
      "中型で味が良い",
      "春はアオリイカは釣れない",
    ],
    correctIndex: 1,
    explanation:
      "春のエギングでは産卵のため浅場に接岸する大型の親イカが狙えます。2〜3kgの大物が釣れることもあります。",
    relatedLinks: [
      { label: "4月の釣りガイド", href: "/seasonal/april" },
      { label: "アオリイカの詳細", href: "/fish/aoriika" },
    ],
  },
  {
    id: "seasonal-022",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "真冬（1〜2月）に岸から釣りやすい魚はどれ？",
    choices: [
      "シイラ",
      "キス",
      "メバル",
      "アジ（豆アジ）",
    ],
    correctIndex: 2,
    explanation:
      "メバルは低水温に強く、冬でも岸壁や漁港で活発に餌を食べます。冬の夜釣りの代表的なターゲットです。",
    relatedLinks: [
      { label: "2月の釣りガイド", href: "/seasonal/february" },
      { label: "メバルの詳細", href: "/fish/mebaru" },
    ],
  },
  {
    id: "seasonal-023",
    category: "seasonal-fish",
    difficulty: "advanced",
    question: "「彼岸フグ」とはいつ頃のフグを指す？",
    choices: [
      "春の彼岸（3月）のショウサイフグ",
      "秋の彼岸（9月）のトラフグ",
      "お盆のクサフグ",
      "正月のマフグ",
    ],
    correctIndex: 0,
    explanation:
      "「彼岸フグ」は春の彼岸（3月中旬〜下旬）頃に東京湾で盛期を迎えるショウサイフグのことを指します。",
    relatedLinks: [
      { label: "3月の釣りガイド", href: "/seasonal/march" },
      { label: "フグの詳細", href: "/fish/fugu" },
    ],
  },
  {
    id: "seasonal-024",
    category: "seasonal-fish",
    difficulty: "advanced",
    question: "カマスが「秋刀魚」のように脂がのる時期は？",
    choices: [
      "春（3〜5月）",
      "初夏（6〜7月）",
      "秋（9〜11月）",
      "冬（12〜2月）",
    ],
    correctIndex: 2,
    explanation:
      "カマスは秋（9〜11月）に脂がのって最も美味しくなります。特に「本カマス（アカカマス）」の秋の味は絶品です。",
    relatedLinks: [{ label: "カマスの詳細", href: "/fish/kamasu" }],
  },
  {
    id: "seasonal-025",
    category: "seasonal-fish",
    difficulty: "advanced",
    question: "スルメイカが日本海側で最もよく釣れる時期は？",
    choices: [
      "春（3〜5月）",
      "夏（6〜8月）",
      "秋（9〜11月）",
      "冬（12〜2月）",
    ],
    correctIndex: 1,
    explanation:
      "スルメイカは夏（6〜8月）に対馬暖流に乗って日本海側を北上し、この時期が岸からの釣りのベストシーズンです。",
    relatedLinks: [{ label: "スルメイカの詳細", href: "/fish/surumeika" }],
  },
  {
    id: "seasonal-026",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "秋のサビキ釣りで期待できるアジの特徴は？",
    choices: [
      "豆アジ（5cm以下）のみ",
      "夏より型が良く脂ものっている",
      "秋はアジが釣れない",
      "回遊せず居着きのみ",
    ],
    correctIndex: 1,
    explanation:
      "秋のアジは夏を通じて成長し型が良くなり、越冬に備えて脂ものっています。味も最も良い時期です。",
    relatedLinks: [
      { label: "10月の釣りガイド", href: "/seasonal/october" },
      { label: "アジの詳細", href: "/fish/aji" },
    ],
  },
  {
    id: "seasonal-027",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "イシダイの磯釣りシーズンとして最も適切なのは？",
    choices: [
      "冬（12〜2月）",
      "春〜初夏（4〜7月）",
      "真夏（8月）",
      "晩秋（11月）",
    ],
    correctIndex: 1,
    explanation:
      "イシダイは春〜初夏に磯に寄ってきて活発にエサを食べます。産卵前の4〜7月がベストシーズンです。",
    relatedLinks: [{ label: "イシダイの詳細", href: "/fish/ishidai" }],
  },
  {
    id: "seasonal-028",
    category: "seasonal-fish",
    difficulty: "advanced",
    question: "「落ちハゼ」とはどのような状態のハゼ？",
    choices: [
      "春に孵化したばかりの稚魚",
      "晩秋〜冬に深場へ移動する大型個体",
      "夏の高水温で弱ったハゼ",
      "産卵直後の痩せたハゼ",
    ],
    correctIndex: 1,
    explanation:
      "「落ちハゼ」は晩秋〜冬（11〜12月）に産卵のため深場へ移動する大型のハゼで、天ぷらのネタとして最高とされます。",
    relatedLinks: [
      { label: "11月の釣りガイド", href: "/seasonal/november" },
      { label: "ハゼの詳細", href: "/fish/haze" },
    ],
  },
  {
    id: "seasonal-029",
    category: "seasonal-fish",
    difficulty: "beginner",
    question: "8月の堤防釣りで注意すべきことは？",
    choices: [
      "魚が全く釣れなくなる",
      "熱中症対策と水分補給",
      "台風が来るので釣りは禁止",
      "虫が多くて餌が使えない",
    ],
    correctIndex: 1,
    explanation:
      "8月は魚の活性は高いですが、猛暑のため熱中症のリスクがあります。帽子・日焼け止め・十分な水分が必須です。",
    relatedLinks: [{ label: "8月の釣りガイド", href: "/seasonal/august" }],
  },
  {
    id: "seasonal-030",
    category: "seasonal-fish",
    difficulty: "intermediate",
    question: "「梅雨イサキ」の釣り方として一般的なのは？",
    choices: [
      "サビキ釣り",
      "投げ釣り",
      "コマセ釣り（船）や磯からのフカセ",
      "ルアーのキャスティング",
    ],
    correctIndex: 2,
    explanation:
      "梅雨時期のイサキは船からのコマセ釣りや磯からのフカセ釣りで狙います。産卵前で脂がのった絶品の味です。",
    relatedLinks: [
      { label: "6月の釣りガイド", href: "/seasonal/june" },
      { label: "イサキの詳細", href: "/fish/isaki" },
    ],
  },

  // ========================================
  // fishing-methods (釣り方マスタークイズ) 30問
  // ========================================
  {
    id: "methods-001",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "サビキ釣りで使う「コマセ」とは何のこと？",
    choices: [
      "疑似餌の一種",
      "魚を集めるための撒き餌",
      "釣り針のサイズ",
      "釣り竿のタイプ",
    ],
    correctIndex: 1,
    explanation:
      "コマセは魚を集めるために撒く餌のことで、サビキ釣りではアミエビをカゴに入れて使います。",
    relatedLinks: [{ label: "サビキ釣りガイド", href: "/guide/sabiki" }],
  },
  {
    id: "methods-002",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "ちょい投げ釣りの飛距離の目安は？",
    choices: [
      "5m以内",
      "10〜30m程度",
      "80〜100m",
      "150m以上",
    ],
    correctIndex: 1,
    explanation:
      "ちょい投げ釣りは軽いオモリで10〜30m程度投げる手軽な釣りです。キスやハゼなどが主なターゲットです。",
    relatedLinks: [{ label: "投げ釣りガイド", href: "/guide/choinage" }],
  },
  {
    id: "methods-003",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "エギングで使う「エギ」とはどんな道具？",
    choices: [
      "生きたエビの餌",
      "エビの形をした疑似餌（ルアー）",
      "イカを入れる網",
      "竿先に付けるセンサー",
    ],
    correctIndex: 1,
    explanation:
      "エギはエビに似せた疑似餌で、しゃくり（ジャーク）を入れてイカを誘います。日本発祥の釣法です。",
    relatedLinks: [{ label: "エギングガイド", href: "/guide/eging" }],
  },
  {
    id: "methods-004",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "ウキ釣りでウキが沈む合図は何を意味する？",
    choices: [
      "風が強くなった",
      "潮が変わった",
      "魚がエサを食べている（アタリ）",
      "エサが外れた",
    ],
    correctIndex: 2,
    explanation:
      "ウキ釣りではウキが水中に引き込まれる動きが魚のアタリ（食い付き）のサインです。",
    relatedLinks: [{ label: "ウキ釣りガイド", href: "/guide/float-fishing" }],
  },
  {
    id: "methods-005",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "穴釣りで主に狙える魚は？",
    choices: [
      "アジ・サバ",
      "カサゴ・ソイなどの根魚",
      "マダイ・ヒラメ",
      "イワシ・コノシロ",
    ],
    correctIndex: 1,
    explanation:
      "穴釣りはテトラポッドや岩の隙間にブラクリ仕掛けを落として根魚を狙う釣り方です。カサゴやソイが定番です。",
    relatedLinks: [{ label: "穴釣りガイド", href: "/guide/anazuri" }],
  },
  {
    id: "methods-006",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "ルアー釣りの「キャスト」とは何をすること？",
    choices: [
      "魚を取り込むこと",
      "ルアーを投げること",
      "糸を巻くこと",
      "竿を組み立てること",
    ],
    correctIndex: 1,
    explanation:
      "キャストはルアーや仕掛けを狙ったポイントに投げ入れる動作のことです。英語のcast（投げる）が語源です。",
    relatedLinks: [{ label: "ルアー釣りガイド", href: "/guide/lure" }],
  },
  {
    id: "methods-007",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "サビキ釣りの仕掛けについている疑似餌は何に似せている？",
    choices: [
      "ミミズ",
      "虫",
      "小エビ（アミエビ）",
      "小魚",
    ],
    correctIndex: 2,
    explanation:
      "サビキの疑似餌は小さなエビ（アミエビ）に似せて作られており、スキンやビーズで装飾されています。",
    relatedLinks: [{ label: "サビキ釣りガイド", href: "/guide/sabiki" }],
  },
  {
    id: "methods-008",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "投げ釣りで最もよく使われるエサは？",
    choices: [
      "練り餌",
      "青イソメ・ジャリメなどの虫エサ",
      "ルアー",
      "コマセ（アミエビ）",
    ],
    correctIndex: 1,
    explanation:
      "投げ釣りでは青イソメやジャリメといった多毛類（ゴカイの仲間）が最もポピュラーなエサです。",
    relatedLinks: [{ label: "投げ釣りガイド", href: "/guide/choinage" }],
  },
  {
    id: "methods-009",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "「フカセ釣り」の特徴として正しいのは？",
    choices: [
      "オモリを使わず自然にエサを漂わせる",
      "遠投して底を引く",
      "疑似餌で魚を誘う",
      "氷上で穴を開けて釣る",
    ],
    correctIndex: 0,
    explanation:
      "フカセ釣りはオモリをほとんど使わず、潮の流れに乗せてエサを自然に漂わせる釣法です。グレやチヌ釣りの基本です。",
    relatedLinks: [{ label: "ウキ釣りガイド", href: "/guide/float-fishing" }],
  },
  {
    id: "methods-010",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "アジングとは何をする釣り？",
    choices: [
      "大型のアジを泳がせて釣る",
      "極小のルアー（ジグヘッド）でアジを狙う",
      "サビキでアジを大量に釣る",
      "アジの干物を作る技術",
    ],
    correctIndex: 1,
    explanation:
      "アジングは1〜3g程度の小さなジグヘッドにワームを付けてアジを狙うルアーフィッシングです。繊細なアタリを楽しめます。",
    relatedLinks: [{ label: "ルアー釣りガイド", href: "/guide/lure" }],
  },
  {
    id: "methods-011",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "メバリングで重要な「レンジ」とは何のこと？",
    choices: [
      "竿の長さ",
      "糸の太さ",
      "ルアーを通す水深（層）",
      "投げる距離",
    ],
    correctIndex: 2,
    explanation:
      "レンジはルアーが泳ぐ水深のことで、表層・中層・底層を使い分けることがメバリングの釣果を左右します。",
    relatedLinks: [{ label: "ルアー釣りガイド", href: "/guide/lure" }],
  },
  {
    id: "methods-012",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "ジギングで使う「メタルジグ」の特徴は？",
    choices: [
      "ゴム製で柔らかい",
      "金属製で重く沈みが速い",
      "木製で水に浮く",
      "プラスチック製で透明",
    ],
    correctIndex: 1,
    explanation:
      "メタルジグは鉛や鉄などの金属で作られた疑似餌で、重いため深い水深まで素早く沈めることができます。",
    relatedLinks: [{ label: "ジギングガイド", href: "/guide/jigging" }],
  },
  {
    id: "methods-013",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "エギングの基本アクション「しゃくり」とは？",
    choices: [
      "ゆっくりリールを巻くこと",
      "竿を上に鋭く煽ってエギを跳ね上げること",
      "エギを海底に沈めたまま待つこと",
      "横方向に竿を振ること",
    ],
    correctIndex: 1,
    explanation:
      "しゃくりは竿を上方向に鋭く煽る動作で、エギが海中で跳ね上がり、その後のフォール（沈下）でイカが抱きつきます。",
    relatedLinks: [{ label: "エギングガイド", href: "/guide/eging" }],
  },
  {
    id: "methods-014",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "泳がせ釣り（のませ釣り）の餌として使うのは？",
    choices: [
      "虫エサ（イソメ）",
      "生きた小魚（アジなど）",
      "人工のワーム",
      "コマセ",
    ],
    correctIndex: 1,
    explanation:
      "泳がせ釣りは生きたアジなどの小魚を針に付けて泳がせ、ヒラメやブリなどの大型魚を狙う釣法です。",
    relatedLinks: [{ label: "泳がせ釣りガイド", href: "/guide/oyogase" }],
  },
  {
    id: "methods-015",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "「ボトムバンピング」とはどんなテクニック？",
    choices: [
      "水面でルアーを跳ねさせる",
      "ルアーを海底で跳ねさせて根魚を誘う",
      "船を揺らして魚を寄せる",
      "竿を叩いてアタリを取る",
    ],
    correctIndex: 1,
    explanation:
      "ボトムバンピングはルアーやジグヘッドを海底でピョンピョンと跳ねさせ、カサゴなどの根魚を誘うテクニックです。",
    relatedLinks: [{ label: "ルアー釣りガイド", href: "/guide/lure" }],
  },
  {
    id: "methods-016",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "「落とし込み釣り」はどのようなフィールドで行う？",
    choices: [
      "砂浜から遠投する",
      "堤防の壁際（ヘチ）に仕掛けを落とす",
      "沖のブイに仕掛けを結ぶ",
      "河川の瀬を流す",
    ],
    correctIndex: 1,
    explanation:
      "落とし込み釣りは堤防の壁際（ヘチ）にカニやイガイなどの餌を落とし、クロダイなどを狙う繊細な釣法です。",
    relatedLinks: [{ label: "ウキ釣りガイド", href: "/guide/float-fishing" }],
  },
  {
    id: "methods-017",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "釣りで「合わせ」とはどのような動作？",
    choices: [
      "二人で同時に竿を出す",
      "魚のアタリに対して竿を上げて針を掛ける",
      "仕掛けの長さを調整する",
      "エサの種類を変える",
    ],
    correctIndex: 1,
    explanation:
      "「合わせ」は魚がエサを食べた時に竿を上げて針を魚の口に掛ける動作です。タイミングが重要です。",
    relatedLinks: [{ label: "釣り方ガイド一覧", href: "/guide/sabiki" }],
  },
  {
    id: "methods-018",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "釣りの「タモ」とは何に使う道具？",
    choices: [
      "エサを入れる容器",
      "釣った魚をすくい上げるネット",
      "釣り竿の先端部品",
      "日よけの傘",
    ],
    correctIndex: 1,
    explanation:
      "タモ（タモ網・玉網）は釣り上げた魚を安全にすくい上げるためのネットで、大物釣りの必須アイテムです。",
    relatedLinks: [{ label: "釣り方ガイド一覧", href: "/guide/sabiki" }],
  },
  {
    id: "methods-019",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "ワインド釣法で狙う主なターゲットは？",
    choices: [
      "カレイ",
      "タチウオ",
      "キス",
      "ハゼ",
    ],
    correctIndex: 1,
    explanation:
      "ワインド釣法はダート（左右に跳ねる）アクションのジグヘッド+ワームでタチウオを狙う釣法として人気です。",
    relatedLinks: [{ label: "ルアー釣りガイド", href: "/guide/lure" }],
  },
  {
    id: "methods-020",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "「遠投カゴ釣り」のカゴの役割は？",
    choices: [
      "釣った魚を入れる",
      "コマセ（撒き餌）を遠くに届ける",
      "仕掛けを浮かせる",
      "針を守る",
    ],
    correctIndex: 1,
    explanation:
      "遠投カゴ釣りではカゴにコマセを詰めて遠投し、沖のポイントに撒き餌と付け餌を同時に届けます。",
    relatedLinks: [{ label: "遠投カゴ釣りガイド", href: "/guide/entou-kago" }],
  },
  {
    id: "methods-021",
    category: "fishing-methods",
    difficulty: "advanced",
    question: "「テンヤ釣り」のテンヤとは？",
    choices: [
      "専用のウキの名称",
      "オモリと針が一体になった仕掛け",
      "竿の種類",
      "船の係留方法",
    ],
    correctIndex: 1,
    explanation:
      "テンヤはオモリと大きな針が一体になった仕掛けで、エビなどの餌を付けてマダイや根魚を狙います。",
    relatedLinks: [{ label: "釣り方ガイド一覧", href: "/guide/sabiki" }],
  },
  {
    id: "methods-022",
    category: "fishing-methods",
    difficulty: "advanced",
    question: "フライフィッシングで使う「毛鉤」を虫に見せるテクニックは？",
    choices: [
      "ジャーク",
      "メンディング（ラインを操作して自然に流す）",
      "リフト&フォール",
      "高速リトリーブ",
    ],
    correctIndex: 1,
    explanation:
      "メンディングはフライライン（糸）を水面上で打ち直し、毛鉤を自然の虫のように流すフライフィッシングの基本テクニックです。",
    relatedLinks: [{ label: "釣り方ガイド一覧", href: "/guide/sabiki" }],
  },
  {
    id: "methods-023",
    category: "fishing-methods",
    difficulty: "advanced",
    question: "「タイラバ」とはどのような釣り？",
    choices: [
      "マダイを素手で捕まえる",
      "ヘッド（オモリ）+スカート+ネクタイの擬似餌を巻いてマダイを狙う",
      "タイの稚魚を放流する",
      "タイを活け締めにする技法",
    ],
    correctIndex: 1,
    explanation:
      "タイラバはヘッド（オモリ）にスカートとネクタイ状のパーツを組み合わせた擬似餌で、等速巻きでマダイを狙う釣法です。",
    relatedLinks: [{ label: "釣り方ガイド一覧", href: "/guide/sabiki" }],
  },
  {
    id: "methods-024",
    category: "fishing-methods",
    difficulty: "advanced",
    question: "ショアジギングで「ナブラ」が発生したら何を意味する？",
    choices: [
      "風が強くなったこと",
      "小魚が大型魚に追われて水面がざわつくこと",
      "潮が満ちてきたこと",
      "釣り場が混雑していること",
    ],
    correctIndex: 1,
    explanation:
      "ナブラは青物などの大型魚が小魚を追い回して水面がバシャバシャとざわつく現象で、ルアーを投げる大チャンスです。",
    relatedLinks: [{ label: "ルアー釣りガイド", href: "/guide/lure" }],
  },
  {
    id: "methods-025",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "ブラクリ仕掛けとはどんな形状？",
    choices: [
      "ウキと針がセットになった仕掛け",
      "赤いオモリと針が一体の穴釣り専用仕掛け",
      "コマセカゴ付きの仕掛け",
      "天秤に針を付けた仕掛け",
    ],
    correctIndex: 1,
    explanation:
      "ブラクリは赤い丸型オモリに針が直結した穴釣り専用の仕掛けで、テトラの隙間に落としてカサゴなどを狙います。",
    relatedLinks: [{ label: "穴釣りガイド", href: "/guide/anazuri" }],
  },
  {
    id: "methods-026",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "「ティップラン」とはどんなエギングスタイル？",
    choices: [
      "岸からの遠投エギング",
      "船から行い竿先（ティップ）のアタリでイカを掛ける",
      "ウキを付けたエギング",
      "夜の漁火に集まるイカを狙う",
    ],
    correctIndex: 1,
    explanation:
      "ティップランは船からエギを落とし、竿先（ティップ）に出るイカの繊細なアタリで掛けるボートエギングの一種です。",
    relatedLinks: [{ label: "エギングガイド", href: "/guide/eging" }],
  },
  {
    id: "methods-027",
    category: "fishing-methods",
    difficulty: "advanced",
    question: "「インチク」とはどのような疑似餌？",
    choices: [
      "金属のヘッドにタコベイト（ビニール足）を付けた和製ルアー",
      "虫に似せた毛鉤",
      "小魚型のプラスチックルアー",
      "ゴム製のエビ型ワーム",
    ],
    correctIndex: 0,
    explanation:
      "インチクは鉛やタングステンのヘッドにタコベイト状のスカートを付けた日本発祥の疑似餌で、根魚や青物に効果的です。",
    relatedLinks: [{ label: "ジギングガイド", href: "/guide/jigging" }],
  },
  {
    id: "methods-028",
    category: "fishing-methods",
    difficulty: "beginner",
    question: "リールの「ドラグ」とはどんな機能？",
    choices: [
      "糸を自動で巻き取る機能",
      "一定以上の力が掛かると糸が出ていく制動装置",
      "竿を固定する機能",
      "糸のよれを取る機能",
    ],
    correctIndex: 1,
    explanation:
      "ドラグは魚の引きが強い時に糸が切れないよう、一定の力で糸が出ていく安全装置です。適切な設定が重要です。",
    relatedLinks: [{ label: "釣り方ガイド一覧", href: "/guide/sabiki" }],
  },
  {
    id: "methods-029",
    category: "fishing-methods",
    difficulty: "intermediate",
    question: "「根掛かり」とはどのような状態？",
    choices: [
      "魚が根（岩）に潜り込むこと",
      "仕掛けやルアーが海底の岩や海藻に引っかかること",
      "根魚が針に掛かること",
      "竿の根元が折れること",
    ],
    correctIndex: 1,
    explanation:
      "根掛かりは仕掛けやルアーが海底の岩・海藻・障害物に引っかかって動かなくなる状態です。ラインブレイクの原因になります。",
    relatedLinks: [{ label: "ルアー釣りガイド", href: "/guide/lure" }],
  },
  {
    id: "methods-030",
    category: "fishing-methods",
    difficulty: "advanced",
    question: "「スロージギング」の特徴は？",
    choices: [
      "素早くジグをしゃくり上げる",
      "ゆっくりとジグをフォールさせて食わせの間を作る",
      "ジグを海面で泳がせる",
      "ジグをキャストして横に引く",
    ],
    correctIndex: 1,
    explanation:
      "スロージギングはジグをゆっくりフォールさせ、長い食わせの間を作ることで根魚や青物など幅広い魚を狙う釣法です。",
    relatedLinks: [{ label: "ジギングガイド", href: "/guide/jigging" }],
  },

  // ========================================
  // spot-detective (スポット探偵クイズ) 30問
  // ========================================
  {
    id: "spot-001",
    category: "spot-detective",
    difficulty: "beginner",
    question: "明石海峡大橋のたもとにある釣り公園がある都道府県は？",
    choices: [
      "大阪府",
      "兵庫県",
      "徳島県",
      "香川県",
    ],
    correctIndex: 1,
    explanation:
      "明石海峡大橋は兵庫県明石市と淡路島を結ぶ橋で、周辺には複数の釣り公園があり潮流の速さで有名です。",
    relatedLinks: [{ label: "兵庫県の釣り場", href: "/prefecture/hyogo" }],
  },
  {
    id: "spot-002",
    category: "spot-detective",
    difficulty: "beginner",
    question: "「堤防釣り」と「磯釣り」の最大の違いは？",
    choices: [
      "使う竿の長さ",
      "足場の安全性と環境",
      "釣れる魚の種類が全く異なる",
      "釣りの時間帯",
    ],
    correctIndex: 1,
    explanation:
      "堤防は平坦で安全な足場がありますが、磯は岩場で足場が悪く滑りやすいため装備と経験が必要です。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-003",
    category: "spot-detective",
    difficulty: "beginner",
    question: "釣り公園の利点として当てはまらないものは？",
    choices: [
      "安全柵があり初心者でも安心",
      "トイレや売店が併設されている",
      "入場料が無料である",
      "スタッフが常駐していることが多い",
    ],
    correctIndex: 2,
    explanation:
      "釣り公園は安全設備やスタッフが整っていますが、多くの場合入場料や利用料が必要です。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-004",
    category: "spot-detective",
    difficulty: "beginner",
    question: "東京湾で船釣りが盛んな魚種として有名なのは？",
    choices: [
      "マダイ・アジ・シロギス",
      "サケ・マス",
      "アユ",
      "イトウ",
    ],
    correctIndex: 0,
    explanation:
      "東京湾は都心から近く、マダイ・アジ・シロギスなどの船釣りが盛んです。年間を通して多くの釣り船が出ています。",
    relatedLinks: [{ label: "東京都の釣り場", href: "/prefecture/tokyo" }],
  },
  {
    id: "spot-005",
    category: "spot-detective",
    difficulty: "beginner",
    question: "河口域（汽水域）の特徴として正しいのは？",
    choices: [
      "淡水のみの環境",
      "海水と淡水が混ざる環境",
      "深海に近い環境",
      "水温が一定の環境",
    ],
    correctIndex: 1,
    explanation:
      "河口域は海水と淡水が混ざる汽水域で、クロダイ・スズキ・ハゼなど両方の環境に適応した魚が集まります。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-006",
    category: "spot-detective",
    difficulty: "beginner",
    question: "サーフ（砂浜）からの釣りで主に狙えるのは？",
    choices: [
      "根魚（カサゴ・メバル）",
      "ヒラメ・マゴチ・キス",
      "イカ・タコ",
      "渓流魚（ヤマメ・イワナ）",
    ],
    correctIndex: 1,
    explanation:
      "砂浜（サーフ）からはヒラメ・マゴチ・キスなど砂底を好む魚が主なターゲットです。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-007",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "明石海峡が釣りの好ポイントである最大の理由は？",
    choices: [
      "水深が浅いから",
      "潮流が速くプランクトンが豊富だから",
      "波が穏やかだから",
      "水温が高いから",
    ],
    correctIndex: 1,
    explanation:
      "明石海峡は潮流が速く、それにより豊富な栄養素とプランクトンが運ばれるため、魚影が濃い好漁場です。",
    relatedLinks: [{ label: "兵庫県の釣り場", href: "/prefecture/hyogo" }],
  },
  {
    id: "spot-008",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "「潮通しが良い」とはどういう意味？",
    choices: [
      "干潮時に歩いて渡れること",
      "潮の流れがよく通り、新鮮な海水が循環すること",
      "潮干狩りができること",
      "潮位の差が少ないこと",
    ],
    correctIndex: 1,
    explanation:
      "潮通しが良い場所は常に新鮮な海水が流れ、酸素やプランクトンが豊富で魚が集まりやすいポイントです。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-009",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "堤防の先端部が釣りの好ポイントとされる理由は？",
    choices: [
      "風が当たらないから",
      "水深があり潮の流れが変化するから",
      "他の釣り人が少ないから",
      "日当たりが良いから",
    ],
    correctIndex: 1,
    explanation:
      "堤防の先端は水深があり、潮の流れがぶつかって変化するため魚が集まりやすいポイントです。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-010",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "若狭湾がある地方はどこ？",
    choices: [
      "東北地方",
      "関東地方",
      "近畿・北陸地方",
      "九州地方",
    ],
    correctIndex: 2,
    explanation:
      "若狭湾は福井県と京都府にまたがる日本海側の湾で、イカやアジ、マダイなど豊富な魚種が釣れる好漁場です。",
    relatedLinks: [{ label: "福井県の釣り場", href: "/prefecture/fukui" }],
  },
  {
    id: "spot-011",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "「テトラポッド」周りが釣れるポイントとされる理由は？",
    choices: [
      "テトラが魚のエサを放出するから",
      "隙間が魚の隠れ家になり、流れの変化も生まれるから",
      "テトラの上は足場が良いから",
      "テトラ周辺は水温が高いから",
    ],
    correctIndex: 1,
    explanation:
      "テトラの隙間は根魚の住み家になり、波の変化で餌も集まるため好ポイントです。ただし足場が悪いので注意が必要です。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-012",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "北海道で「鮭釣り」が有名な時期と方法は？",
    choices: [
      "春にフライフィッシング",
      "夏にジギング",
      "秋にウキルアーやぶっこみ釣り",
      "冬にサビキ釣り",
    ],
    correctIndex: 2,
    explanation:
      "北海道では秋（9〜11月）に河川に遡上するサケをウキルアーやぶっこみ釣りで狙うのが風物詩です。",
    relatedLinks: [{ label: "北海道の釣り場", href: "/prefecture/hokkaido" }],
  },
  {
    id: "spot-013",
    category: "spot-detective",
    difficulty: "beginner",
    question: "漁港での釣りで注意すべきことは？",
    choices: [
      "漁港は全て釣り禁止",
      "漁業者の作業を妨げない",
      "漁港では魚が釣れない",
      "漁港は夜間のみ利用可能",
    ],
    correctIndex: 1,
    explanation:
      "漁港は漁業者の仕事場です。船の出入りや作業の邪魔にならないよう配慮し、立入禁止区域には入らないようにしましょう。",
    relatedLinks: [{ label: "釣りのルール", href: "/fishing-rules" }],
  },
  {
    id: "spot-014",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "「沖堤防」へ行くには通常どうする？",
    choices: [
      "歩いて渡る",
      "泳いで渡る",
      "渡船を利用する",
      "ヘリコプターで行く",
    ],
    correctIndex: 2,
    explanation:
      "沖堤防は岸から離れた沖にある堤防で、渡船業者の船で渡ります。人が少なく釣果が期待できるポイントです。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-015",
    category: "spot-detective",
    difficulty: "advanced",
    question: "三陸海岸のリアス式海岸が釣りに適している理由は？",
    choices: [
      "砂浜が多いから",
      "入り組んだ地形で潮流の変化が多く魚が集まるから",
      "水深が浅いから",
      "波が全くないから",
    ],
    correctIndex: 1,
    explanation:
      "リアス式海岸は入り組んだ地形により複雑な潮流が生まれ、プランクトンや小魚が集まりやすく好漁場となります。",
    relatedLinks: [{ label: "岩手県の釣り場", href: "/prefecture/iwate" }],
  },
  {
    id: "spot-016",
    category: "spot-detective",
    difficulty: "beginner",
    question: "「管理釣り場」の特徴として正しいのは？",
    choices: [
      "天然の河川そのまま",
      "魚が放流されており初心者でも釣りやすい",
      "入場料が無料",
      "大型魚しかいない",
    ],
    correctIndex: 1,
    explanation:
      "管理釣り場はニジマスなどの魚が定期的に放流されており、初心者でも手軽に釣りが楽しめる施設です。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-017",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "玄界灘に面している県として正しい組み合わせは？",
    choices: [
      "大阪府・兵庫県",
      "福岡県・佐賀県",
      "広島県・山口県",
      "鹿児島県・宮崎県",
    ],
    correctIndex: 1,
    explanation:
      "玄界灘は福岡県と佐賀県の北に広がる海域で、ヒラマサやブリなどの青物釣りの名所として知られています。",
    relatedLinks: [{ label: "福岡県の釣り場", href: "/prefecture/fukuoka" }],
  },
  {
    id: "spot-018",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "相模湾が面している都道府県は？",
    choices: [
      "千葉県",
      "神奈川県",
      "静岡県",
      "茨城県",
    ],
    correctIndex: 1,
    explanation:
      "相模湾は神奈川県の南に広がる湾で、黒潮の影響を受けてカツオやマグロなどの回遊魚も回ってきます。",
    relatedLinks: [{ label: "神奈川県の釣り場", href: "/prefecture/kanagawa" }],
  },
  {
    id: "spot-019",
    category: "spot-detective",
    difficulty: "beginner",
    question: "釣り場選びで「駐車場・トイレ完備」が重要な理由は？",
    choices: [
      "釣果に直結するから",
      "快適に長時間釣りが楽しめるから",
      "法律で義務付けられているから",
      "魚が多く集まるから",
    ],
    correctIndex: 1,
    explanation:
      "駐車場やトイレが整備された釣り場は快適に長時間釣りを楽しめ、特に家族連れや初心者には重要なポイントです。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-020",
    category: "spot-detective",
    difficulty: "advanced",
    question: "駿河湾の最大の特徴は？",
    choices: [
      "日本で最も浅い湾",
      "日本で最も深い湾（水深約2,500m）",
      "淡水の湾",
      "珊瑚礁に囲まれた湾",
    ],
    correctIndex: 1,
    explanation:
      "駿河湾は最深部が約2,500mと日本一深い湾で、深海魚から回遊魚まで多様な魚種が生息しています。",
    relatedLinks: [{ label: "静岡県の釣り場", href: "/prefecture/shizuoka" }],
  },
  {
    id: "spot-021",
    category: "spot-detective",
    difficulty: "advanced",
    question: "瀬戸内海の特徴として正しいのは？",
    choices: [
      "外洋に面しており波が高い",
      "多数の島と狭い海峡で複雑な潮流が生まれる",
      "水深が非常に深い",
      "冬は全面凍結する",
    ],
    correctIndex: 1,
    explanation:
      "瀬戸内海は700以上の島があり、狭い海峡での速い潮流が栄養豊富な漁場を形成しています。",
    relatedLinks: [{ label: "広島県の釣り場", href: "/prefecture/hiroshima" }],
  },
  {
    id: "spot-022",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "「一文字堤防」とはどんな堤防？",
    choices: [
      "長さが一文字（約3cm）の堤防",
      "港の沖合いに直線状に設置された防波堤",
      "一人しか釣りできない堤防",
      "一日で作られた堤防",
    ],
    correctIndex: 1,
    explanation:
      "一文字堤防は港の沖合いに漢字の「一」のように直線状に設置された防波堤で、渡船で渡って釣りをします。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-023",
    category: "spot-detective",
    difficulty: "beginner",
    question: "波止場と堤防の違いは？",
    choices: [
      "波止場は海、堤防は川にある",
      "基本的に同じものを指すことが多い",
      "波止場は大型船専用",
      "堤防は必ずコンクリート製",
    ],
    correctIndex: 1,
    explanation:
      "「波止場」と「堤防」は地域によって呼び方が異なりますが、基本的に同じような護岸構造物を指すことが多いです。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-024",
    category: "spot-detective",
    difficulty: "advanced",
    question: "小豆島がある海域は？",
    choices: [
      "日本海",
      "太平洋",
      "瀬戸内海",
      "東シナ海",
    ],
    correctIndex: 2,
    explanation:
      "小豆島は瀬戸内海に浮かぶ香川県の島で、周辺は潮流が複雑でタイやアオリイカの好漁場として知られています。",
    relatedLinks: [{ label: "香川県の釣り場", href: "/prefecture/kagawa" }],
  },
  {
    id: "spot-025",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "「地磯」と「沖磯」の違いは？",
    choices: [
      "地磯は陸続きで歩いて行ける、沖磯は渡船が必要",
      "地磯は人工、沖磯は天然",
      "地磯は夏限定、沖磯は冬限定",
      "違いはない",
    ],
    correctIndex: 0,
    explanation:
      "地磯は陸続きで歩いて行ける磯場、沖磯は沖合いにあり渡船でしかアクセスできない磯場です。沖磯の方が魚影が濃い傾向があります。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-026",
    category: "spot-detective",
    difficulty: "advanced",
    question: "隠岐諸島が釣り人に人気の理由は？",
    choices: [
      "東京から近いから",
      "対馬暖流の影響でヒラマサなどの大物が狙えるから",
      "管理釣り場が多いから",
      "砂浜が多いから",
    ],
    correctIndex: 1,
    explanation:
      "島根県の隠岐諸島は対馬暖流の影響を受け、ヒラマサ・ブリ・マダイなどの大物が狙える離島釣りの聖地です。",
    relatedLinks: [{ label: "島根県の釣り場", href: "/prefecture/shimane" }],
  },
  {
    id: "spot-027",
    category: "spot-detective",
    difficulty: "beginner",
    question: "釣り場の「常夜灯」周りが夜釣りの好ポイントとされる理由は？",
    choices: [
      "手元が明るくて便利だから",
      "光に集まるプランクトンを追って小魚が集まるから",
      "温かいから",
      "風が弱いから",
    ],
    correctIndex: 1,
    explanation:
      "常夜灯の光にプランクトンが集まり、それを食べる小魚、さらにそれを狙う大型魚と食物連鎖が生まれます。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-028",
    category: "spot-detective",
    difficulty: "intermediate",
    question: "釣り場で「カケアガリ」とは何のこと？",
    choices: [
      "堤防に上がる階段",
      "海底が急に浅くなる（深くなる）傾斜部分",
      "波が駆け上がること",
      "魚が水面に飛び上がること",
    ],
    correctIndex: 1,
    explanation:
      "カケアガリは海底の傾斜がきつくなっている場所で、魚が集まりやすくエサも溜まりやすい好ポイントです。",
    relatedLinks: [{ label: "釣り場を探す", href: "/spots" }],
  },
  {
    id: "spot-029",
    category: "spot-detective",
    difficulty: "advanced",
    question: "五島列島が磯釣りの聖地と呼ばれる県は？",
    choices: [
      "福岡県",
      "佐賀県",
      "長崎県",
      "鹿児島県",
    ],
    correctIndex: 2,
    explanation:
      "五島列島は長崎県に属し、クロ（メジナ）やイシダイ、ヒラマサなどの磯釣りの聖地として全国から釣り人が訪れます。",
    relatedLinks: [{ label: "長崎県の釣り場", href: "/prefecture/nagasaki" }],
  },
  {
    id: "spot-030",
    category: "spot-detective",
    difficulty: "advanced",
    question: "「黒潮」の影響を最も強く受ける海域はどれ？",
    choices: [
      "日本海北部",
      "瀬戸内海",
      "太平洋側（紀伊半島〜四国〜九州東岸）",
      "オホーツク海",
    ],
    correctIndex: 2,
    explanation:
      "黒潮は太平洋側を北上する暖流で、紀伊半島・四国・九州東岸に最も影響を与え、カツオやマグロなどの回遊魚をもたらします。",
    relatedLinks: [{ label: "高知県の釣り場", href: "/prefecture/kochi" }],
  },
];
