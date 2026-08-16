/**
 * 釣果投稿の fishName を魚種単位に分割する。
 *
 * 投稿フォームは「例: アジ、サバ」と複数記入を推奨している（catch-report-form.tsx の
 * placeholder）が、保存は入力文字列のまま（例: "アジ,サバ"）。集計側が分割しないと
 * 「アジ,サバ」が独立した魚種として自己ベスト・魚種数・図鑑に現れてしまうため、
 * 魚種キーが必要な箇所は必ずこれを通す。保存データ自体は変更しない（表示は書いたまま）。
 *
 * 区切り: 全角読点・半角カンマ・中黒・スラッシュ（全魚種名に不使用であることを確認済み）
 */
export function splitFishNames(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/[、,・／/]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}
