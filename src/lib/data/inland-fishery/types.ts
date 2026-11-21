/**
 * 内水面（河川・湖）の漁業協同組合と、その遊漁規則。
 *
 * 2026-11 「ルール欄が汎用文のまま」対策の第1層。河川・湖のスポットは、
 * どの漁協の漁業権の区域にあるかが分かれば、遊漁券・解禁期間・主な規則が
 * 漁協の公式情報から決まる。スポットごとに推測で書かず、漁協単位で一次情報を持つ。
 *
 * 運用ルール:
 * - 出典は一次情報のみ（漁協の公式サイト・公式SNS、都道府県、内水面漁連、水産庁）。
 *   釣り情報サイト・ブログ・まとめは出典にしない。
 * - 確認できなかった項目は書かない（空のまま）。誤った料金・漁協名は空欄より悪い。
 * - 料金・解禁日は毎年変わる。seasonYear と verifiedAt を必ず入れ、表示では断定せず漁協確認を促す。
 */

export interface SourcedText {
  text: string;
  /** 確認した一次情報の URL */
  source: string;
}

export interface InlandFisheryFee {
  /** 「アユ 日券」「雑魚 年券」など */
  label: string;
  /** 「2,000円」 */
  price: string;
  /** 現場売り加算など */
  note?: string;
  source: string;
}

export interface InlandFisherySeason {
  /** 魚種（「アユ」「アマゴ・イワナ」） */
  fish: string;
  /** 釣りができる期間（「6/1〜12/31」）。禁漁期間ではない */
  period: string;
  source: string;
}

export interface InlandFisheryCoop {
  /** ローマ字の kebab-case（例: "kamogawa"） */
  id: string;
  /** 正式名称（例: "賀茂川漁業協同組合"） */
  name: string;
  /** 通称（例: "賀茂川漁協"） */
  shortName: string;
  prefecture: string;
  /** 他県知事の免許だが、この県の水域にも区域がある場合（例: 群馬県の神流川漁協が埼玉県側の神流湖も管轄） */
  alsoCovers?: string[];
  /** 公式サイト（無ければ県の漁協一覧など、連絡先が分かる一次情報） */
  officialUrl: string;
  /** 管轄区域（出典の表現を要約） */
  jurisdiction: SourcedText;
  fees: InlandFisheryFee[];
  seasons: InlandFisherySeason[];
  rules: SourcedText[];
  /** 料金・期間が何年度のものか（「2026」） */
  seasonYear: string;
  /** 確認日 YYYY-MM-DD */
  verifiedAt: string;
}

/** スポット → 漁協の対応。区間で漁協が分かれる川は、スポットの位置で決める */
export type InlandFisherySpotLink =
  | {
      coopId: string;
      /** なぜこの漁協の区域と言えるか（一次情報の URL つき） */
      evidence: SourcedText;
      /** 区域の境目に近い等、利用者に伝えるべき注意 */
      note?: string;
    }
  | {
      /** 内水面の漁業権の区域外（海面・漁業権のないダム湖など） */
      outside: true;
      reason: SourcedText;
    };
