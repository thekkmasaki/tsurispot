import { describe, it, expect, vi, beforeEach } from "vitest";

// DynamoDB の Get/Put をメモリで再現し、楽観ロック（ver 条件）の挙動を確かめる
const { store, send } = vi.hoisted(() => ({
  store: new Map<string, Record<string, unknown>>(),
  send: vi.fn(),
}));

vi.mock("@aws-sdk/client-dynamodb", () => ({ DynamoDBClient: vi.fn() }));
vi.mock("@aws-sdk/lib-dynamodb", () => {
  class Cmd {
    constructor(public input: Record<string, unknown>) {}
  }
  class GetCommand extends Cmd {}
  class PutCommand extends Cmd {}
  return {
    DynamoDBDocumentClient: { from: () => ({ send }) },
    GetCommand,
    PutCommand,
    DeleteCommand: Cmd,
    UpdateCommand: Cmd,
    BatchGetCommand: Cmd,
    ScanCommand: Cmd,
    QueryCommand: Cmd,
  };
});

import { dbUpdateList } from "@/lib/dynamodb";

const key = (k: { pk: string; sk: string }) => `${k.pk}|${k.sk}`;
function conditionalFailed() {
  return Object.assign(new Error("cond"), { name: "ConditionalCheckFailedException" });
}

/** 実物の DynamoDB と同じ条件判定をする send */
async function realisticSend(cmd: { constructor: { name: string }; input: Record<string, unknown> }) {
  const input = cmd.input;
  if (cmd.constructor.name === "GetCommand") {
    const item = store.get(key(input.Key as { pk: string; sk: string }));
    return { Item: item ? structuredClone(item) : undefined };
  }
  const item = input.Item as { pk: string; sk: string; ver?: number };
  const cur = store.get(key(item));
  const cond = input.ConditionExpression as string;
  const ok =
    cond === "attribute_not_exists(pk)"
      ? !cur
      : cond === "attribute_not_exists(ver)"
        ? !!cur && cur.ver === undefined
        : !!cur && cur.ver === (input.ExpressionAttributeValues as { ":v": number })[":v"];
  if (!ok) throw conditionalFailed();
  store.set(key(item), structuredClone(item));
  return {};
}

beforeEach(() => {
  store.clear();
  send.mockReset();
  send.mockImplementation(realisticSend);
});

describe("dbUpdateList（楽観ロック付きの配列更新）", () => {
  it("アイテムが無ければ新規作成し ver=1 を付ける", async () => {
    const out = await dbUpdateList<string>("P", "S", (l) => [...l, "a"]);
    expect(out).toEqual(["a"]);
    expect(store.get("P|S")).toMatchObject({ data: ["a"], ver: 1 });
  });

  it("ver の無い既存アイテム（旧データ）も更新でき、以後は ver で守られる", async () => {
    store.set("P|S", { pk: "P", sk: "S", data: ["old"] });
    await dbUpdateList<string>("P", "S", (l) => [...l, "new"]);
    expect(store.get("P|S")).toMatchObject({ data: ["old", "new"], ver: 1 });
  });

  it("mutate が null を返したら書き込まない", async () => {
    store.set("P|S", { pk: "P", sk: "S", data: ["x"], ver: 3 });
    expect(await dbUpdateList<string>("P", "S", () => null)).toBeNull();
    expect(store.get("P|S")).toMatchObject({ data: ["x"], ver: 3 });
  });

  it("読んでから書くまでに他の書き込みが入ったら、読み直して両方の変更を残す", async () => {
    store.set("P|S", { pk: "P", sk: "S", data: ["a"], ver: 1 });
    let injected = false;
    send.mockImplementation(async (cmd) => {
      // 1回目の Put の直前に、別リクエストが "other" を追加したことにする
      if (cmd.constructor.name === "PutCommand" && !injected) {
        injected = true;
        store.set("P|S", { pk: "P", sk: "S", data: ["a", "other"], ver: 2 });
      }
      return realisticSend(cmd);
    });
    const out = await dbUpdateList<string>("P", "S", (l) => [...l, "mine"]);
    expect(out).toEqual(["a", "other", "mine"]);
    expect(store.get("P|S")).toMatchObject({ data: ["a", "other", "mine"], ver: 3 });
  });

  it("競合が続けば maxAttempts 回で諦めて例外を投げる", async () => {
    store.set("P|S", { pk: "P", sk: "S", data: [], ver: 1 });
    send.mockImplementation(async (cmd) => {
      if (cmd.constructor.name === "PutCommand") throw conditionalFailed();
      return realisticSend(cmd);
    });
    await expect(dbUpdateList<string>("P", "S", (l) => [...l, "x"], undefined, 3)).rejects.toThrow("cond");
    expect(send.mock.calls.filter(([c]) => c.constructor.name === "PutCommand")).toHaveLength(3);
  });

  it("TTL を指定すると ttl を付けて保存する", async () => {
    await dbUpdateList<string>("P", "S", () => ["a"], 60);
    expect(typeof store.get("P|S")?.ttl).toBe("number");
  });
});
