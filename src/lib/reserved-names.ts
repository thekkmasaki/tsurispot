// 運営・公式を装うニックネーム/投稿者名を禁止するための判定。
// NFKC正規化 + 小文字化 + 空白/記号除去した上で部分一致で判定する（全角・装飾でのすり抜け対策）。

const RESERVED_FRAGMENTS = [
  "運営",
  "公式",
  "管理人",
  "管理者",
  "事務局",
  "スタッフ",
  "サポート",
  "編集部",
  "編集長",
  "ツリスポ",
  "つりすぽ",
  "tsurispot",
  "tsuri-spot",
  "admin",
  "administrator",
  "moderator",
  "official",
  "staff",
  "support",
  "system",
  "正木家康",
];

function normalizeForReserved(raw: string): string {
  return raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s​-‍﻿_\-.・･·'"`~!@#$%^&*()+=\[\]{}|\\/:;<>,?]/g, "");
}

export function isReservedName(raw: string): boolean {
  const norm = normalizeForReserved(raw);
  if (!norm) return false;
  return RESERVED_FRAGMENTS.some((f) => norm.includes(normalizeForReserved(f)));
}

export const RESERVED_NAME_ERROR = "このニックネームは使用できません（運営・公式を連想させる名称は禁止されています）";
