import { describe, expect, it } from "vitest";
import { tackleShops } from "@/lib/data/shops";
import { prefectures } from "@/lib/data/prefectures";
import {
  buildShopAreaDescription,
  buildShopAreaLead,
  buildShopAreaTitle,
  buildShopDetailDescription,
  buildShopDetailTitle,
  countShopsByCity,
  cpLength,
  extractCity,
  SHOP_TITLE_MAX,
  shortBusinessHours,
} from "../shop-meta";
import { DESCRIPTION_MIN } from "../meta-description";
import { DESCRIPTION_MAX } from "@/lib/utils/seo";

const realShops = tackleShops.filter((s) => !s.slug.startsWith("sample-"));
const shopsOf = (prefName: string) =>
  realShops.filter((s) => s.region.prefecture === prefName);

describe("extractCity", () => {
  it("都道府県・郵便番号を除いて市区町村を返す", () => {
    expect(extractCity("大阪府大阪市中央区道頓堀1-1", "大阪府")).toBe("大阪市");
    expect(extractCity("〒437-1612 静岡県御前崎市池新田1234", "静岡県")).toBe("御前崎市");
    expect(extractCity("東京都千代田区丸の内1-1", "東京都")).toBe("千代田区");
  });
  it("郡は読み飛ばして町村名を返す", () => {
    expect(extractCity("広島県安芸郡坂町小屋浦1-8-8", "広島県")).toBe("坂町");
    expect(extractCity("和歌山県東牟婁郡串本町串本", "和歌山県")).toBe("串本町");
  });
  it("市区町村字が連続する地名を切らない", () => {
    expect(extractCity("三重県四日市市諏訪町1", "三重県")).toBe("四日市市");
    expect(extractCity("広島県廿日市市宮島口1", "広島県")).toBe("廿日市市");
    expect(extractCity("千葉県市川市行徳1", "千葉県")).toBe("市川市");
  });
  it("住所に都道府県が無い・取れない場合は空文字", () => {
    expect(extractCity("神戸市中央区琴ノ緒町5-5-11", "兵庫県")).toBe("神戸市");
    expect(extractCity("※サンプル店舗（実在しません）", "兵庫県")).toBe("");
  });
  it("実データ全件で市区町村が取れる（サンプル店舗を除く）", () => {
    const missing = realShops.filter((s) => !extractCity(s.address, s.region.prefecture));
    expect(missing.map((s) => s.slug)).toEqual([]);
  });
});

describe("shortBusinessHours", () => {
  it("単一レンジと24時間営業だけを返す", () => {
    expect(shortBusinessHours("8:00〜18:00")).toBe("8:00〜18:00");
    expect(shortBusinessHours("24時間営業")).toBe("24時間営業");
    expect(shortBusinessHours("平日 6:00〜21:00 / 土 5:00〜22:00")).toBe("");
    expect(shortBusinessHours("お問い合わせください")).toBe("");
  });
});

describe("エリア一覧 title / description / lead", () => {
  it("大阪府: 県名・件数・市区町村名が入り32字以内", () => {
    const shops = shopsOf("大阪府");
    const title = buildShopAreaTitle({ prefName: "大阪府", shops });
    expect(title).toMatch(/^大阪府の釣具屋・釣具店\d+件｜大阪市・/);
    expect(cpLength(title)).toBeLessThanOrEqual(SHOP_TITLE_MAX);
    const desc = buildShopAreaDescription({ prefName: "大阪府", shops });
    expect(desc.startsWith(`大阪府の釣具屋・釣具店${shops.length}件を一覧掲載。`)).toBe(true);
    expect(desc).toContain("大阪市");
    const lead = buildShopAreaLead({ prefName: "大阪府", shops });
    expect(lead).toContain(`${shops.length}件を掲載中`);
    expect(lead).toContain("大阪市");
  });

  it("全都道府県で title は32字以内・description は120〜158字（0件県は定型文）", () => {
    for (const pref of prefectures) {
      const shops = shopsOf(pref.name);
      const title = buildShopAreaTitle({ prefName: pref.name, shops });
      expect(cpLength(title), `${pref.slug}: ${title}`).toBeLessThanOrEqual(SHOP_TITLE_MAX);
      expect(title).not.toContain("undefined");
      expect(title).not.toContain("NaN");
      const desc = buildShopAreaDescription({ prefName: pref.name, shops });
      expect(desc).not.toContain("undefined");
      if (shops.length > 0) {
        expect(cpLength(desc), `${pref.slug}: ${desc}`).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
        expect(cpLength(desc), `${pref.slug}: ${desc}`).toBeLessThanOrEqual(DESCRIPTION_MAX);
        expect(title).toContain(`${shops.length}件`);
      } else {
        expect(title).toBe(`${pref.name}の釣具屋・釣具店一覧`);
      }
    }
  });

  it("件数・市区町村名は実データからのみ算出される", () => {
    const shops = shopsOf("福岡県");
    const cities = countShopsByCity(shops);
    const total = cities.reduce((a, c) => a + c.count, 0);
    expect(total).toBe(shops.length);
    const title = buildShopAreaTitle({ prefName: "福岡県", shops });
    expect(title).toContain(cities[0].name);
  });
});

describe("店舗詳細 title / description", () => {
  const hamaoka = tackleShops.find((s) => s.slug === "hamaoka-tsurigu-omaezaki");

  it("店名が先頭・市区町村と営業時間が続く", () => {
    expect(hamaoka).toBeDefined();
    const title = buildShopDetailTitle(hamaoka!);
    expect(title.startsWith(`${hamaoka!.name}｜`)).toBe(true);
    expect(title).toContain(extractCity(hamaoka!.address, hamaoka!.region.prefecture));
    expect(cpLength(title)).toBeLessThanOrEqual(SHOP_TITLE_MAX);
    const desc = buildShopDetailDescription(hamaoka!);
    expect(desc.startsWith(`${hamaoka!.name}は静岡県`)).toBe(true);
    expect(desc).toContain("営業時間は");
  });

  it("営業時間が曜日・季節で変わる店はタイトルに時間の実値を載せない", () => {
    const shop = tackleShops.find((s) => s.businessHours.includes(" / "))!;
    const title = buildShopDetailTitle(shop);
    expect(title).not.toMatch(/\d{1,2}:\d{2}/);
    expect(title).toContain("営業時間");
  });

  it("全店舗で title は店名先頭・32字以内（店名単独が32字超の場合を除く）、description は120〜158字", () => {
    for (const shop of tackleShops) {
      const title = buildShopDetailTitle(shop);
      expect(title.startsWith(shop.name), shop.slug).toBe(true);
      if (cpLength(shop.name) <= SHOP_TITLE_MAX) {
        expect(cpLength(title), `${shop.slug}: ${title}`).toBeLessThanOrEqual(SHOP_TITLE_MAX);
      }
      const desc = buildShopDetailDescription(shop);
      expect(desc).not.toContain("undefined");
      expect(cpLength(desc), `${shop.slug}: ${desc}`).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
      expect(cpLength(desc), `${shop.slug}: ${desc}`).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(desc).toContain("営業時間は");
    }
  });
});
