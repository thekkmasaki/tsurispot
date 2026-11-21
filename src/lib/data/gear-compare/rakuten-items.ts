// このファイルは scripts/gear/fetch-rakuten-items.mjs が生成する。手で編集しない。
// キー = GearModel.id。未取得の機種はキーなし（ページ側は楽天・Amazonの検索リンクで代替する）。
import type { RakutenItem } from "./types";

export const RAKUTEN_ITEMS: Record<string, RakutenItem> = {};
