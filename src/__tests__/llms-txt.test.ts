import { describe, it, expect } from "vitest";
import { GET as getLlms } from "@/app/llms.txt/route";
import { GET as getLlmsFull } from "@/app/llms-full.txt/route";
import { GET as getPrefFile, generateStaticParams } from "@/app/llms/[file]/route";
import { fishingSpots } from "@/lib/data/spots";

/**
 * llms.txt 系の回帰テスト（2026-11 見直し）
 * - 件数ハードコード・根拠のない主張・開設年の矛盾を再発させない
 * - llms-full.txt は索引に縮小し、スポット一覧は都道府県別ファイルに分割
 */
describe("llms.txt / llms-full.txt / llms/{pref}.txt", () => {
  it("llms.txt にハードコード件数・根拠のない主張・誤った開設年が無い", async () => {
    const body = await getLlms().text();
    for (const ng of ["18,000", "約10,000", "2024年開設", "専門家ネットワーク", "現地調査", "週次", "最大級", "LocalBusiness"]) {
      expect(body, ng).not.toContain(ng);
    }
    expect(body).toContain("2026年2月");
    expect(body).toContain(fishingSpots.length.toLocaleString());
    expect(body).toContain("https://tsurispot.com/llms/tokyo.txt");
    // MCP / AI連携の案内（エンドポイントと /ai ページ）
    expect(body).toContain("https://tsurispot.com/api/mcp");
    expect(body).toContain("https://tsurispot.com/ai");
  });

  it("llms-full.txt は索引サイズに縮小され、内部実装の説明を含まない", async () => {
    const body = await getLlmsFull().text();
    expect(Buffer.byteLength(body, "utf8")).toBeLessThan(150_000);
    expect(body).not.toContain("JSON-LD");
    expect(body).not.toContain("tsurispot.com/spots/"); // スポット個別URLは県別ファイル側
  });

  it("県別ファイルは全スポットを1行ずつ載せ、未正規化の種別ラベルを出さない", async () => {
    const params = generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(40);
    let lines = 0;
    for (const p of params) {
      const res = await getPrefFile(new Request("https://tsurispot.com"), {
        params: Promise.resolve(p),
      });
      expect(res.status).toBe(200);
      const body = await res.text();
      const spotLines = body.split("\n").filter((l) => l.startsWith("- ") && l.includes("/spots/"));
      lines += spotLines.length;
      for (const l of spotLines) {
        expect(l.split(" | ").length, l).toBe(9);
        expect(l, l).not.toMatch(/\| (surf|pond|lake|port|beach|rocky|river|pier|breakwater) \|/);
      }
    }
    expect(lines).toBe(fishingSpots.length);
  });

  it("存在しない県は 404", async () => {
    const res = await getPrefFile(new Request("https://tsurispot.com"), {
      params: Promise.resolve({ file: "atlantis.txt" }),
    });
    expect(res.status).toBe(404);
  });
});
