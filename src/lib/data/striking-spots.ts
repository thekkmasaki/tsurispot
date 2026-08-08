// GSC実測（2026-08・直近28日窓）の「あと一歩」striking distance spot。
// position 5〜15・impressions≥150 の spot-detail を、県ハブから直リンクして
// 1ページ目上位へ押し上げるための内部リンク強化用データ（収益成長プラン G2）。
//
// - prefSlug は各スポットの住所由来で解決済み（同名の「本荘」を兵庫/秋田で分離）。
// - 全 slug は正規（spot-redirects.json と突合し、リダイレクト元でない＝301ホップ無しを検証済み）。
// - 優先度は Σ imp×(期待CTR(5位) − 現CTR) 降順（rumoi-ko / ishikaribay で全体の約1/4の伸びしろ）。
// - 福島の iwaki-samegawa-surf-a12 は samegawa-kakou6 と同一クエリ「鮫川河口 釣果」で
//   自己競合するため、imp の大きい samegawa-kakou6 に寄せて意図的に除外している。
//
// ※ GSC実測ベースなので恒久データではない。四半期ごとに tmp/g2-striking-spots.mjs で
//   再生成し、順位が1ページ目上位に定着した slug は入れ替えて見直すこと。

export interface StrikingSpot {
  slug: string;
  prefSlug: string;
  /** topQuery の GSC平均掲載順位（28日窓） */
  pos: number;
  /** topQuery の GSC表示回数（28日窓） */
  imp: number;
  /** そのページの最大 impression クエリ（内部リンクの文脈用） */
  topQuery: string;
}

export const strikingSpots: StrikingSpot[] = [
  { slug: "rumoi-ko", prefSlug: "hokkaido", pos: 9.6, imp: 749, topQuery: "留萌 釣り" },
  { slug: "ishikaribay-higashi-futou6", prefSlug: "hokkaido", pos: 10.5, imp: 543, topQuery: "石狩湾新港 釣り" },
  { slug: "misawa-gyokou6", prefSlug: "aomori", pos: 8.3, imp: 395, topQuery: "三沢漁港 釣り" },
  { slug: "samegawa-kakou6", prefSlug: "fukushima", pos: 5.9, imp: 362, topQuery: "鮫川河口 釣果" },
  { slug: "atsuta-gyokou6", prefSlug: "hokkaido", pos: 8.1, imp: 415, topQuery: "厚田漁港 釣り" },
  { slug: "honjo-jinkoutou", prefSlug: "hyogo", pos: 6.7, imp: 462, topQuery: "本荘人工島 釣果" },
  { slug: "mitane-kamayahama-beach-a11", prefSlug: "akita", pos: 5.9, imp: 290, topQuery: "釜谷浜 釣果" },
  { slug: "daisen-mikuriya-port", prefSlug: "tottori", pos: 8.9, imp: 220, topQuery: "御来屋漁港" },
  { slug: "kemigawahama-tottei", prefSlug: "chiba", pos: 8.3, imp: 246, topQuery: "検見川浜突堤 釣果" },
  { slug: "noheji-gyoko", prefSlug: "aomori", pos: 9.3, imp: 190, topQuery: "野辺地釣り" },
  // 名寄せ統合(2026-08)で hachinohe-tatehana-gyokou は hachinohe-tatehana-gyokou6 へ301
  { slug: "hachinohe-tatehana-gyokou6", prefSlug: "aomori", pos: 6.6, imp: 672, topQuery: "八戸釣り情報" },
  { slug: "tenryugawa-kakou-e8", prefSlug: "shizuoka", pos: 8.2, imp: 197, topQuery: "天竜川河口 釣果" },
  { slug: "onahama-aquamarine-park6", prefSlug: "fukushima", pos: 7.5, imp: 178, topQuery: "アクアマリン 釣り公園 釣果" },
  { slug: "maizuru-shinkai-park", prefSlug: "kyoto", pos: 8.1, imp: 235, topQuery: "舞鶴親海公園 釣果" },
  { slug: "honjo-marina", prefSlug: "akita", pos: 7.7, imp: 240, topQuery: "本荘マリーナ 釣り" },
  { slug: "tokachi-kou6", prefSlug: "hokkaido", pos: 11, imp: 266, topQuery: "十勝港 釣り" },
  { slug: "iwaki-yotsukura-port", prefSlug: "fukushima", pos: 7.5, imp: 310, topQuery: "四倉港 釣果" },
  { slug: "okayama-kurashiki-sami-bulk", prefSlug: "okayama", pos: 9.2, imp: 156, topQuery: "沙美海岸 釣り" },
  { slug: "kashima-kou-minami-bouhatei", prefSlug: "ibaraki", pos: 11.7, imp: 246, topQuery: "鹿島港南防波堤" },
  { slug: "karadomari-gyoko-teibo", prefSlug: "fukuoka", pos: 7.6, imp: 182, topQuery: "唐泊漁港 釣果" },
  { slug: "akashi-shinhato", prefSlug: "hyogo", pos: 7.2, imp: 162, topQuery: "明石新波止" },
  { slug: "seiro-ajirohama", prefSlug: "niigata", pos: 7, imp: 280, topQuery: "網代浜 釣り" },
  { slug: "higashimatsushima-nobiru-e8", prefSlug: "miyagi", pos: 5.6, imp: 187, topQuery: "野蒜海岸 釣果" },
  { slug: "obashi-gyoko", prefSlug: "kyoto", pos: 6.1, imp: 214, topQuery: "小橋漁港 釣果" },
  { slug: "maizuru-shirasugi-gyokou", prefSlug: "kyoto", pos: 8.5, imp: 283, topQuery: "白杉漁港 釣果" },
  { slug: "yanagishima-kaigan-surf", prefSlug: "kanagawa", pos: 6, imp: 158, topQuery: "柳島海岸 釣果" },
  { slug: "ikarashi-hama-niigata", prefSlug: "niigata", pos: 8.2, imp: 216, topQuery: "五十嵐浜" },
  { slug: "hakusan-mikawa-gyokou", prefSlug: "ishikawa", pos: 8.3, imp: 154, topQuery: "美川漁港" },
  { slug: "akashi-nakasaki-beranda", prefSlug: "hyogo", pos: 6.8, imp: 210, topQuery: "明石市役所裏ベランダ" },
  { slug: "kasai-rinkai-park", prefSlug: "tokyo", pos: 10.6, imp: 210, topQuery: "葛西臨海公園 釣り" },
  { slug: "choshi-marina-teibo", prefSlug: "chiba", pos: 9.4, imp: 194, topQuery: "銚子マリーナ 釣り" },
  { slug: "ginowan-gyokou-okinawa", prefSlug: "okinawa", pos: 7.1, imp: 206, topQuery: "宜野湾漁港" },
  { slug: "suma-senmori-tottei", prefSlug: "hyogo", pos: 6, imp: 160, topQuery: "千守突堤" },
  { slug: "ajigaura-kaigan6", prefSlug: "ibaraki", pos: 8.3, imp: 157, topQuery: "阿字ヶ浦 釣り" },
  { slug: "tokoname-ko-add3", prefSlug: "aichi", pos: 8.9, imp: 166, topQuery: "常滑港 釣果" },
  { slug: "katayamatsu-shibayamagata", prefSlug: "ishikawa", pos: 7.6, imp: 195, topQuery: "柴山潟 釣り" },
  { slug: "fukui-shinkou", prefSlug: "fukui", pos: 7.6, imp: 209, topQuery: "福井新港" },
  { slug: "yuriage-port", prefSlug: "miyagi", pos: 5.6, imp: 284, topQuery: "閖上 釣果" },
  { slug: "shizuura-port", prefSlug: "shizuoka", pos: 9.6, imp: 169, topQuery: "静浦漁港 釣り" },
];

/** 指定県（prefSlug）の striking spot を impression 降順で返す。県ハブの「注目の釣り場」用。 */
export function getStrikingSpotsByPref(prefSlug: string): StrikingSpot[] {
  return strikingSpots
    .filter((s) => s.prefSlug === prefSlug)
    .sort((a, b) => b.imp - a.imp);
}
