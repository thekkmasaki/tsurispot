import { describe, it, expect } from "vitest";
import { fishingSpots, dedupRedirects } from "../spots";
import spotRedirects from "../spot-redirects.json";

// 泡瀬漁港は sks4083(awase-gyokou) と sw5153(awase-gyokou-okinawa) の重複があり、
// 重複排除の勝者は魚種数で決まる。PR #685 でキスを削除した際に awase-gyokou の魚種数が
// 減って勝者が入れ替わり、正規URLが awase-gyokou-okinawa へ反転した。その再発防止。
describe("泡瀬漁港の正規URL", () => {
  it("awase-gyokou が公開され、awase-gyokou-okinawa はそこへ転送される", () => {
    const live = new Set(fishingSpots.map((s) => s.slug));
    expect(live.has("awase-gyokou")).toBe(true);
    expect(live.has("awase-gyokou-okinawa")).toBe(false);
    expect(dedupRedirects.get("awase-gyokou-okinawa")).toBe("awase-gyokou");
    expect((spotRedirects as Record<string, string>)["awase-gyokou-okinawa"]).toBe("awase-gyokou");
  });
});
