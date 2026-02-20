import { describe, it, expect } from "vitest";
import { regions } from "../regions";

describe("regions data", () => {
  it("should have regions", () => {
    expect(regions.length).toBeGreaterThan(0);
  });

  it("should have unique slugs", () => {
    const slugs = regions.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("should have unique ids", () => {
    const ids = regions.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all regions should have required fields", () => {
    regions.forEach((r) => {
      expect(r.prefecture).toBeTruthy();
      expect(r.areaName).toBeTruthy();
      expect(r.slug).toBeTruthy();
    });
  });
});
