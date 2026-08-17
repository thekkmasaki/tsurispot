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
 * 陸（岸壁・堤防・磯）からのまき餌釣りにも制限がかかる県かを判定する。
 *
 * 「船舶を使用してのまき餌釣りを除く」型の県（兵庫・岡山・香川・広島の船規制など）は
 * 陸からのサビキが合法なので対象外にする。ここを区別しないと、
 * 合法なスポットまで違反として叩いてしまい、逆方向の誤情報を生む。
 */
function isShoreChumRestricted(chum: string | undefined): boolean {
  if (!chum) return false;
  // 「船」「船舶」だけに係る規制は陸に及ばない
  const shoreRestricted =
    /原則禁止|全面禁止|のみ可|のみです|2箇所のみ|２箇所のみ|以外.*(行えません|できません|禁止)|地先で.*禁止|オキアミ以外|区域で.*禁止|指定[^。]*場所[^。]*のみ/;
  return shoreRestricted.test(chum);
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
  it("まき餌が制限されている県のスポットが chumAllowed: true になっていない", () => {
    const violations: string[] = [];
    for (const spot of fishingSpots) {
      if (spot.rules?.chumAllowed !== true) continue;
      const rule = ruleByPref.get(spot.region.prefecture);
      if (!isShoreChumRestricted(rule?.seaRules?.chumRegulation)) continue;
      // 許可された場所であることが otherRules に明記されていれば適法（例: 鹿島港魚釣園）
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

describe("まき餌規制県での釣法推奨", () => {
  it("まき餌が原則禁止の県のスポットが description でサビキ等を勧めていない", () => {
    const violations: string[] = [];
    for (const rule of prefectureFishingRules) {
      // 陸からのまき餌にも制限がある県だけを対象にする。
      // 「船舶を使用してのまき餌釣りを除く」型の県は陸からのサビキが合法なので対象外。
      if (!isShoreChumRestricted(rule.seaRules?.chumRegulation)) continue;
      for (const spot of fishingSpots) {
        if (spot.region.prefecture !== rule.prefName) continue;
        if (spot.fishingBan) continue; // 釣り禁止スポットは別途バナーが出る
        if (!CHUM_METHOD.test(spot.description)) continue;
        // 禁止に触れている文なら推奨ではない
        if (/禁止|行えません|できません/.test(spot.description)) continue;
        violations.push(`${rule.prefName} ${spot.slug}（${spot.name}）`);
      }
    }
    expect(
      violations,
      `まき餌が原則禁止の県で、description がサビキ等を勧めています:\n${violations.join("\n")}`
    ).toEqual([]);
  });
});
