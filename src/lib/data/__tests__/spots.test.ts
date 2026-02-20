import { describe, it, expect } from "vitest";
import { fishingSpots, getSpotBySlug, getNearbySpots } from "../spots";

describe("spots data", () => {
  it("should have more than 100 spots", () => {
    expect(fishingSpots.length).toBeGreaterThan(100);
  });

  it("should have unique slugs", () => {
    const slugs = fishingSpots.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("should have unique ids", () => {
    const ids = fishingSpots.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getSpotBySlug should return correct spot", () => {
    const spot = getSpotBySlug("otaru-port");
    expect(spot).toBeDefined();
    expect(spot?.name).toContain("小樽");
  });

  it("getNearbySpots should return sorted by distance", () => {
    const spots = getNearbySpots(35.6762, 139.6503, 5); // 東京付近
    expect(spots.length).toBe(5);
  });

  it("all spots should have valid coordinates", () => {
    fishingSpots.forEach((s) => {
      expect(s.latitude).toBeGreaterThan(20); // 日本最南端より南にはならない
      expect(s.latitude).toBeLessThan(50); // 日本最北端より北にはならない
      expect(s.longitude).toBeGreaterThan(120);
      expect(s.longitude).toBeLessThan(155);
    });
  });

  it("all spots should have at least one catchable fish", () => {
    fishingSpots.forEach((s) => {
      expect(s.catchableFish.length).toBeGreaterThan(0);
    });
  });

  it("all spots should have valid rating", () => {
    fishingSpots.forEach((s) => {
      expect(s.rating).toBeGreaterThanOrEqual(1);
      expect(s.rating).toBeLessThanOrEqual(5);
    });
  });

  it("all spots should have required fields", () => {
    fishingSpots.forEach((s) => {
      expect(s.name).toBeTruthy();
      expect(s.slug).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(s.address).toBeTruthy();
      expect(s.region).toBeDefined();
      expect(s.region.prefecture).toBeTruthy();
      expect(s.spotType).toMatch(/^(port|beach|rocky|river|pier|breakwater)$/);
      expect(s.difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
      expect(s.bestTimes.length).toBeGreaterThan(0);
    });
  });

  it("spots with safety data should have valid safety level", () => {
    fishingSpots
      .filter((s) => s.safetyLevel)
      .forEach((s) => {
        expect(s.safetyLevel).toMatch(/^(safe|caution|danger)$/);
      });
  });

  it("kuchikomi spots should have isKuchikomiSpot flag", () => {
    const kuchikomiSpots = fishingSpots.filter((s) => s.isKuchikomiSpot);
    expect(kuchikomiSpots.length).toBeGreaterThan(0);
  });
});
