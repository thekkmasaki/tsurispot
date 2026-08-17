import { describe, it, expect } from "vitest";
import { fishingSpots } from "../spots";
import { prefectureFishingRules } from "../fishing-rules-data";

/**
 * 「そこで釣りが合法か」を検証するテスト。
 *
 * 発端: 日立港第5埠頭（釣り禁止・茨城県はまき餌釣り原則禁止）のページが
 * 「アジやサバのサビキ釣りが盛ん」と紹介していた、というユーザー指摘。
 * 全国監査の結果、同種の問題が複数県にあり、原因は
 * 「県レベルの規制データ（fishing-rules-data.ts）と個別スポット（spots-*.ts）が
 * 突き合わされていない」ことだった。既存テスト（spots.test.ts / integration.test.ts）は
 * 座標・重複・必須フィールドしか見ておらず、合法性の検証は皆無だった。
 *
 * ここでは外部への問い合わせなしに、リポジトリ内のデータ同士の矛盾を検出する。
 */

/** 県名 → その県の公式ルール */
const ruleByPref = new Map(prefectureFishingRules.map((r) => [r.prefName, r]));

/** サビキ等、まき餌を使う釣法を推奨していると読める表現 */
const CHUM_METHOD = /サビキ|コマセ|撒き餌|まき餌|アミエビ|カゴ釣り/;

/**
 * 陸（岸壁・堤防・磯）からのまき餌釣りが県全域で原則禁止かを判定する。
 *
 * 判定には自由文の chumRegulation ではなく、構造化フィールド chumFromShore を使う。
 * まき餌規制は「県単位」では決まらないため、文字列マッチだと誤判定が避けられない:
 * - 千葉・和歌山・兵庫・岡山・香川は「船からのみ禁止」＝陸のサビキは合法
 * - 青森・新潟・秋田・広島・愛媛・大分・宮崎・佐賀は「特定の地先・区域のみ禁止」
 * これらを一律に違反扱いすると、合法な釣りを違法と書く逆方向の誤情報になる。
 *
 * "area-limited"（地先単位）はスポットの所在地を機械判定できないため、ここでは扱わない。
 * 該当スポットは個別に rules.otherRules で注記する運用とする。
 */
function isShoreChumProhibited(rule: { seaRules?: { chumFromShore?: string } } | undefined): boolean {
  return rule?.seaRules?.chumFromShore === "prohibited";
}

describe("fishingBan の整合性", () => {
  const banned = fishingSpots.filter((s) => s.fishingBan);

  it("釣り禁止スポットが1件以上登録されている", () => {
    // 監査で一次情報が取れた案件（日立港系・鹿島港系）が入っているはず。
    // 0件に戻ったら、規制情報がまるごと失われたということ。
    expect(banned.length).toBeGreaterThan(0);
  });

  it("fishingBan には一次情報の出典と確認日が必ずある", () => {
    for (const spot of banned) {
      const ban = spot.fishingBan!;
      expect(
        ban.sourceUrls.length,
        `${spot.slug}: sourceUrls が空。釣り禁止の断定には一次情報が必要`
      ).toBeGreaterThan(0);
      for (const url of ban.sourceUrls) {
        expect(url, `${spot.slug}: 出典が http(s) URL でない`).toMatch(/^https?:\/\//);
      }
      expect(
        ban.confirmedAt,
        `${spot.slug}: confirmedAt は YYYY-MM-DD 形式で必須`
      ).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(ban.reason.length, `${spot.slug}: reason が短すぎる`).toBeGreaterThan(20);
    }
  });

  it("代替スポットは実在し、それ自体が釣り禁止でない", () => {
    const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));
    for (const spot of banned) {
      for (const altSlug of spot.fishingBan!.alternativeSpotSlugs ?? []) {
        const alt = bySlug.get(altSlug);
        expect(alt, `${spot.slug}: 代替スポット ${altSlug} が存在しない`).toBeDefined();
        expect(
          alt!.fishingBan,
          `${spot.slug}: 代替スポット ${altSlug} 自体が釣り禁止になっている`
        ).toBeUndefined();
      }
    }
  });

  it("釣り禁止スポットの description が釣行を勧めていない", () => {
    // 「〜が狙える」「〜が楽しめる」だけの紹介文のまま fishingBan を付けると、
    // バナーと本文が矛盾して読者を混乱させる。禁止の事実に触れていることを求める。
    for (const spot of banned) {
      expect(
        spot.description,
        `${spot.slug}: fishingBan があるのに description が禁止に触れていない`
      ).toMatch(/禁止|できない|できません|立入/);
    }
  });
});

describe("県のまき餌規制とスポットの突合", () => {
  it("まき餌が原則禁止の県のスポットが chumAllowed: true になっていない", () => {
    const violations: string[] = [];
    for (const spot of fishingSpots) {
      if (spot.rules?.chumAllowed !== true) continue;
      if (!isShoreChumProhibited(ruleByPref.get(spot.region.prefecture))) continue;
      // 許可された場所であることが otherRules に明記されていれば適法
      // （茨城の鹿島港魚釣園・ふれあい公園のような、県が指定した例外）
      if (spot.rules.otherRules?.some((r) => /まき餌|コマセ/.test(r))) continue;
      violations.push(`${spot.region.prefecture} ${spot.slug}（${spot.name}）`);
    }
    expect(
      violations,
      `まき餌が制限されている県で chumAllowed: true になっているスポット:\n${violations.join("\n")}\n` +
        `県の規制を確認し、chumAllowed を false にするか、許可された場所であることを otherRules に明記してください。`
    ).toEqual([]);
  });
});

describe("県ルールが釣り禁止と明記した場所の掲載", () => {
  /**
   * 県の restrictedAreas に「◯◯港は原則釣り禁止」と書いてあるのに、
   * その港のスポットを釣り場として掲載している自己矛盾を検出する。
   *
   * 対象は「原則釣り禁止」「多くの区域は釣り禁止」のように、
   * 一部区域ではなく広範な禁止を明記しているものに限る。
   * （「一部区域は立入制限があります」程度の記述は、スポット掲載と必ずしも矛盾しない）
   */
  const STRONG_BAN = /(原則.*禁止|多くの(区域|護岸).*禁止|以外.*釣り禁止|全域.*禁止)/;

  it("県が広範な釣り禁止を明記した場所に、警告のないスポットが存在しない", () => {
    const suspects: string[] = [];
    for (const rule of prefectureFishingRules) {
      const areas = rule.seaRules?.restrictedAreas ?? [];
      for (const area of areas) {
        if (!STRONG_BAN.test(area)) continue;
        // 「東京港（お台場・品川埠頭等）の港湾施設内は原則釣り禁止です。」から
        // 地名候補（2文字以上の連続する漢字・カタカナ）を取り出す
        const places = [...area.matchAll(/[一-龠ァ-ヴ]{2,10}(?:港|埠頭|ふ頭|防波堤|海浜公園|アイランド)/g)]
          .map((m) => m[0])
          .filter((p) => p.length >= 3);
        if (places.length === 0) continue;
        for (const spot of fishingSpots) {
          if (spot.region.prefecture !== rule.prefName) continue;
          if (!places.some((p) => spot.name.includes(p))) continue;
          // 禁止バナー or スポット個別の立入禁止注記があれば、矛盾は解消済み
          if (spot.fishingBan) continue;
          if (spot.rules?.restrictedAreas?.length) continue;
          suspects.push(`${rule.prefName} ${spot.slug}（${spot.name}）← 県ルール: 「${area}」`);
        }
      }
    }
    expect(
      suspects,
      `県ルールが釣り禁止と明記している場所に、警告のないスポットがあります:\n${suspects.join("\n")}\n` +
        `一次情報で裏が取れるなら fishingBan を設定し、取れないなら rules.restrictedAreas に注意喚起を入れてください。`
    ).toEqual([]);
  });
});

describe("所在地データの整合性", () => {
  /**
   * address の都道府県と region.prefecture の食い違いを検出する。
   *
   * 県の規制はスポットの所在県で決まるため、ここがズレていると
   * 誤った県のルールを表示してしまう。実際に監査で
   * 「山口県光市の虹ヶ浜が広島県」「青森県八戸市が北海道」という誤りが見つかった。
   */
  const PREFECTURES = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
  ];

  /**
   * 既知の不一致（2026-08-18 時点で 73 件）。
   *
   * 修正方向がケースごとに違うため一括では直せない:
   * - 住所が誤り: 「鳥取県阿南市」（阿南市は徳島県）、「石川県魚津市」（魚津市は富山県）
   * - region が誤り: 千葉県のスポットが region「東京都」、長崎県が「佐賀県」など
   * - 県境で判断が要る: 利根川河口堰（茨城/千葉）、旧江戸川河口（東京/千葉）、木曽川（愛知/岐阜）
   *
   * 県のまき餌規制はスポットの所在県で決まるため、これは誤ったルールを表示する経路になる。
   * 全件の棚卸しは `node scripts/dedup-winner.mjs --region-mismatch` で行える。
   *
   * **このリストは増やしてはいけない。** 新規の不一致は fail する。
   * 解消したものはリストから削除する（残っていると「掃除漏れ」として fail する）。
   */
  const KNOWN_REGION_MISMATCHES = new Set([
    "akigawa-keikoku6", "amatsu-gyoko6", "anamizu-boramachi-kou-a13", "anan-tachibana-kou-c8",
    "arakawa-iwabuchi-suimon6", "chikura-gyoko6", "choshi-marina6", "edogawa-hosuiro6",
    "edogawa-housui-ichikawa-a11", "edogawa-lower-unagi", "funabashi-shinsuikouen6", "fushiki-kou-e8",
    "futtsu-shinko6", "hachijojima-sokodo6", "hamura-seki-shita6", "himi-nadaura-kaigan-a13",
    "hota-gyoko6", "ichihara-umizuri6", "iioka-gyoko6", "iwai-kaigan6",
    "kagoshima-sendaigawa-upper-stream", "kamakitako-tsuri6", "karatsu-kou-w6", "kinuta-tamagawa6",
    "kisogawa-middle-river", "kitakami-oppa-wan6", "kominato-gyoko6", "kozushima-ko6",
    "kujukurihama-katakai6", "kurobe-gyoko", "kyouden-gyokou-toyama", "kyu-edogawa-mouth",
    "makuhari-no-hama6", "mizumoto-koen6", "nabakigawa-kakko6", "naruto-uchinomi-c8",
    "niijima-ko6", "nojima-zaki6", "nyuzen-kaigan-surf-e8", "obitsu-kakko6",
    "okura-kaigan-gogan-a12", "okurigawa-goryuten-e8", "okutama-ko6", "oshima-okada6",
    "sakaiminato-gaiko", "sakaiminato-mihonoseki", "sakaiminato-nakano-kou", "sakaiminato-yumeminato-gogan",
    "shakujii-sanpoji6", "shimanour-nobeoka-w6", "shinminato-east-breakwater", "shinminato-gyokou-e8",
    "shinminato-gyokou-toyama", "shirako-kaigan6", "taito-gyoko6", "takashima-saga-w6",
    "tamagawa-mitake6", "tateyama-ko6", "tomiura-shinko6", "tone-ozeki-gyoda-ora-a12",
    "tone-river-mouth", "tonegawa-shibukawa-a9", "toyama-kou", "tsugaru-kizukuri-port-a12",
    "tsukigawa-kou-w6", "uozu-hojo-port", "uozu-katakaigawa-kakou-a13", "uozu-ko-toyama",
    "urayasu-takasu6", "wadaura-gyoko6", "watarasegawa-ashikaga-a9", "yaizu-ko-shinko",
    "yorogawa-kakko6", "zenpukujigawa6",
  ]);

  it("address の都道府県と region.prefecture が一致する（既知分を除く）", () => {
    const mismatches: string[] = [];
    const resolved: string[] = [];
    for (const spot of fishingSpots) {
      // 「東京都」と「京都府」は接尾辞込みで比較すれば誤ヒットしない
      const fromAddress = PREFECTURES.find((p) => spot.address.includes(p));
      if (!fromAddress) continue; // 県名を含まない住所は対象外
      const isMismatch = fromAddress !== spot.region.prefecture;
      if (isMismatch && !KNOWN_REGION_MISMATCHES.has(spot.slug)) {
        mismatches.push(
          `${spot.slug}（${spot.name}）: address="${spot.address}" だが region.prefecture="${spot.region.prefecture}"`
        );
      }
      if (!isMismatch && KNOWN_REGION_MISMATCHES.has(spot.slug)) {
        resolved.push(spot.slug);
      }
    }
    expect(
      mismatches,
      `住所と region の都道府県が新たに食い違っています。県の釣りルールが誤って適用されます:\n${mismatches.join("\n")}`
    ).toEqual([]);
    expect(
      resolved,
      `解消済みのスポットが KNOWN_REGION_MISMATCHES に残っています。リストから削除してください:\n${resolved.join(", ")}`
    ).toEqual([]);
  });
});

describe("まき餌規制県での釣法推奨", () => {
  it("まき餌が原則禁止の県のスポットが description でサビキ等を勧めていない", () => {
    const violations: string[] = [];
    for (const rule of prefectureFishingRules) {
      if (!isShoreChumProhibited(rule)) continue;
      for (const spot of fishingSpots) {
        if (spot.region.prefecture !== rule.prefName) continue;
        if (spot.fishingBan) continue; // 釣り禁止スポットは別途バナーが出る
        if (!CHUM_METHOD.test(spot.description)) continue;
        // 禁止に触れている文なら推奨ではない
        if (/禁止|行えません|できません/.test(spot.description)) continue;
        // 県が指定した例外（まき餌が認められた場所）は適法
        if (spot.rules?.otherRules?.some((r) => /まき餌|コマセ/.test(r))) continue;
        violations.push(`${rule.prefName} ${spot.slug}（${spot.name}）`);
      }
    }
    expect(
      violations,
      `まき餌が原則禁止の県で、description がサビキ等を勧めています:\n${violations.join("\n")}`
    ).toEqual([]);
  });
});
