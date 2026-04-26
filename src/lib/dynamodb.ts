import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE = "tsurispot";

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

/** TTL epoch秒を計算 */
function ttlEpoch(seconds: number): number {
  return Math.floor(Date.now() / 1000) + seconds;
}

/** アイテム取得 */
export async function dbGet<T = unknown>(pk: string, sk: string): Promise<T | null> {
  const res = await doc.send(new GetCommand({ TableName: TABLE, Key: { pk, sk } }));
  return (res.Item?.data as T) ?? null;
}

/** アイテム保存 */
export async function dbPut(
  pk: string,
  sk: string,
  data: unknown,
  ttlSeconds?: number,
): Promise<void> {
  const item: Record<string, unknown> = { pk, sk, data };
  if (ttlSeconds) item.ttl = ttlEpoch(ttlSeconds);
  await doc.send(new PutCommand({ TableName: TABLE, Item: item }));
}

/** アイテム削除 */
export async function dbDelete(pk: string, sk: string): Promise<void> {
  await doc.send(new DeleteCommand({ TableName: TABLE, Key: { pk, sk } }));
}

/** カウンターをインクリメント（存在しなければ0から開始） */
export async function dbIncr(
  pk: string,
  sk: string,
  amount = 1,
  ttlSeconds?: number,
): Promise<number> {
  const updateExpr = ttlSeconds
    ? "SET #d = if_not_exists(#d, :zero) + :inc, #t = if_not_exists(#t, :ttl)"
    : "SET #d = if_not_exists(#d, :zero) + :inc";
  const names: Record<string, string> = { "#d": "data" };
  const values: Record<string, number> = { ":zero": 0, ":inc": amount };
  if (ttlSeconds) {
    names["#t"] = "ttl";
    values[":ttl"] = ttlEpoch(ttlSeconds);
  }
  const res = await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { pk, sk },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "UPDATED_NEW",
    }),
  );
  return (res.Attributes?.data as number) ?? amount;
}

/** カウンターをデクリメント（0未満にはしない） */
export async function dbDecr(pk: string, sk: string, amount = 1): Promise<number> {
  const res = await doc.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { pk, sk },
      UpdateExpression: "SET #d = if_not_exists(#d, :zero) - :dec",
      ConditionExpression: "attribute_not_exists(#d) OR #d > :zero",
      ExpressionAttributeNames: { "#d": "data" },
      ExpressionAttributeValues: { ":zero": 0, ":dec": amount },
      ReturnValues: "UPDATED_NEW",
    }),
  );
  return Math.max(0, (res.Attributes?.data as number) ?? 0);
}

/** アイテムの存在チェック */
export async function dbExists(pk: string, sk: string): Promise<boolean> {
  const res = await doc.send(
    new GetCommand({
      TableName: TABLE,
      Key: { pk, sk },
      ProjectionExpression: "pk",
    }),
  );
  return !!res.Item;
}

/** 複数アイテムを一括取得（最大100件） */
export async function dbBatchGet<T = unknown>(
  keys: { pk: string; sk: string }[],
): Promise<(T | null)[]> {
  if (keys.length === 0) return [];

  // DynamoDB BatchGetは100件制限
  const chunks: { pk: string; sk: string }[][] = [];
  for (let i = 0; i < keys.length; i += 100) {
    chunks.push(keys.slice(i, i + 100));
  }

  const resultMap = new Map<string, T>();

  for (const chunk of chunks) {
    const res = await doc.send(
      new BatchGetCommand({
        RequestItems: {
          [TABLE]: { Keys: chunk.map((k) => ({ pk: k.pk, sk: k.sk })) },
        },
      }),
    );
    const items = res.Responses?.[TABLE] ?? [];
    for (const item of items) {
      resultMap.set(`${item.pk}#${item.sk}`, item.data as T);
    }
  }

  return keys.map((k) => resultMap.get(`${k.pk}#${k.sk}`) ?? null);
}
