#!/usr/bin/env node
/**
 * X (Twitter) 魚の豆知識 自動投稿スクリプト
 *
 * 使い方:
 *   node scripts/twitter/post-fish-tips.mjs           # ランダムな豆知識を投稿
 *   node scripts/twitter/post-fish-tips.mjs --dry-run  # 投稿せずに内容を確認
 */

import { TwitterApi } from "twitter-api-v2";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");

// .env.local を手動パース
function loadEnv() {
  try {
    const envPath = join(ROOT, ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex);
      let value = trimmed.slice(eqIndex + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // GitHub Actions では環境変数で渡す
  }
}

loadEnv();

// ── 魚の豆知識データ（30種以上） ──

const fishTips = [
  {
    name: "アジ",
    slug: "aji",
    emoji: "\uD83D\uDC1F",
    tip: "アジの名前の由来は「味が良い」から。漢字で「鯵」と書くのは、旧暦3月（参月）が旬だったことに由来するという説があります。",
    difficulty: "beginner",
    peakMonths: [6, 7, 8],
    cookingTip: "なめろう（味噌と薬味で叩いた千葉の郷土料理）",
  },
  {
    name: "サバ",
    slug: "saba",
    emoji: "\uD83D\uDC1F",
    tip: "「サバを読む」の語源は、サバは傷みやすく市場で急いで数えたため数がいい加減になったこと。鮮度が命の魚なんです。",
    difficulty: "beginner",
    peakMonths: [7, 8, 9],
    cookingTip: "しめ鯖（酢でしめると保存性も味もUP）",
  },
  {
    name: "カサゴ",
    slug: "kasago",
    emoji: "\uD83D\uDC20",
    tip: "カサゴは卵胎生の魚で、お腹の中で卵を孵化させてから稚魚を産みます。魚なのにお母さんのお腹から生まれてくるんです。",
    difficulty: "beginner",
    peakMonths: [1, 2, 12],
    cookingTip: "丸ごと唐揚げ（骨までカリカリに）",
  },
  {
    name: "メバル",
    slug: "mebaru",
    emoji: "\uD83D\uDC1F",
    tip: "メバルは「春告魚（はるつげうお）」の別名を持ちます。春になると浅場に現れることから、春の訪れを告げる魚として親しまれてきました。",
    difficulty: "intermediate",
    peakMonths: [2, 3],
    cookingTip: "煮付け（上品な白身が煮汁を吸って絶品）",
  },
  {
    name: "イワシ",
    slug: "iwashi",
    emoji: "\uD83D\uDC1F",
    tip: "漢字で「鰯」と書くのは、水から出すとすぐ弱る（よわし）から。節分の魔除けに使われるのは、焼いた煙の臭いが鬼を追い払うと信じられたためです。",
    difficulty: "beginner",
    peakMonths: [6, 7, 8],
    cookingTip: "手開きで作るオイルサーディン",
  },
  {
    name: "シーバス",
    slug: "seabass",
    emoji: "\uD83D\uDC1F",
    tip: "スズキは成長と共に名前が変わる出世魚。セイゴ→フッコ→スズキの順に大きくなります。80cmを超える大型はランカーと呼ばれ、ルアーマンの憧れです。",
    difficulty: "intermediate",
    peakMonths: [4, 5, 9, 10],
    cookingTip: "ムニエル（皮をパリッと焼くのがコツ）",
  },
  {
    name: "タチウオ",
    slug: "tachiuo",
    emoji: "\u2728",
    tip: "タチウオの体の銀色はグアニンという物質。実はウロコが退化して消失しており、代わりにグアニン層で全身が覆われています。かつてはこの銀粉が模造真珠の原料に使われていました。",
    difficulty: "intermediate",
    peakMonths: [8, 9, 10, 11],
    cookingTip: "塩焼き（脂がのった秋のタチウオは格別）",
  },
  {
    name: "マダイ",
    slug: "madai",
    emoji: "\uD83C\uDF89",
    tip: "「めでたい」の語呂合わせで有名な真鯛ですが、実際に天然真鯛は40年以上生きることもある長寿の魚。体長1mを超える大物も存在します。",
    difficulty: "advanced",
    peakMonths: [3, 4, 5, 10, 11],
    cookingTip: "鯛めし（焼いてから炊き込むのが香ばしい）",
  },
  {
    name: "キス",
    slug: "kisu",
    emoji: "\uD83C\uDFD6\uFE0F",
    tip: "キスは「海の女王」とも呼ばれる美しい魚。砂浜のサーフからちょい投げで手軽に狙え、天ぷらにすると最高。実は夜行性で、夜釣りでも釣れます。",
    difficulty: "beginner",
    peakMonths: [6, 7, 8, 9],
    cookingTip: "天ぷら（揚げたての白身は至高の一品）",
  },
  {
    name: "カレイ",
    slug: "karei",
    emoji: "\uD83D\uDC1F",
    tip: "「左ヒラメに右カレイ」は有名な見分け方。お腹を下にしたとき目が右にあるのがカレイです。ただしヌマガレイという例外もいて、左に目がある個体も。",
    difficulty: "beginner",
    peakMonths: [11, 12, 1, 2],
    cookingTip: "煮付け（冬の子持ちカレイは格別）",
  },
  {
    name: "アオリイカ",
    slug: "aoriika",
    emoji: "\uD83E\uDD91",
    tip: "アオリイカは「イカの王様」と呼ばれ、刺身の甘みは全イカ中トップクラス。エギングで狙えますが、実は視力が非常に良く色覚もあるため、エギのカラー選びが重要です。",
    difficulty: "intermediate",
    peakMonths: [4, 5, 6, 9, 10, 11],
    cookingTip: "刺身（甘みとねっとり食感が最高）",
  },
  {
    name: "カワハギ",
    slug: "kawahagi",
    emoji: "\uD83D\uDC1F",
    tip: "カワハギは「エサ取り名人」の異名を持ち、釣り人の仕掛けからエサだけ器用に取っていきます。その口は小さくて硬く、まるでペンチのよう。",
    difficulty: "intermediate",
    peakMonths: [9, 10, 11, 12],
    cookingTip: "肝醤油で食べる刺身（冬の肝パンは絶品）",
  },
  {
    name: "サヨリ",
    slug: "sayori",
    emoji: "\uD83D\uDC1F",
    tip: "サヨリは見た目がとても美しい銀色の魚ですが、お腹の中の腹膜は真っ黒。このギャップから「腹黒い人」の例えに使われることがあります。",
    difficulty: "beginner",
    peakMonths: [10, 11, 12],
    cookingTip: "天ぷら（細長い身をふわっと揚げて）",
  },
  {
    name: "ヒラメ",
    slug: "hirame",
    emoji: "\uD83D\uDC1F",
    tip: "ヒラメは高級魚の代表格。特に縁側（ヒレの付け根の身）は歯ごたえ抜群で寿司ネタの最高峰。ヒラメは砂に擬態する達人で、海底にいるとほぼ見えません。",
    difficulty: "advanced",
    peakMonths: [10, 11, 12, 1, 2],
    cookingTip: "えんがわの刺身（コリコリ食感が最高）",
  },
  {
    name: "イナダ",
    slug: "inada",
    emoji: "\uD83D\uDC1F",
    tip: "イナダはブリの若魚（関東の呼び名）。ワカシ→イナダ→ワラサ→ブリと名前が変わる出世魚の途中段階。関西ではツバス→ハマチ→メジロ→ブリと呼ばれます。",
    difficulty: "intermediate",
    peakMonths: [8, 9, 10, 11],
    cookingTip: "漬け丼（醤油とみりんで漬けて丼に）",
  },
  {
    name: "カマス",
    slug: "kamasu",
    emoji: "\uD83D\uDC1F",
    tip: "カマスは見た目に似合わず非常に歯が鋭い魚。ワイヤーリーダーなしだとラインを切られることも。干物にすると旨みが凝縮して最高のおつまみになります。",
    difficulty: "beginner",
    peakMonths: [8, 9, 10],
    cookingTip: "一夜干し（干すことで旨みが凝縮）",
  },
  {
    name: "マダコ",
    slug: "madako",
    emoji: "\uD83D\uDC19",
    tip: "タコの脳は9つ（中央に1つ+各足に1つずつ）。足は切断されても独立して動きます。知能が高く、瓶のフタを開けたり迷路を解いたりする実験結果も。",
    difficulty: "beginner",
    peakMonths: [6, 7, 8],
    cookingTip: "たこ焼き（釣りたてのタコで作ると格別）",
  },
  {
    name: "ヤリイカ",
    slug: "yariika",
    emoji: "\uD83E\uDD91",
    tip: "ヤリイカは名前の通り槍のように細長い体型。冬の夜釣りで狙うのが定番で、集魚灯に集まる習性を利用します。寿命はわずか1年ほどの短命な生き物です。",
    difficulty: "intermediate",
    peakMonths: [1, 2, 3],
    cookingTip: "イカそうめん（新鮮なうちに細く切って）",
  },
  {
    name: "アイナメ",
    slug: "ainame",
    emoji: "\uD83D\uDC1F",
    tip: "アイナメは根魚なのにウロコが細かく滑らかで、触るとヌメヌメしています。「鮎並」の名は味が鮎に似ているからという説と、体の粘液が多いからという説があります。",
    difficulty: "intermediate",
    peakMonths: [11, 12, 1],
    cookingTip: "煮付け（脂の乗った冬の味覚）",
  },
  {
    name: "ブリ",
    slug: "buri",
    emoji: "\uD83D\uDC1F",
    tip: "ブリの漢字「鰤」は魚偏に師。師走（12月）が旬だからこの漢字になったと言われています。天然の寒ブリは脂の乗りが別格で、冬の日本海側では「ブリ起こし」と呼ばれる雷が鳴ると豊漁の合図です。",
    difficulty: "advanced",
    peakMonths: [10, 11, 12],
    cookingTip: "ブリしゃぶ（薄切りをさっとくぐらせて）",
  },
  {
    name: "アナゴ",
    slug: "anago",
    emoji: "\uD83D\uDC1F",
    tip: "アナゴとウナギは見た目が似ていますが全くの別種。アナゴは海水魚、ウナギは淡水〜汽水域。カロリーはウナギの約半分でヘルシー。東京湾の江戸前アナゴは天ぷらの最高級ネタです。",
    difficulty: "beginner",
    peakMonths: [6, 7, 8],
    cookingTip: "天ぷら（ふわっとした身が衣と相性抜群）",
  },
  {
    name: "マゴチ",
    slug: "magochi",
    emoji: "\uD83D\uDC1F",
    tip: "マゴチは「照りゴチ」と呼ばれ、真夏の照り付ける日差しの下で最も活性が上がります。夏が旬の高級魚で、フグにも匹敵する上品な白身が特徴。",
    difficulty: "intermediate",
    peakMonths: [6, 7, 8],
    cookingTip: "薄造り（ポン酢で食べると夏にぴったり）",
  },
  {
    name: "カンパチ",
    slug: "kanpachi",
    emoji: "\uD83D\uDC1F",
    tip: "カンパチの名前の由来は、頭を上から見ると漢字の「八」の字に見える暗色の帯模様があるから。「間八」と書きます。ブリより引きが強く、釣り味は青物の中でもトップクラス。",
    difficulty: "advanced",
    peakMonths: [7, 8, 9],
    cookingTip: "刺身（ブリより脂が上品でさっぱり）",
  },
  {
    name: "イシダイ",
    slug: "ishidai",
    emoji: "\uD83D\uDC1F",
    tip: "イシダイは「磯の王者」と呼ばれ、磯釣り師にとって憧れの的。顎の力が非常に強く、ウニやカニの殻をバリバリ噛み砕いて食べます。老成魚はクチジロと呼ばれます。",
    difficulty: "advanced",
    peakMonths: [5, 6, 9, 10],
    cookingTip: "刺身（磯魚とは思えない上品な味わい）",
  },
  {
    name: "メジナ",
    slug: "mejina",
    emoji: "\uD83D\uDC1F",
    tip: "メジナは関西では「グレ」と呼ばれ、磯のフカセ釣りの大人気ターゲット。夏は磯臭いと言われますが、冬のメジナは臭みが消えて脂が乗り、別物の美味しさになります。",
    difficulty: "intermediate",
    peakMonths: [12, 1, 2],
    cookingTip: "塩焼き（冬の寒グレは脂がのって最高）",
  },
  {
    name: "イシモチ",
    slug: "ishimochi",
    emoji: "\uD83D\uDC1F",
    tip: "イシモチは名前の通り、頭の中に大きな耳石（じせき）を持っています。この石は「おとひめさまの落とし物」とも呼ばれ、昔はお守りにされていました。",
    difficulty: "beginner",
    peakMonths: [6, 7, 8],
    cookingTip: "塩焼き（シンプルが一番美味しい）",
  },
  {
    name: "キジハタ",
    slug: "hata",
    emoji: "\uD83D\uDC1F",
    tip: "キジハタ（アコウ）は「夏のフグ」と称されるほどの高級魚。実は雌性先熟の性転換魚で、若いうちはメスとして成熟し、大きくなるとオスに変わります。",
    difficulty: "intermediate",
    peakMonths: [6, 7, 8, 9],
    cookingTip: "鍋（あっさりした上品な出汁が絶品）",
  },
  {
    name: "ホウボウ",
    slug: "houbou",
    emoji: "\uD83D\uDC1F",
    tip: "ホウボウは「海の孔雀」とも呼ばれ、胸ビレを広げると鮮やかな青緑色の翼のような姿になります。さらに胸ビレの一部が指のように変化し、海底を歩くように移動できます。",
    difficulty: "intermediate",
    peakMonths: [11, 12, 1, 2],
    cookingTip: "刺身（透明感のある美しい白身）",
  },
  {
    name: "フグ",
    slug: "fugu",
    emoji: "\uD83D\uDC21",
    tip: "フグ毒のテトロドトキシンは青酸カリの約1000倍の毒性。しかしフグは生まれつき毒を持っているわけではなく、食物連鎖を通じて体内に蓄積します。養殖フグは無毒の個体も多いです。",
    difficulty: "beginner",
    peakMonths: [11, 12, 1, 2],
    cookingTip: "てっさ（薄造り）※必ず免許保持者に調理を依頼",
  },
  {
    name: "カツオ",
    slug: "katsuo",
    emoji: "\uD83D\uDC1F",
    tip: "「初鰹」は春、「戻り鰹」は秋の風物詩。初鰹はさっぱり、戻り鰹は脂がのって味わいが全く違います。カツオは泳ぎ続けないと窒息する回遊魚で、寝ている間もゆっくり泳いでいます。",
    difficulty: "advanced",
    peakMonths: [6, 7, 9, 10],
    cookingTip: "たたき（藁焼きの香りが最高）",
  },
  {
    name: "キンメダイ",
    slug: "kinmedai",
    emoji: "\uD83D\uDC1F",
    tip: "キンメダイの大きな金色の目は深海に適応した結果。水深200〜800mに生息し、わずかな光も集められるよう眼が巨大化しました。「金目」の名はこの目の色に由来します。",
    difficulty: "advanced",
    peakMonths: [11, 12, 1, 2],
    cookingTip: "煮付け（脂がのった身と甘辛い煮汁の相性は最強）",
  },
  {
    name: "サワラ",
    slug: "sawara",
    emoji: "\uD83D\uDC1F",
    tip: "サワラは漢字で「鰆」と書き、春を告げる魚。しかし実は脂がのって美味しいのは秋〜冬。「寒鰆」は関西では高級魚として珍重されます。身が柔らかいため「腰の弱い魚」とも。",
    difficulty: "intermediate",
    peakMonths: [3, 4, 10, 11],
    cookingTip: "西京焼き（白味噌に漬けて焼く京都の定番）",
  },
  {
    name: "ホッケ",
    slug: "hokke",
    emoji: "\uD83D\uDC1F",
    tip: "居酒屋の定番メニュー・ホッケの開き干し。実は生のホッケは北海道や東北でしか食べられない贅沢品。鮮度の落ちが極端に早いため、産地以外では干物として流通しています。",
    difficulty: "beginner",
    peakMonths: [4, 5, 11],
    cookingTip: "開き干し（炭火で焼くと最高のおつまみ）",
  },
  {
    name: "アカムツ（ノドグロ）",
    slug: "akamutsu",
    emoji: "\uD83D\uDC1F",
    tip: "テニスの錦織圭選手が「帰国したら食べたい」と言って一躍有名になったノドグロ。口の中（喉）が黒いことからこの名前がつきました。「白身のトロ」と呼ばれるほど脂がのっています。",
    difficulty: "advanced",
    peakMonths: [10, 11, 12],
    cookingTip: "塩焼き（脂が滴り落ちるほどジューシー）",
  },
  {
    name: "イサキ",
    slug: "isaki",
    emoji: "\uD83D\uDC1F",
    tip: "イサキは「梅雨イサキ」と呼ばれ、梅雨時期が最も美味しい魚の一つ。幼魚にはイノシシのウリ坊のような縞模様があり「うり坊」とも呼ばれますが、成長すると縞は消えます。",
    difficulty: "intermediate",
    peakMonths: [6, 7, 8],
    cookingTip: "塩焼き（梅雨時の脂ののりは格別）",
  },
  {
    name: "コウイカ",
    slug: "kouika",
    emoji: "\uD83E\uDD91",
    tip: "コウイカは体内に「甲」と呼ばれる硬い骨を持つことが名前の由来。この甲はカルシウムの塊で、インコなどの鳥のカルシウム補給用に「カトルボーン」として売られています。",
    difficulty: "beginner",
    peakMonths: [4, 5, 10],
    cookingTip: "天ぷら（肉厚な身がプリッと揚がる）",
  },
  {
    name: "ワタリガニ",
    slug: "watarigani",
    emoji: "\uD83E\uDD80",
    tip: "ワタリガニ（ガザミ）は蟹なのに泳げる珍しい種類。一番後ろの脚が平らなオール状になっていて、これを使って海中を自在に泳ぎ回ります。",
    difficulty: "beginner",
    peakMonths: [8, 9, 10],
    cookingTip: "蒸しガニ（内子たっぷりの冬のメスが最高）",
  },
  {
    name: "ウミタナゴ",
    slug: "umitanago",
    emoji: "\uD83D\uDC1F",
    tip: "ウミタナゴは海水魚なのに卵ではなく仔魚を産む胎生魚。お腹の中で稚魚が育ち、5cm程度の仔魚を十数匹まとめて出産します。「海のお母さん」とも呼ばれます。",
    difficulty: "beginner",
    peakMonths: [3, 4, 5],
    cookingTip: "塩焼き（淡白で上品な味わい）",
  },
  {
    name: "ボラ",
    slug: "bora",
    emoji: "\uD83D\uDC1F",
    tip: "ボラの卵巣を塩漬け・天日干しにしたものが高級珍味「からすみ」。日本三大珍味の一つです。ボラ自体はスルーされがちですが、冬の「寒ボラ」は臭みがなく刺身で美味しく食べられます。",
    difficulty: "beginner",
    peakMonths: [10, 11, 12, 1],
    cookingTip: "からすみ（卵巣の塩漬け干し、日本三大珍味）",
  },
  {
    name: "ハタハタ",
    slug: "hatahata",
    emoji: "\uD83D\uDC1F",
    tip: "ハタハタは秋田県の県魚で、秋田名物「しょっつる鍋」の主役。雷が鳴る荒天の日に大群で押し寄せることから、漢字では「鰰（魚偏に神）」や「鑤」と書きます。",
    difficulty: "beginner",
    peakMonths: [11, 12],
    cookingTip: "しょっつる鍋（秋田の郷土料理）",
  },
  {
    name: "シイラ",
    slug: "shiira",
    emoji: "\uD83D\uDC1F",
    tip: "シイラは英語で「Mahi-mahi」「Dolphinfish」とも呼ばれ、ハワイ料理の定番食材。時速60kmで泳ぐ俊足で、ジャンプ力も凄まじく、掛かるとエラ洗いで海面を跳ね回ります。",
    difficulty: "advanced",
    peakMonths: [7, 8, 9],
    cookingTip: "フライ（ハワイ風にタルタルソースで）",
  },
  {
    name: "コブダイ",
    slug: "kobudai",
    emoji: "\uD83D\uDC1F",
    tip: "コブダイの大きな頭のコブは脂肪の塊。メスとして生まれ、群れの中で最も大きな個体がオスに性転換します。オスは巨大なコブが発達し、顎も張り出して迫力満点の顔に。",
    difficulty: "advanced",
    peakMonths: [4, 5, 6, 10, 11],
    cookingTip: "刺身（歯ごたえのある白身）",
  },
  {
    name: "イイダコ",
    slug: "iidako",
    emoji: "\uD83D\uDC19",
    tip: "イイダコは小さなタコで、メスのお腹に米粒のような卵がびっしり詰まっていることから「飯蛸」と書きます。ラッキョウや白い貝殻を疑似餌にする独特な釣法で狙います。",
    difficulty: "beginner",
    peakMonths: [10, 11],
    cookingTip: "煮物（丸ごと柔らかく煮て）",
  },
];

// ── メイン処理 ──

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const POSTED_FILE = join(__dirname, ".posted-fish-tips.json");

function getPostedTips() {
  try {
    return JSON.parse(readFileSync(POSTED_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function formatDifficulty(difficulty) {
  switch (difficulty) {
    case "beginner":
      return "\u2605\u2606\u2606";
    case "intermediate":
      return "\u2605\u2605\u2606";
    case "advanced":
      return "\u2605\u2605\u2605";
    default:
      return "\u2605\u2606\u2606";
  }
}

function formatPeakMonths(months) {
  if (!months || months.length === 0) return "通年";

  const sorted = [...months].sort((a, b) => a - b);

  // 連続する月をグループ化（12→1の跨ぎも考慮）
  // 年を跨ぐケース（例: [11, 12, 1, 2]）を検出
  const hasYearWrap =
    sorted.includes(12) &&
    sorted.includes(1) &&
    sorted[sorted.length - 1] - sorted[0] > sorted.length;

  if (hasYearWrap) {
    // 年跨ぎの場合: 最小の12以上の月から開始
    const winterMonths = sorted.filter((m) => m >= 10);
    const springMonths = sorted.filter((m) => m <= 3);
    if (winterMonths.length > 0 && springMonths.length > 0) {
      return `${winterMonths[0]}\u301C${springMonths[springMonths.length - 1]}月`;
    }
  }

  // 通常ケース
  if (sorted.length === 1) return `${sorted[0]}月`;
  return `${sorted[0]}\u301C${sorted[sorted.length - 1]}月`;
}

function pickTip() {
  const posted = getPostedTips();
  const postedSlugs = new Set(posted.map((p) => p.slug));
  const available = fishTips.filter((t) => !postedSlugs.has(t.slug));

  if (available.length === 0) {
    console.log("全豆知識を投稿済み。リセットして最初から。");
    writeFileSync(POSTED_FILE, "[]");
    return fishTips[Math.floor(Math.random() * fishTips.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

async function main() {
  const tip = pickTip();

  const difficultyStars = formatDifficulty(tip.difficulty);
  const peakMonthsJa = formatPeakMonths(tip.peakMonths);

  const tweetText = [
    `\uD83D\uDCA1 ${tip.name}の豆知識`,
    "",
    tip.tip,
    "",
    `\uD83C\uDFA3 難易度: ${difficultyStars}`,
    `\uD83D\uDCC5 旬: ${peakMonthsJa}`,
    `\uD83C\uDF73 おすすめ料理: ${tip.cookingTip}`,
    "",
    `詳しくは\u2192 https://tsurispot.com/fish/${tip.slug}`,
    `#釣り #${tip.name} #魚図鑑 #ツリスポ`,
  ].join("\n");

  console.log("=== ツイート内容 ===");
  console.log(tweetText);
  console.log(`\n文字数: ${tweetText.length}字`);

  if (dryRun) {
    console.log("\n[dry-run] 投稿はスキップ");
    return;
  }

  const {
    X_API_KEY,
    X_API_KEY_SECRET,
    X_ACCESS_TOKEN,
    X_ACCESS_TOKEN_SECRET,
  } = process.env;
  if (
    !X_API_KEY ||
    !X_API_KEY_SECRET ||
    !X_ACCESS_TOKEN ||
    !X_ACCESS_TOKEN_SECRET
  ) {
    console.error("X API の環境変数が設定されていません");
    console.error(
      "必要: X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET"
    );
    process.exit(1);
  }

  const client = new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_KEY_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
  });

  console.log("\n投稿中...");
  const tweet = await client.v2.tweet(tweetText);
  console.log(
    `投稿完了: https://x.com/tsurispot_jp/status/${tweet.data.id}`
  );

  // 投稿済みに記録
  const posted = getPostedTips();
  posted.push({ slug: tip.slug, name: tip.name, date: new Date().toISOString() });
  writeFileSync(POSTED_FILE, JSON.stringify(posted, null, 2));
}

main().catch((err) => {
  console.error("エラー:", err.message);
  if (err.data) console.error("API詳細:", JSON.stringify(err.data, null, 2));
  process.exit(1);
});
