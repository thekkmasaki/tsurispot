import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import { inlandFisheryCoops, inlandFisherySpotLinks, getSpotInlandFishery } from "@/lib/data/inland-fishery";

/**
 * 漁協データの整合性。出典は一次情報だけ（漁協・自治体・内水面漁連・水産庁）という運用を、
 * 釣り情報サイト等のドメインを弾くことで機械的に守る。
 */

const NOT_PRIMARY = /(wikipedia\.org|ameblo\.jp|hatena|note\.com|fishing-v\.jp|tsurinews|tsurihack|anglers\.jp|fishmasters|turibito|jalan\.net|tabelog|blog|navitime|tripadvisor|google\.com\/maps)/i;
const spotBySlug = new Map(fishingSpots.map((s) => [s.slug, s]));

function allSources(): string[] {
  const out: string[] = [];
  for (const c of inlandFisheryCoops) {
    out.push(c.officialUrl, c.jurisdiction.source, ...c.fees.map((f) => f.source), ...c.seasons.map((s) => s.source), ...c.rules.map((r) => r.source));
  }
  for (const l of Object.values(inlandFisherySpotLinks)) out.push("outside" in l ? l.reason.source : l.evidence.source);
  return out;
}

describe("内水面漁協データ", () => {
  it("漁協 id は重複しない", () => {
    const ids = inlandFisheryCoops.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("確認日・年度が入っている", () => {
    for (const c of inlandFisheryCoops) {
      expect(c.verifiedAt, c.id).toMatch(/^20\d{2}-\d{2}-\d{2}$/);
      expect(c.seasonYear, c.id).toMatch(/^20\d{2}$/);
    }
  });

  it("出典はすべて https の一次情報", () => {
    for (const u of allSources()) {
      expect(u, u).toMatch(/^https?:\/\//);
      expect(NOT_PRIMARY.test(u), `一次情報でない出典: ${u}`).toBe(false);
    }
  });

  it("対応づけたスポットは実在する河川・湖（管理釣り場以外）で、漁協と同じ県", () => {
    for (const [slug, link] of Object.entries(inlandFisherySpotLinks)) {
      const spot = spotBySlug.get(slug);
      expect(spot, `存在しない slug: ${slug}`).toBeDefined();
      if (!spot) continue;
      if ("outside" in link) continue;
      expect(["river", "lake"], slug).toContain(spot.spotType);
      expect(spot.isManagedPond, slug).toBeFalsy();
      const r = getSpotInlandFishery(slug);
      expect(r?.kind, `漁協が見つからない: ${slug} → ${link.coopId}`).toBe("coop");
      if (r?.kind === "coop") expect(r.coop.prefecture, slug).toBe(spot.region.prefecture);
    }
  });
});

describe("MCP check_fishing_rules の漁協情報", () => {
  it("確認済みの川は漁協・料金・出典つき、未確認の川は未確認、海は出さない", async () => {
    const { checkFishingRules } = await import("@/lib/mcp/tools/rules");
    const kamo = checkFishingRules({ slug: "kamogawa-river-kyoto" }) as { inlandFishery?: { status: string; coop?: string; fees?: unknown[] } };
    expect(kamo.inlandFishery?.status).toBe("confirmed");
    expect(kamo.inlandFishery?.coop).toBe("賀茂川漁業協同組合");
    expect(kamo.inlandFishery?.fees?.length).toBeGreaterThan(0);

    const unknownRiver = fishingSpots.find(
      (s) => s.spotType === "river" && !s.isManagedPond && !inlandFisherySpotLinks[s.slug],
    )!;
    const u = checkFishingRules({ slug: unknownRiver.slug }) as { inlandFishery?: { status: string } };
    expect(u.inlandFishery?.status).toBe("unconfirmed");

    const sea = fishingSpots.find((s) => s.spotType === "port")!;
    expect((checkFishingRules({ slug: sea.slug }) as { inlandFishery?: unknown }).inlandFishery).toBeUndefined();
  });
});
