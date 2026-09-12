import { TackleShop } from "@/types";

// ===== 釣具のキャスティング 西日本（新規） =====
// 公式店舗検索（https://castingnet.jp/shop/）で実在・住所・電話・営業時間を裏取り済み。
// 座標は国土地理院ジオコーディングAPIで取得。
// 既存収録店（福岡店・唐津店・天草店・鹿屋店）は重複回避のため除外。
export const shopsCastingWest: TackleShop[] = [
  {
    id: "shop-chain-casting-iizuka",
    name: "釣具のキャスティング 飯塚店",
    slug: "casting-iizuka",
    description:
      "福岡県飯塚市枝国にある釣具のキャスティング筑豊エリア拠点店。ロードサイドの大型店で駐車場を完備し、遠賀川水系の淡水釣りから北九州・玄界灘方面の海釣りまで幅広くカバー。活きエサ・冷凍エサを常備し、船・磯・投げ・堤防・渓流・ヘラ・バス・トラウト・ソルトと全ジャンルの品揃えが充実。糸巻きサービスやリール・ロッド修理受付、中古買取、入漁券販売にも対応し、初心者からベテランまで釣行前に立ち寄りやすい。",
    latitude: 33.630882,
    longitude: 130.674606,
    address: "福岡県飯塚市枝国216-4",
    phone: "0948-22-0101",
    website: "https://castingnet.jp/",
    businessHours: "月〜金・日 10:00〜20:00、土 10:00〜21:00",
    closedDays: "無休",
    region: {
      id: "r-casting-iizuka",
      prefecture: "福岡県",
      areaName: "飯塚市",
      slug: "fukuoka-iizuka",
    },
    hasLiveBait: true,
    hasFrozenBait: true,
    hasRentalRod: false,
    hasParking: true,
    parkingDetail: "駐車場あり",
    services: [
      "活きエサ・冷凍エサ販売",
      "ルアーコーナー",
      "ライン巻き替え（糸巻きサービス）",
      "リール・ロッド修理受付",
      "中古買取・中古販売",
      "入漁券販売",
    ],
    baitStock: [],
    nearbySpotSlugs: [],
    imageUrl: "",
    rating: 0,
    isPremium: false,
  },
  {
    id: "shop-chain-casting-chikushino",
    name: "釣具のキャスティング シュロアモール筑紫野店",
    slug: "casting-chikushino",
    description:
      "福岡県筑紫野市原田、大型商業施設「シュロアモール筑紫野」敷地内にある釣具のキャスティング。JR鹿児島本線・原田駅にほど近く、1,580台収容の共用駐車場が使えるため買い物ついでにも立ち寄りやすい。二日市・太宰府エリアや宝満川水系の淡水釣りから、博多湾・玄界灘方面のソルトゲームまで対応する品揃えで、活きエサ・冷凍エサも常備。糸巻きサービスやリール修理受付、中古買取、入漁券販売など各種サービスも充実している。",
    latitude: 33.44191,
    longitude: 130.535904,
    address: "福岡県筑紫野市原田836-4（シュロアモール筑紫野敷地内）",
    phone: "092-235-3126",
    website: "https://castingnet.jp/",
    businessHours: "月〜金 10:00〜21:00、土 9:00〜21:00、日・祝 9:00〜20:00",
    closedDays: "無休",
    region: {
      id: "r-casting-chikushino",
      prefecture: "福岡県",
      areaName: "筑紫野市",
      slug: "fukuoka-chikushino",
    },
    hasLiveBait: true,
    hasFrozenBait: true,
    hasRentalRod: false,
    hasParking: true,
    parkingDetail: "シュロアモール筑紫野敷地内 共用駐車場1,580台",
    services: [
      "活きエサ・冷凍エサ販売",
      "ルアーコーナー",
      "ライン巻き替え（糸巻きサービス）",
      "リール・ロッド修理受付",
      "中古買取・中古販売",
      "入漁券販売",
    ],
    baitStock: [],
    nearbySpotSlugs: [],
    imageUrl: "",
    rating: 0,
    isPremium: false,
  },
];
