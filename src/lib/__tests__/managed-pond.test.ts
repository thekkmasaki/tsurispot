import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import {
  buildManagedTitle,
  buildManagedMetaDescription,
  buildManagedLead,
  buildManagedFaqs,
  openingHoursSpec,
  managedJsonLdExtras,
} from "@/lib/managed-pond";
import { generateSpotSummary } from "@/lib/utils/spot-content-generator";
import { isSitemapEligible } from "@/lib/seo-quality";
import { spotLine } from "@/lib/llms";
import { getManagedByPrefecture, MIN_MANAGED_PER_PREF } from "@/lib/managed-pond-hub";
import { TITLE_MAX } from "@/lib/utils/seo";

const managed = fishingSpots.filter((s) => s.isManagedPond);
const sample = managed.find((s) => s.slug === "tokyo-hachioji-asakawa-kokusai-masu-tsuriba")!;

describe("管理釣り場SEO/GEO", () => {
  it("対象データが存在する", () => {
    expect(managed.length).toBeGreaterThan(700);
    expect(sample).toBeTruthy();
  });

  it("title は全件60字以内で、料金はデータがあるときだけ入る", () => {
    for (const s of managed) {
      const t = buildManagedTitle(s);
      expect(t.length, s.slug).toBeLessThanOrEqual(TITLE_MAX);
      if (!s.feeDetail && !s.managementInfo?.fishingFee) expect(t, s.slug).not.toContain("料金");
    }
    expect(buildManagedTitle(sample)).toContain("料金・営業時間・釣れる魚");
  });

  it("description は全件100〜160字で、混雑予測など該当しない語を含まない", () => {
    for (const s of managed) {
      const d = buildManagedMetaDescription(s);
      const n = [...d].length;
      expect(n, `${s.slug}: ${d}`).toBeGreaterThanOrEqual(100);
      expect(n, s.slug).toBeLessThanOrEqual(160);
      expect(d, s.slug).not.toContain("混雑予測");
    }
  });

  it("未確認の設備を「ない」と断定しない（FAQ・要約・冒頭）", () => {
    for (const s of managed) {
      const text = [
        ...buildManagedFaqs(s).map((f) => f.question + f.answer),
        Object.values(generateSpotSummary(s)).join(""),
        buildManagedLead(s),
      ].join("\n");
      expect(text, s.slug).not.toMatch(/現地にトイレはない|専用駐車場はありません|コンビニは近くにない|釣具店は近くにない|トイレ×|駐車場×/);
      expect(text, s.slug).not.toContain("未確認");
    }
  });

  it("冒頭要約は事実項目を含む", () => {
    const lead = buildManagedLead(sample);
    expect(lead).toContain("料金:");
    expect(lead).toContain("営業時間: 7:00〜17:00");
    expect(lead).toContain("2026年11月17日時点");
  });

  it("営業時間の構造化データは単純な表記だけ変換する", () => {
    const withHours = (openingHours: string, closedDays?: string) => ({
      ...sample,
      managementInfo: { ...sample.managementInfo!, openingHours, closedDays },
    });
    const spec = openingHoursSpec(withHours("9:00〜17:00", "火曜")) as { dayOfWeek: string[]; opens: string }[];
    expect(spec[0].opens).toBe("09:00");
    expect(spec[0].dayOfWeek).not.toContain("Tuesday");
    expect(spec[0].dayOfWeek).toHaveLength(6);
    expect(openingHoursSpec(withHours("平日 10:00〜16:00、土日祝 10:00〜17:00"))).toBeUndefined();
    expect(openingHoursSpec(withHours("9:00〜17:00", "火曜(祝日は営業)"))).toBeUndefined();
    expect(managedJsonLdExtras(sample).telephone).toBe("042-661-6280");
  });

  it("魚種1種でも、料金か営業時間のある管理釣り場は sitemap 対象", () => {
    const base = { description: "あ".repeat(120), catchableFish: [{}] as unknown[] };
    expect(isSitemapEligible(base)).toBe(false);
    expect(isSitemapEligible({ ...base, isManagedPond: true })).toBe(false);
    expect(isSitemapEligible({ ...base, isManagedPond: true, feeDetail: "1,000円" })).toBe(true);
    expect(isSitemapEligible({ ...base, description: "短い", isManagedPond: true, feeDetail: "1,000円" })).toBe(false);
  });

  it("llms の行は料金・営業時間を出し、ベストシーズンやトイレなしは出さない", () => {
    const line = spotLine(sample);
    expect(line).toContain("営業 7:00〜17:00");
    expect(line.split(" | ")).toHaveLength(9);
    expect(line).not.toContain("ベストシーズン");
    expect(line).not.toContain("トイレなし");
  });

  it("県ハブは件数順で、閾値以上の県が複数ある", () => {
    const g = getManagedByPrefecture();
    expect(g.filter((x) => x.spots.length >= MIN_MANAGED_PER_PREF).length).toBeGreaterThan(20);
    expect(g[0].spots.length).toBeGreaterThanOrEqual(g[g.length - 1].spots.length);
  });
});
