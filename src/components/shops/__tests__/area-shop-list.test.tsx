import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AreaShopList, type AreaShopItem } from "@/components/shops/area-shop-list";

const base: AreaShopItem = {
  id: "a", slug: "a", name: "A店", areaName: "明石", prefecture: "兵庫県", address: "x", phone: "",
  businessHours: "24時間営業", description: "d", latitude: 34.6, longitude: 135,
  hasLiveBait: true, hasFrozenBait: false, hasRentalRod: false, hasParking: false,
  is24h: true, early: false, lateNight: false, hoursLabels: ["24時間営業"], planLevel: "free",
};

describe("AreaShopList", () => {
  it("初期表示は全件、時間帯チップで絞り込める", () => {
    render(
      <AreaShopList
        prefName="兵庫県"
        shops={[base, { ...base, id: "b", slug: "b", name: "B店", is24h: false, hoursLabels: [], hasLiveBait: false }]}
      />,
    );
    expect(screen.getByText("A店")).toBeTruthy();
    expect(screen.getByText("B店")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /24時間営業/ }));
    expect(screen.queryByText("B店")).toBeNull();
    expect(screen.getByText(/1件を表示中/)).toBeTruthy();
  });

  it("該当0件の条件はチップを出さない", () => {
    render(<AreaShopList prefName="兵庫県" shops={[base]} />);
    expect(screen.queryByRole("button", { name: /早朝営業/ })).toBeNull();
  });
});
