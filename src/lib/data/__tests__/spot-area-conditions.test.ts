import { describe, it, expect } from "vitest";
import { fishingSpots } from "../spots";
import { spotAreaConditions } from "../spot-area-conditions";
import { spotMergeMap } from "../spot-merge-map";
import { getSpotAreaConditions, getSpotRestrictionSummary } from "@/lib/spot-restrictions";

/**
 * 2026-11-21 監査（指示書02）: 部分禁止・条件付きスポット121件
 * （部分禁止・条件付き97件 ＋ ページが禁止に言及しているが切り分け表示がない24件）。
 */
const AUDIT_TARGET_SLUGS = [
    "sendai-chuo-park",
    "sendai-ko-chuo-koen",
    "niigata-nishi-port",
    "niigata-higashi-kou",
    "umikaze-park",
    "odawara-hayakawa-port",
    "hayakawa-kou",
    "odawara-hayakawa-kou-e8",
    "odawara-kou-hayakawa-a11",
    "kashiwazaki-port",
    "shinminato-east-breakwater",
    "sado-ryotsu-higashi-futo",
    "joetsu-minatomachi-tottei",
    "kashiwazaki-nishi-bohatei-a10",
    "naoetsu-daisan-higashi-teibo",
    "yaizu-ko",
    "yaizu-shinko",
    "ooigawa-lower-unagi",
    "yaizu-kogawa-kou",
    "yaizu-ogawa-kou-e8",
    "nagasaki-port",
    "iki-gonoura-port",
    "tsushima-izuhara-w6",
    "nagasaki-mizubenomori-w6",
    "iki-gounoura-w6",
    "fukue-kou-w6",
    "fukue-kou-terminal-s8",
    "tsushima-hitakatsu-kou-s8",
    "seaside-cosmo",
    "tsuruhama-gogan",
    "maishima-gogan",
    "maishima-tsuri",
    "maishima-seaside-promenade",
    "maishima-gogan-a11",
    "kobe-airport-veranda",
    "kobe-airport-gogan",
    "kasai-rinkai-park",
    "arakawa-kakou-kasai",
    "shimizu-hinode-futo",
    "shimizu-ejiri-futo",
    "marinpia-kobe-gogan",
    "maiko-kouen-gogan-a12",
    "tarumi-gyokou-gogan-a13",
    "niigata-higashiko-dai2-bohatei",
    "niigata-higashikou-dai2-bouhatei",
    "shiomi-futo-nagoya",
    "nagoyakou-shiomi-futou",
    "nagoyakou-shiomi-futou-a13",
    "kameyama-dam",
    "ikehara-dam",
    "nanairo-dam",
    "chichibu-sakurako",
    "amanjakuko-hiyoshi-dam",
    "murou-dam",
    "ikehara-dam-bass-detail",
    "nanairo-dam-detail",
    "kannako-shimokubo-dam",
    "shimokitayama-ikehara-dam",
    "chichibu-urayama-dam",
    "sameura-dam",
    "kakkaku-dam",
    "kawaji-damuko",
    "yamagata-gassan-dam",
    "tochigi-kawaji-dam-lake",
    "gassan-dam-gassanko6",
    "urayama-dam-sakurako6",
    "agigawa-dam-gifu",
    "gassan-dam-e8",
    "kannako-lake-a11",
    "tsufuro-dam-a11",
    "kakkaku-dam-chichibu-yoshida-a12",
    "ena-agigawa-damuko-a13",
    "ikehara-kamiikehara-wand-a13",
    "tamashima-e-chiku",
    "tamashima-kou-otoshima",
    "kurashiki-tamashima-e-ganpeki",
    "kurashiki-mizushima-nishi-futou",
    "tamashima-kou-okayama-w6",
    "mizushima-kou-c8",
    "okayama-kurashiki-tamashima-kurosaki-bulk",
    "mizushima-kou-gogan-a12",
    "tamashima-kou-gogan-a13",
    "takamatsu-sunport-gokan",
    "sunport-takamatsu-kagawa",
    "takamatsu-sunport-c8",
    "matsukawako-okuno-dam",
    "sakaiminato-marina-c8",
    "kanazawa-suisaisen-ryokuchi",
    "umi-no-koen",
    "niigata-kou-nishi-tottei",
    "toyama-shinko-higashi-bohatei",
    "kaiomaru-park-gogan-imizu-a12",
    "shiraishi-gyokou-kanda-w6",
    "kanda-kou-s8",
    "kagawa-takamatsu-asahi-futo-bulk",
    "hakata-suzaki-futo-a9",
    "midori-kusaki-dam-shimoryuu-a13",
    "tateyama-jieitai-breakwater",
    "enoshima-breakwater",
    "hakata-wharf",
    "numazu-port",
    "choshi-port",
    "tomakomai-nishi-port",
    "sakai-senboku-port",
    "sakai-ohama-futo",
    "odaiba-seaside-park",
    "tannowa-gyoko",
    "himeji-port",
    "ine-gyoko",
    "sumaura-gyoko",
    "nishinomiyahama",
    "amagasaki-port-koumon",
    "sakoshi-gyoko",
    "iwaya-gyoko",
    "mera-gyokou-shizuoka",
    "sado-himezu-gyokou",
    "tokyo-ko-yacho6",
    "miyazaki-hyuga-hososhima-port-bulk",
    "okinawa-naha-migusuku-bulk",
    "tokyokou-harumi-futou-a13",
    "shizuoka-fujinomiya-fuji-yoson-inokashira",
];

/**
 * 統合先が監査対象外のため、この PR では条件を付けていない slug。
 * kameyama-dam は君津・亀山湖（kimitsu-kameyamako-a13）に 301 統合済み。統合先への付与は別途判断。
 */
const KNOWN_UNHANDLED = new Set(["kameyama-dam"]);

describe("一部区域・条件付き禁止の条件（spot-area-conditions）", () => {
  const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));

  it("監査対象は121件（重複なし）", () => {
    expect(new Set(AUDIT_TARGET_SLUGS).size).toBe(121);
  });

  it("条件はすべて公開中のスポットに効いている", () => {
    for (const [slug, conditions] of Object.entries(spotAreaConditions)) {
      const spot = bySlug.get(slug);
      expect(spot, `${slug}: 公開中のスポットに無い（統合後の slug を指定する）`).toBeDefined();
      expect(spot!.restrictedAreaConditions).toEqual(conditions);
      expect(conditions.every((c) => c.trim().length >= 40), `${slug}: 条件の文が短すぎる`).toBe(true);
    }
  });

  it("条件は監査対象（またはその統合先）にだけ付いている", () => {
    const targets = new Set(AUDIT_TARGET_SLUGS.map((s) => spotMergeMap[s] ?? s));
    for (const slug of Object.keys(spotAreaConditions)) {
      expect(targets.has(slug), `${slug}: 監査対象外のスポットに条件を付けている`).toBe(true);
    }
    for (const spot of fishingSpots) {
      if (spot.restrictedAreaConditions) expect(targets.has(spot.slug), spot.slug).toBe(true);
    }
  });

  it("監査対象のスポットはすべて、ルール欄に禁止の条件が表示される", () => {
    for (const target of AUDIT_TARGET_SLUGS) {
      if (KNOWN_UNHANDLED.has(target)) continue;
      const slug = spotMergeMap[target] ?? target;
      const spot = bySlug.get(slug);
      expect(spot, `${target} → ${slug}: 公開中のスポットに無い`).toBeDefined();
      const shown =
        getSpotAreaConditions(spot!).length > 0 ||
        (spot!.rules?.restrictedAreas?.some((a) => a.trim().length > 0) ?? false) ||
        spot!.fishingBan?.scope === "full";
      expect(shown, `${target}: ルール欄に禁止の条件が出ていない`).toBe(true);
      expect(getSpotRestrictionSummary(spot!), `${target}: 基本データ表に制限が出ていない`).not.toBeNull();
    }
  });

  it("一部禁止の fishingBan はルール欄の条件にも含まれる", () => {
    for (const spot of fishingSpots) {
      if (spot.fishingBan?.scope !== "partial") continue;
      expect(getSpotAreaConditions(spot)).toContain(spot.fishingBan.reason);
    }
  });
});
