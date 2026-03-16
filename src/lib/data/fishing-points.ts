import type { SpotDiagramData } from '@/components/spots/fishing-point-diagram';

// スポットslugをキーとした釣りポイント配置図データ
export const fishingPointsData: Record<string, SpotDiagramData> = {
  "hiraiso-fishing-park": {
    layout: 'seawall',
    structureLabel: '護岸（ベランダ）',
    seaLabel: '大阪湾',
    accessibilityNote: 'バリアフリー対応の釣り座あり。車椅子でも利用可能なエリアは管理事務所にお問い合わせください。',

    facilities: [
      { id: 'f-parking', name: '駐車場',       icon: '🅿️', x: 80,  y: 55 },
      { id: 'f-gate',    name: '料金所',       icon: '🎫', x: 210, y: 55 },
      { id: 'f-office',  name: '管理事務所',   icon: '🏢', x: 360, y: 55 },
      { id: 'f-shop',    name: '売店',         icon: '🏪', x: 490, y: 55 },
      { id: 'f-vending', name: '自販機',       icon: '🥤', x: 580, y: 55 },
      { id: 'f-rest',    name: 'レストハウス', icon: '🏠', x: 730, y: 50 },
      { id: 'f-bbq',     name: 'BBQ場',        icon: '🍖', x: 900, y: 55 },
    ],

    // 表示順: 左(西)→右(東) = T14→T1
    positions: [
      {
        id: 'hp-t14', number: 14, name: 'テント14番（西端）', shortName: '西端',
        rating: 'good', x: 50,
        depth: '足元5m / 沖8m',
        description: '西端エリア。潮の変化があり、タチウオの回遊が多い。夕マヅメ〜夜に実績。',
        fish: [
          { name: 'タチウオ', method: 'テンヤ/ワインド', season: '8〜12月', difficulty: 'medium' },
          { name: 'サヨリ', method: 'ウキ釣り', season: '9〜12月', difficulty: 'easy' },
          { name: 'アオリイカ', method: 'エギング', season: '9〜11月', difficulty: 'medium' },
          { name: 'チヌ', method: 'ウキフカセ', season: '4〜11月', difficulty: 'medium' },
          { name: 'スズキ', method: 'ルアー/エビ撒き', season: '通年', difficulty: 'medium' },
          { name: 'グレ', method: 'ウキフカセ', season: '10〜5月', difficulty: 'medium' },
          { name: 'メバル', method: 'メバリング', season: '11〜4月', difficulty: 'medium' },
          { name: 'マルハギ', method: '胴突き', season: '8〜12月', difficulty: 'medium' },
          { name: 'アイナメ', method: '投げ釣り', season: '10〜3月', difficulty: 'medium' },
        ],
        features: ['タチウオ実績', '夕マヅメ狙い', 'テトラ際'],
      },
      {
        id: 'hp-t13', number: 13, name: 'テント13番', shortName: 'T13',
        rating: 'normal', x: 119,
        depth: '足元4〜5m',
        description: '西寄りの釣り座。テトラが近く、根魚が狙える。サビキも安定。',
        fish: [
          { name: 'ガシラ', method: '穴釣り/胴突き', season: '通年', difficulty: 'easy' },
          { name: 'アジ', method: 'サビキ釣り', season: '5〜11月', difficulty: 'easy' },
        ],
        features: ['テトラ際'],
      },
      {
        id: 'hp-t12', number: 12, name: 'テント12番', shortName: 'T12',
        rating: 'normal', x: 188,
        depth: '足元4〜5m',
        description: 'テトラ帯の終端付近。ガシラ・メバルの居付きが良い。',
        fish: [
          { name: 'メバル', method: 'メバリング', season: '11〜4月', difficulty: 'medium' },
          { name: 'ガシラ', method: '穴釣り', season: '通年', difficulty: 'easy' },
        ],
        features: ['テトラ際'],
      },
      {
        id: 'hp-t11', number: 11, name: 'テント11番', shortName: 'T11',
        rating: 'normal', x: 258,
        depth: '足元4m',
        description: '捨石魚礁エリアの西端。アジのサビキ釣りが安定して楽しめる。',
        fish: [
          { name: 'アジ', method: 'サビキ釣り', season: '5〜11月', difficulty: 'easy' },
          { name: 'サバ', method: 'サビキ釣り', season: '6〜10月', difficulty: 'easy' },
        ],
      },
      {
        id: 'hp-t10', number: 10, name: 'テント10番付近', shortName: 'T10',
        rating: 'good', x: 327,
        depth: '足元4〜5m',
        description: '中央付近の安定ポイント。サビキ・投げ釣りどちらも楽しめる万能エリア。初心者におすすめ。',
        fish: [
          { name: 'アジ', method: 'サビキ釣り', season: '5〜11月', difficulty: 'easy' },
          { name: 'キス', method: '投げ釣り', season: '5〜10月', difficulty: 'easy' },
          { name: 'カレイ', method: '投げ釣り', season: '10〜3月', difficulty: 'medium' },
          { name: 'サバ', method: 'サビキ/ジグサビキ', season: '6〜10月', difficulty: 'easy' },
        ],
        features: ['万能エリア', '初心者おすすめ', '捨石魚礁前'],
      },
      {
        id: 'hp-t9', number: 9, name: 'テント9番', shortName: 'T9',
        rating: 'normal', x: 396,
        depth: '足元4m',
        description: '中央エリア。魚礁が前方にあり、アジ・サバの回遊が良い。',
        fish: [
          { name: 'アジ', method: 'サビキ釣り', season: '5〜11月', difficulty: 'easy' },
          { name: 'ベラ', method: '胴突き', season: '通年', difficulty: 'easy' },
        ],
      },
      {
        id: 'hp-t8', number: 8, name: 'テント8番（一級ポイント）', shortName: 'T8',
        rating: 'hot', x: 465,
        depth: '足元4m / 沖6〜8m',
        description: '縁石の左右が一級ポイント。サイズの良いメバル・ガシラが通年。夏はサビキでアジ100匹超えの実績あり。',
        fish: [
          { name: 'アジ', method: 'サビキ釣り', season: '6〜10月', difficulty: 'easy' },
          { name: 'メバル', method: 'メバリング', season: '通年', difficulty: 'medium' },
          { name: 'ガシラ', method: '胴突き', season: '通年', difficulty: 'easy' },
          { name: 'ウミタナゴ', method: 'ウキ釣り', season: '通年', difficulty: 'easy' },
          { name: 'ウマヅラハギ', method: '胴突き', season: '8〜12月', difficulty: 'medium' },
          { name: 'カワハギ', method: '胴突き', season: '8〜12月', difficulty: 'medium' },
          { name: 'アオリイカ', method: 'エギング', season: '9〜11月', difficulty: 'medium' },
          { name: 'スズキ', method: 'ルアー/エビ撒き', season: '通年', difficulty: 'medium' },
          { name: 'チヌ', method: 'ウキフカセ', season: '4〜11月', difficulty: 'medium' },
          { name: 'グレ', method: 'ウキフカセ', season: '10〜5月', difficulty: 'medium' },
        ],
        features: ['アジ100匹超え実績', '縁石の変化', 'ファミリー向け'],
      },
      {
        id: 'hp-t7', number: 7, name: 'テント7番（中央入口付近）', shortName: 'T7',
        rating: 'normal', x: 535,
        depth: '足元4m',
        description: '中央入口のすぐ横。入場後すぐに釣り座を確保できる利便性がある。',
        fish: [
          { name: 'アジ', method: 'サビキ釣り', season: '5〜11月', difficulty: 'easy' },
          { name: 'ガシラ', method: '穴釣り', season: '通年', difficulty: 'easy' },
        ],
        features: ['中央入口すぐ', 'アクセス良好'],
      },
      {
        id: 'hp-t6', number: 6, name: 'テント6番', shortName: 'T6',
        rating: 'normal', x: 604,
        depth: '足元4〜5m',
        description: 'コンクリート魚礁前のエリア。アジ・サバの回遊が安定。',
        fish: [
          { name: 'アジ', method: 'サビキ釣り', season: '5〜11月', difficulty: 'easy' },
          { name: 'メバル', method: 'メバリング', season: '11〜4月', difficulty: 'medium' },
        ],
      },
      {
        id: 'hp-t5', number: 5, name: 'テント5番', shortName: 'T5',
        rating: 'good', x: 673,
        depth: '足元4〜5m / 沖6m',
        description: '六角錐魚礁〜コンクリート魚礁の境目付近。スズキ・グレ・メバルなど多魚種が狙える好ポイント。',
        fish: [
          { name: 'スズキ', method: 'ルアー/エビ撒き', season: '通年', difficulty: 'medium' },
          { name: 'グレ', method: 'ウキフカセ', season: '10〜5月', difficulty: 'medium' },
          { name: 'メバル', method: 'メバリング', season: '11〜4月', difficulty: 'medium' },
          { name: 'ウマヅラハギ', method: '胴突き', season: '8〜12月', difficulty: 'medium' },
          { name: 'マルハギ', method: '胴突き', season: '8〜12月', difficulty: 'medium' },
        ],
        features: ['多魚種', 'コンクリ魚礁前'],
      },
      {
        id: 'hp-t4', number: 4, name: 'テント4番', shortName: 'T4',
        rating: 'normal', x: 742,
        depth: '足元4〜5m',
        description: '東寄りのスタンダードな釣り座。サビキ釣りが安定。',
        fish: [
          { name: 'アジ', method: 'サビキ釣り', season: '5〜11月', difficulty: 'easy' },
          { name: 'イワシ', method: 'サビキ釣り', season: '5〜10月', difficulty: 'easy' },
        ],
      },
      {
        id: 'hp-t3', number: 3, name: 'テント3番付近', shortName: 'T3',
        rating: 'good', x: 812,
        depth: '足元4〜5m / 沖6m',
        description: '東寄りの好ポイント。根魚の魚影が濃く、足元のサビキも好調。六角錐魚礁が近い。',
        fish: [
          { name: 'アジ', method: 'サビキ釣り', season: '5〜11月', difficulty: 'easy' },
          { name: 'イワシ', method: 'サビキ釣り', season: '5〜10月', difficulty: 'easy' },
          { name: 'ガシラ', method: '穴釣り/胴突き', season: '通年', difficulty: 'easy' },
          { name: 'メバル', method: 'メバリング', season: '11〜4月', difficulty: 'medium' },
        ],
        features: ['根魚豊富', 'サビキ好調', '六角錐魚礁前'],
      },
      {
        id: 'hp-t2', number: 2, name: 'テント2番', shortName: 'T2',
        rating: 'normal', x: 881,
        depth: '足元5m',
        description: '東端寄りの安定エリア。潮通しが良く、回遊魚が入りやすい。',
        fish: [
          { name: 'アジ', method: 'サビキ釣り', season: '5〜11月', difficulty: 'easy' },
          { name: 'ガシラ', method: '穴釣り', season: '通年', difficulty: 'easy' },
        ],
      },
      {
        id: 'hp-t1', number: 1, name: 'テント1番〜東端（一級ポイント）', shortName: '東端',
        rating: 'hot', x: 950,
        depth: '足元5m / 沖6〜10m',
        description: 'ベテラン人気No.1。沖50mで湧き潮が発生し、流れに仕掛けを乗せて大物が狙える。青物シーズンは場所取り競争が激しい。',
        fish: [
          { name: 'アオリイカ', method: 'エギング', season: '9〜11月', difficulty: 'medium' },
          { name: 'ハマチ', method: 'のませ釣り', season: '9〜12月', difficulty: 'medium' },
          { name: 'メジロ', method: 'のませ釣り', season: '10〜12月', difficulty: 'hard' },
          { name: 'ブリ', method: 'のませ釣り', season: '11〜1月', difficulty: 'hard' },
          { name: 'スズキ', method: 'ルアー/エビ撒き', season: '通年', difficulty: 'medium' },
          { name: 'アコウ', method: 'ルアー/穴釣り', season: '6〜9月', difficulty: 'hard' },
          { name: 'マダイ', method: 'カゴ釣り', season: '4〜6月, 10〜11月', difficulty: 'medium' },
          { name: 'グレ', method: 'ウキフカセ', season: '10〜5月', difficulty: 'medium' },
          { name: 'ウマヅラハギ', method: '胴突き', season: '8〜12月', difficulty: 'medium' },
        ],
        features: ['潮通し最高', '大物実績多数', 'ベテラン向け', '場所取り競争あり'],
      },
    ],

    seaFeatures: [
      { name: 'テトラ帯',         icon: '▓', left: 2,  width: 18, type: 'tetrapod',      y: 218 },
      { name: '捨石魚礁',         icon: '◆', left: 24, width: 20, type: 'reef-stone',     y: 350 },
      { name: 'コンクリート魚礁', icon: '◆', left: 48, width: 18, type: 'reef-concrete',  y: 370 },
      { name: '六角錐魚礁',       icon: '◆', left: 72, width: 18, type: 'reef-hex',       y: 350 },
    ],

    // 魚種ラベル（ゾーン別にグループ化）
    seaFishLabels: [
      // 西ゾーン（T14〜T11）
      { text: 'チヌ・スズキ・マルハギ・グレ・メバル', x: 30,  y: 280 },
      { text: 'アイナメ',                             x: 30,  y: 320 },
      { text: 'アコウ・アオリイカ・ウマヅラハギ',     x: 140, y: 410 },
      // 左端
      { text: 'アオリイカ',                           x: 10,  y: 260 },
      { text: 'メバル',                               x: 10,  y: 300 },
      // 中央ゾーン（T10〜T7）
      { text: 'メバル・スズキ・チヌ・グレ',           x: 400, y: 280 },
      { text: 'アオリイカ',                           x: 430, y: 310 },
      // 東ゾーン（T6〜T1）
      { text: 'スズキ・グレ・マルハギ・メバル・ウマヅラハギ', x: 600, y: 280 },
      { text: 'アコウ・マダイ',                       x: 800, y: 310 },
      { text: 'ハマチ',                               x: 850, y: 340 },
      // 右端
      { text: 'アオリイカ',                           x: 940, y: 260 },
      // 底物
      { text: 'カレイ',                               x: 450, y: 490 },
    ],

    fishNotes: [
      'アジ・ベラは全域で回遊（サビキ釣りはどの番号でもOK）',
      'ガシラはテトラ付近に多い',
      'カレイとアイナメは投げ釣りで狙う',
      'アオリイカは両端（T1・T14付近）が好ポイント',
      '大型青物（ハマチ・ブリ）は東端（T1）に集中',
    ],
  },
};

export function getDiagramData(slug: string): SpotDiagramData | null {
  return fishingPointsData[slug] || null;
}

// 後方互換: 旧コード用（将来削除）
export function getFishingPoints(slug: string): SpotDiagramData | null {
  return fishingPointsData[slug] || null;
}
