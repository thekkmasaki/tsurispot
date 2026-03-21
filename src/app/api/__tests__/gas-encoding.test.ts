import { describe, it, expect } from "vitest";

describe("GAS encoding", () => {
  it("JSON.stringify で日本語が正しくエンコードされる", () => {
    const payload = { shopName: "テスト釣具店", address: "東京都港区1-1-1" };
    const json = JSON.stringify(payload);
    expect(json).toContain("テスト釣具店");
    expect(json).toContain("東京都港区1-1-1");
  });

  it("無料掲載申請 payload が正しい JSON 形式", () => {
    const payload = {
      type: "shop_listing",
      shopName: "山田釣具店",
      address: "兵庫県明石市大明石町1-1",
      phone: "078-123-4567",
      email: "test@example.com",
      businessHours: "9:00-18:00",
      closedDays: "火曜定休",
      services: "エサ販売、仕掛け販売",
      nearbySpots: "明石港、大蔵海岸",
    };
    const json = JSON.stringify(payload);
    const parsed = JSON.parse(json);
    expect(parsed.type).toBe("shop_listing");
    expect(parsed.shopName).toBe("山田釣具店");
    expect(parsed.address).toBe("兵庫県明石市大明石町1-1");
  });

  it("有料問い合わせ payload (basic) が正しい JSON 形式", () => {
    const payload = {
      type: "paid_inquiry_basic",
      shopName: "山田釣具店",
      contactName: "山田太郎",
      email: "yamada@example.com",
      phone: "078-123-4567",
      message: "ベーシックプランに興味があります",
      plan: "basic",
    };
    const json = JSON.stringify(payload);
    const parsed = JSON.parse(json);
    expect(parsed.type).toBe("paid_inquiry_basic");
    expect(parsed.plan).toBe("basic");
  });

  it("有料問い合わせ payload (pro) が正しい JSON 形式", () => {
    const payload = {
      type: "paid_inquiry_pro",
      shopName: "山田釣具店プロ",
      contactName: "山田太郎",
      email: "yamada@example.com",
      phone: "078-123-4567",
      message: "プロプランに興味があります",
      plan: "pro",
    };
    const json = JSON.stringify(payload);
    const parsed = JSON.parse(json);
    expect(parsed.type).toBe("paid_inquiry_pro");
    expect(parsed.plan).toBe("pro");
  });

  it("日本語フィールドがエスケープされずそのまま含まれる", () => {
    const payload = {
      shopName: "釣具のポイント明石店",
      address: "兵庫県明石市",
      comment: "初心者にもおすすめ",
    };
    const json = JSON.stringify(payload);
    expect(json).toContain("釣具のポイント明石店");
    expect(json).toContain("初心者にもおすすめ");
  });

  it("redirect: follow が fetch options に正しく設定できる", () => {
    const fetchOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true }),
      redirect: "follow" as RequestRedirect,
    };
    expect(fetchOptions.redirect).toBe("follow");
    expect(fetchOptions.headers["Content-Type"]).toBe("application/json");
  });

  it("特殊文字を含む店舗名が正しくシリアライズされる", () => {
    const payload = {
      shopName: "フィッシング'テスト&ショップ\"<>",
      address: "東京都 & 大阪府",
    };
    const json = JSON.stringify(payload);
    const parsed = JSON.parse(json);
    expect(parsed.shopName).toBe("フィッシング'テスト&ショップ\"<>");
  });

  it("空文字フィールドもシリアライズされる", () => {
    const payload = {
      type: "shop_listing",
      shopName: "テスト店",
      businessHours: "",
      closedDays: "",
      services: "",
    };
    const json = JSON.stringify(payload);
    const parsed = JSON.parse(json);
    expect(parsed.businessHours).toBe("");
    expect(parsed.closedDays).toBe("");
  });
});
