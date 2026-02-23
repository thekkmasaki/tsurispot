// 魚の別名（aliases）と人気度（popularity）データ
// popularity: 1が最も人気、数値が大きいほどマイナー
// aliases: 漢字名・成長名・地方名（方言）・通称

interface FishMeta {
  aliases?: string[];
  popularity: number;
}

export const fishMetadata: Record<string, FishMeta> = {
  // === 海水魚 ===
  // アジ: 関西ではゼンゴ、九州ではアジゴ（幼魚）
  aji:            { aliases: ["マアジ", "鯵", "ゼンゴ", "アジゴ", "ジンタ"], popularity: 1 },
  // サバ: 関西ではサバゴ（幼魚）
  saba:           { aliases: ["マサバ", "ゴマサバ", "鯖", "ホンサバ", "サバゴ"], popularity: 2 },
  // イワシ: 各地でヒシコ、シコイワシ（カタクチ）
  iwashi:         { aliases: ["マイワシ", "カタクチイワシ", "鰯", "ヒシコ", "シコイワシ", "ウルメイワシ"], popularity: 3 },
  // メバル: 北海道でガヤ、瀬戸内でメバチ
  mebaru:         { aliases: ["眼張", "春告魚", "クロメバル", "アカメバル", "シロメバル", "ガヤ", "メバチ"], popularity: 4 },
  // カサゴ: 関西でガシラ、九州でアラカブ、東海でカサ
  kasago:         { aliases: ["ガシラ", "アラカブ", "笠子", "カサ", "ボッカ", "ホゴ"], popularity: 5 },
  // シーバス: 出世魚。関東セイゴ→フッコ→スズキ、関西ハネ→スズキ
  seabass:        { aliases: ["スズキ", "鱸", "セイゴ", "フッコ", "ハネ", "マダカ"], popularity: 6 },
  // タチウオ: 九州でタチ、大阪ではタチウオバリ
  tachiuo:        { aliases: ["タチ", "太刀魚", "タツ", "サーベルフィッシュ"], popularity: 7 },
  // マダイ: 各地でタイ、幼魚はカスゴ
  madai:          { aliases: ["真鯛", "タイ", "カスゴ", "チャリコ", "ハナダイ"], popularity: 8 },
  // キス: 正式にはシロギス、関西でキスゴ
  kisu:           { aliases: ["シロギス", "鱚", "キスゴ", "ピンギス"], popularity: 9 },
  // カレイ: 種類が多く地方名も多い
  karei:          { aliases: ["マコガレイ", "イシガレイ", "鰈", "マコ", "クロガシラ"], popularity: 10 },
  // アオリイカ: 九州でミズイカ、四国でモイカ、山陰でバショウイカ
  aoriika:        { aliases: ["ミズイカ", "モイカ", "障泥烏賊", "バショウイカ", "クツイカ", "シロイカ"], popularity: 11 },
  // ヒラメ: 幼魚はソゲ
  hirame:         { aliases: ["平目", "鮃", "ソゲ", "テックイ"], popularity: 12 },
  // ブリ: 代表的出世魚。関東ワカシ→イナダ→ワラサ→ブリ、関西ツバス→ハマチ→メジロ→ブリ
  buri:           { aliases: ["ハマチ", "ワラサ", "ツバス", "メジロ", "鰤", "ワカシ", "イナダ", "ガンド", "フクラギ"], popularity: 13 },
  // サワラ: 幼魚はサゴシ、サゴチ
  sawara:         { aliases: ["サゴシ", "サゴチ", "鰆", "サワラゴ", "ナギ"], popularity: 14 },
  // イナダ: ブリの若魚、関東名。関西ではハマチ・ツバス
  inada:          { aliases: ["ワカシ", "ワカナゴ", "ツバス", "フクラギ", "ハマチ"], popularity: 15 },
  // カワハギ: 九州でハゲ、中国地方でバクチウオ
  kawahagi:       { aliases: ["皮剥", "ハゲ", "マルハギ", "バクチウオ", "カワハゲ"], popularity: 16 },
  // サヨリ: 九州でスズ、北陸でヨド
  sayori:         { aliases: ["鱵", "細魚", "スズ", "ヨド", "ハリウオ", "サイレン"], popularity: 17 },
  // カマス: 関西でカマスゴ（幼魚）
  kamasu:         { aliases: ["アカカマス", "ヤマトカマス", "魳", "ホンカマス", "ミズカマス"], popularity: 18 },
  // メジナ: 関西でグレ、九州でクロ、東海でブダイ
  mejina:         { aliases: ["グレ", "クロ", "目仁奈", "クシロ", "クチブト", "オナガ"], popularity: 19 },
  // イシダイ: 幼魚はサンバソウ、シマダイ
  ishidai:        { aliases: ["石鯛", "シマダイ", "サンバソウ", "クチグロ", "ワサ"], popularity: 20 },
  // イサキ: 九州でイサギ、関西でイサギ
  isaki:          { aliases: ["伊佐木", "イサギ", "ウリボウ", "イセギ"], popularity: 21 },
  // マゴチ: 関西でコチ、九州でヨシノゴチ
  magochi:        { aliases: ["コチ", "鯒", "ヨシノゴチ", "ゼニゴチ"], popularity: 22 },
  // アイナメ: 北海道でアブラコ、東北でネウ、瀬戸内でアブラメ
  ainame:         { aliases: ["アブラコ", "鮎並", "ネウ", "アブラメ", "シジュウ", "ポン"], popularity: 23 },
  // カンパチ: 幼魚はショゴ・ネリゴ、九州でアカバラ
  kanpachi:       { aliases: ["ショゴ", "ネリゴ", "間八", "アカバラ", "シオ"], popularity: 24 },
  // ヒラマサ: 九州でヒラス、平政
  hiramasa:       { aliases: ["ヒラス", "平政", "ヒラサ", "マサ"], popularity: 25 },
  // マダコ: 各地でタコ
  madako:         { aliases: ["タコ", "蛸", "地ダコ"], popularity: 26 },
  // ヤリイカ: 山陰でササイカ、北陸でテナシイカ
  yariika:        { aliases: ["ササイカ", "槍烏賊", "テナシイカ", "テッポウ"], popularity: 27 },
  // スルメイカ: 北海道でマイカ
  surumeika:      { aliases: ["マイカ", "スルメ", "鯣烏賊", "ムギイカ"], popularity: 28 },
  // コウイカ: 関東でスミイカ、関西でハリイカ
  kouika:         { aliases: ["スミイカ", "甲烏賊", "ハリイカ", "マイカ"], popularity: 29 },
  // アナゴ: 各地でハモ（穴子をハモと呼ぶ地域がある）
  anago:          { aliases: ["マアナゴ", "穴子", "ハカリメ", "メジロ"], popularity: 30 },
  // キジハタ: 関西でアコウ、瀬戸内でアコ
  hata:           { aliases: ["アコウ", "キジハタ", "雉羽太", "アコ", "アズキマス"], popularity: 31 },
  // アカハタ: 沖縄でミーバイ
  akahata:        { aliases: ["赤羽太", "アカバ", "ミーバイ"], popularity: 32 },
  // シマアジ: 高級魚、コセ（幼魚）
  shimaaji:       { aliases: ["縞鯵", "コセ", "コセアジ"], popularity: 33 },
  // ソウダガツオ: ヒラソウダ、マルソウダの総称
  soudagatuo:     { aliases: ["ヒラソウダ", "マルソウダ", "宗太鰹", "メジカ", "ウズワ"], popularity: 34 },
  // カツオ: 若魚はメジ
  katsuo:         { aliases: ["鰹", "ホンガツオ", "メジ", "スジガツオ"], popularity: 35 },
  // クロソイ: 北海道でソイ
  kurosoi:        { aliases: ["ソイ", "黒曹以", "ナガラゾイ"], popularity: 36 },
  // ホウボウ: 九州でキミ、山陰でドコ
  houbou:         { aliases: ["魴鮄", "キミ", "ドコ", "カナガシラ"], popularity: 37 },
  // イシモチ: 関西でグチ、シログチ
  ishimochi:      { aliases: ["シログチ", "グチ", "石持", "ニベ", "コイチ"], popularity: 38 },
  // シイラ: ハワイでマヒマヒ、九州でマンビキ
  shiira:         { aliases: ["マヒマヒ", "マンビキ", "マンサク", "ペンペン"], popularity: 39 },
  // ホッケ: 北海道の定番
  hokke:          { aliases: ["𩸽", "アオボッケ", "ロウソクボッケ"], popularity: 40 },
  // イイダコ: 各地でイイダコ
  iidako:         { aliases: ["飯蛸", "コダコ"], popularity: 41 },
  // ハタハタ: 秋田の県魚
  hatahata:       { aliases: ["鰰", "カミナリウオ", "シロハタ"], popularity: 42 },
  // ワタリガニ: 正式名はガザミ
  watarigani:     { aliases: ["ガザミ", "渡蟹", "タイワンガザミ"], popularity: 43 },
  // コショウダイ: 九州でコロダイ
  koshoudai:      { aliases: ["胡椒鯛", "コロダイ"], popularity: 44 },
  // ベラ: 関西でキュウセン、九州でギザミ
  bera:           { aliases: ["キュウセン", "倍良", "ギザミ", "ササノハベラ"], popularity: 45 },
  // ウミタナゴ: 関東でタナゴ
  umitanago:      { aliases: ["海鱮", "アカタナゴ"], popularity: 46 },
  // エソ: 各地でエソ
  eso:            { aliases: ["マエソ", "鱛", "ワニエソ"], popularity: 47 },
  // ウツボ: 高知でタツクチ
  utsubo:         { aliases: ["靫", "タツクチ", "ナマダ"], popularity: 48 },
  // キンメダイ: 略してキンメ
  kinmedai:       { aliases: ["キンメ", "金目鯛"], popularity: 49 },
  // アカムツ: 日本海側でノドグロ
  akamutsu:       { aliases: ["ノドグロ", "赤鯥"], popularity: 50 },
  // マダラ: 略してタラ、北海道でポンタラ（小型）
  madara:         { aliases: ["タラ", "真鱈", "ポンタラ", "ホンダラ"], popularity: 51 },
  // クエ: 九州でアラ、四国でモロコ
  kue:            { aliases: ["アラ", "モロコ", "九絵", "マス"], popularity: 52 },
  // ムツ: 黒ムツ、本ムツ
  mutsu:          { aliases: ["鯥", "クロムツ", "ホンムツ", "ロクノウオ"], popularity: 53 },
  // マハタ: 九州でカナ、クエに似る
  mahata:         { aliases: ["真羽太", "カナ", "タカバ"], popularity: 54 },
  // オオモンハタ
  oomonhata:      { aliases: ["大紋羽太", "アカバ"], popularity: 55 },
  // コブダイ: 関西でカンダイ
  kobudai:        { aliases: ["カンダイ", "瘤鯛", "モブシ", "コブ"], popularity: 56 },
  // イシガキダイ: 若魚はクチジロ
  ishigakidai:    { aliases: ["石垣鯛", "クチジロ", "クチシロ"], popularity: 57 },
  // アマダイ: 京都でグジ
  amadai:         { aliases: ["甘鯛", "グジ", "コビル", "クズナ"], popularity: 58 },
  // ヒラスズキ
  hirasuzuki:     { aliases: ["平鱸", "ヒラ", "タイリクスズキ"], popularity: 59 },
  // ロウニンアジ: GTの略称で有名
  "rounin-aji":   { aliases: ["GT", "浪人鯵", "ジャイアントトレバリー", "ガーラ"], popularity: 60 },
  // オニカサゴ
  onikasago:      { aliases: ["鬼笠子", "オニ", "イズカサゴ"], popularity: 61 },
  // タマン: 沖縄名、本名はハマフエフキ
  taman:          { aliases: ["ハマフエフキ", "タマミ", "クチビ"], popularity: 62 },
  // オオニベ
  oonibe:         { aliases: ["大鮸", "ニベ"], popularity: 63 },
  // イトヨリダイ: 略してイトヨリ
  itoyoridai:     { aliases: ["イトヨリ", "糸撚鯛", "イトヒキ"], popularity: 64 },
  // スジアラ: 沖縄でアカジン
  sujiara:        { aliases: ["筋荒", "アカジン", "アカジンミーバイ"], popularity: 65 },
  // メダイ
  medai:          { aliases: ["目鯛", "ダルマ", "セイジ"], popularity: 66 },
  // 毒魚
  // フグ: 各地でフク（下関）、テッポウ（大阪）、ガンバ（北九州）
  fugu:           { aliases: ["河豚", "トラフグ", "フク", "テッポウ", "ガンバ", "ショウサイフグ"], popularity: 67 },
  gonzui:         { aliases: ["権瑞", "ギギ", "ググ"], popularity: 68 },
  // アイゴ: 関西でバリ、四国でアイ
  aigo:           { aliases: ["バリ", "藍子", "アイ", "ヤノウオ"], popularity: 69 },
  haokoze:        { aliases: ["葉鰧", "ハチオコゼ"], popularity: 70 },
  oniokoze:       { aliases: ["鬼鰧", "オコゼ", "ヤマノカミ"], popularity: 71 },
  akaei:          { aliases: ["赤鱝", "エイ", "アカエ"], popularity: 72 },
  dochizame:      { aliases: ["奴智鮫", "サメ"], popularity: 73 },
  nekozame:       { aliases: ["猫鮫", "サザエワリ"], popularity: 74 },
  hoshizame:      { aliases: ["星鮫", "ホシ"], popularity: 75 },

  // === 汽水魚 ===
  // クロダイ: 関西・九州でチヌ、幼魚はカイズ、メイタ
  kurodai:        { aliases: ["チヌ", "黒鯛", "カイズ", "メイタ", "チンタ", "ケイズ"], popularity: 1 },
  // ハゼ: 正式名マハゼ、幼魚はデキハゼ
  haze:           { aliases: ["マハゼ", "鯊", "沙魚", "デキハゼ", "カワハゼ", "ゴロハゼ"], popularity: 2 },
  // コノシロ: 出世魚。シンコ→コハダ→ナカズミ→コノシロ
  konoshiro:      { aliases: ["コハダ", "シンコ", "鰶", "ナカズミ", "ツナシ"], popularity: 3 },
  // サクラマス: 降海型ヤマメ
  sakuramasu:     { aliases: ["ホンマス", "桜鱒", "マス", "ママス"], popularity: 4 },

  // === 淡水魚 ===
  // ブラックバス: 正式名オオクチバス
  blackbass:      { aliases: ["ラージマウスバス", "オオクチバス", "バス", "黒鱒", "ラージ"], popularity: 1 },
  // アユ: 香魚、年魚とも
  ayu:            { aliases: ["鮎", "香魚", "年魚", "アイ", "コアユ"], popularity: 2 },
  // ウナギ: 蒲焼きで有名な高級魚
  unagi:          { aliases: ["鰻", "ニホンウナギ", "ウナギ", "オオウナギ"], popularity: 3 },
  // ニジマス: 英名レインボートラウト
  nijimasu:       { aliases: ["レインボートラウト", "虹鱒", "ニジ", "トラウト"], popularity: 4 },
  // ヤマメ: 降海型はサクラマス、九州でエノハ
  yamame:         { aliases: ["山女魚", "エノハ", "ヒラメ", "コサメ"], popularity: 5 },
  // イワナ: 地方によりキリクチ、ゴギ、ニッコウイワナ
  iwana:          { aliases: ["岩魚", "ニッコウイワナ", "エゾイワナ", "ゴギ", "キリクチ"], popularity: 6 },
  // ワカサギ: 公魚、氷上穴釣りで有名
  wakasagi:       { aliases: ["公魚", "アマサギ", "シラウオ"], popularity: 7 },
  // コイ: マゴイ、野鯉
  koi:            { aliases: ["鯉", "マゴイ", "ノゴイ", "ドイツゴイ"], popularity: 8 },
  // ヘラブナ: 略してヘラ
  herabuna:       { aliases: ["ヘラ", "ゲンゴロウブナ", "箆鮒", "カワチブナ"], popularity: 9 },
  // ナマズ: 各地でナマズ
  namazu:         { aliases: ["鯰", "マナマズ"], popularity: 10 },
  // テナガエビ
  tenagaebi:      { aliases: ["手長海老", "テナガ", "カワエビ"], popularity: 11 },
  // アマゴ: 降海型はサツキマス、四国でアメゴ
  amago:          { aliases: ["甘子", "アメゴ", "アメノウオ", "サツキマス"], popularity: 12 },
  // ブルーギル: 略してギル
  bluegill:       { aliases: ["ギル", "ブルーギル"], popularity: 13 },
  // オイカワ: 関西でハエ、東北でヤマベ
  oikawa:         { aliases: ["ハエ", "ヤマベ", "追河", "シラハエ", "ハヤ"], popularity: 14 },
  // ライギョ: 正式名カムルチー
  raigyo:         { aliases: ["雷魚", "カムルチー", "スネークヘッド", "タイワンドジョウ"], popularity: 15 },
  // ブラウントラウト
  "brown-trout":  { aliases: ["ブラウン", "ブラウントラウト", "茶鱒"], popularity: 16 },
  // イトウ: 日本最大の淡水魚
  itou:           { aliases: ["伊富", "伊当", "オビラメ"], popularity: 17 },
  // ビワマス: 琵琶湖固有種
  biwamasu:       { aliases: ["琵琶鱒", "アメノイオ", "アメノウオ"], popularity: 18 },
  // ヒメマス: ベニザケの陸封型
  himemasu:       { aliases: ["姫鱒", "チップ", "ベニザケ陸封型"], popularity: 19 },
  // ウグイ: 関東でハヤ、北海道でアカハラ
  ugui:           { aliases: ["ハヤ", "石斑魚", "アカハラ", "クキ", "アイソ"], popularity: 20 },
  // カワムツ
  kawamutsu:      { aliases: ["川鯥", "ハエ", "ムツ"], popularity: 21 },
  // マブナ: 各地でフナ
  mabuna:         { aliases: ["真鮒", "ギンブナ", "フナ"], popularity: 22 },
  // ハス: 琵琶湖固有種
  hasu:           { aliases: ["鰣", "ケタバス", "オイカワの仲間"], popularity: 23 },
  // ドジョウ
  dojou:          { aliases: ["泥鰌", "鰌", "マドジョウ"], popularity: 24 },
  // タナゴ: 小型美魚
  tanago:         { aliases: ["鱮", "タイリクバラタナゴ", "ニッポンバラタナゴ"], popularity: 25 },
  // ビワコオオナマズ: 琵琶湖固有種
  "biwako-oonamazu": { aliases: ["琵琶湖大鯰", "オオナマズ"], popularity: 26 },
};
