/**
 * /api/admin/official-reply の認可・バリデーション回帰テスト。
 * DynamoDB に触る前段（認可・入力検証）だけを検証する（DB 実呼び出しなし）。
 */
import { describe, it, expect, beforeAll } from "vitest";

let POST: (req: Request) => Promise<Response>;

beforeAll(async () => {
  process.env.ADMIN_SECRET = "test-admin-secret";
  ({ POST } = await import("@/app/api/admin/official-reply/route"));
});

function makeRequest(body: unknown, token?: string): Request {
  return new Request("http://localhost/api/admin/official-reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/official-reply", () => {
  it("Authorizationヘッダなしは401", async () => {
    const res = await POST(makeRequest({ reportId: "x", text: "y" }));
    expect(res.status).toBe(401);
  });

  it("トークン不一致は401", async () => {
    const res = await POST(makeRequest({ reportId: "x", text: "y" }, "wrong-token"));
    expect(res.status).toBe(401);
  });

  it("reportId欠落は400", async () => {
    const res = await POST(makeRequest({ text: "y" }, "test-admin-secret"));
    expect(res.status).toBe(400);
  });

  it("text欠落は400", async () => {
    const res = await POST(makeRequest({ reportId: "x" }, "test-admin-secret"));
    expect(res.status).toBe(400);
  });

  it("text 500文字超は400", async () => {
    const res = await POST(
      makeRequest({ reportId: "x", text: "あ".repeat(501) }, "test-admin-secret"),
    );
    expect(res.status).toBe(400);
  });
});
