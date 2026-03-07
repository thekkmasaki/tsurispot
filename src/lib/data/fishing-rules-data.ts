/**
 * 都道府県別の釣りルール・規制データ
 */

export interface SeaFishingRules {
  /** タコ・貝類等の漁業権に関する注意 */
  fishingRightsNotes: string[];
  /** 撒き餌（コマセ）規制 */
  chumRegulation?: string;
  /** 海面の禁漁期間 */
  closedSeasons: { fish: string; period: string; note?: string }[];
  /** 海面のサイズ制限 */
  sizeLimits: { fish: string; minSize: string }[];
  /** 釣り方の規制（投げ釣り・ルアー等） */
  methodRestrictions: string[];
  /** 釣り禁止・注意区域 */
  restrictedAreas: string[];
  /** その他の海面ルール */
  otherNotes: string[];
}

export interface PrefectureFishingRule {
  prefSlug: string;
  prefName: string;
  /** 遊漁券が必要な主な河川 */
  yugyokenRivers: string[];
  /** 主な禁漁期間情報（内水面） */
  closedSeasons: { fish: string; period: string; note?: string }[];
  /** サイズ制限（内水面） */
  sizeLimits: { fish: string; minSize: string }[];
  /** 特記事項 */
  specialNotes: string[];
  /** 内水面漁業調整規則の管轄機関 */
  authority: string;
  /** 参考情報（公式リンクのテキスト説明） */
  referenceText: string;
  /** 海面の釣りルール */
  seaRules?: SeaFishingRules;
}

/**
 * 共通ルール（全国共通）
 */
export const COMMON_RULES = {
  fishingRights: "漁業権の対象となる貝類・海藻（アワビ、サザエ、ウニ、ナマコ、ワカメ等）の採取は全国的に禁止されています。",
  closedSeason: "渓流魚（ヤマメ、イワナ等）は多くの地域で10月〜翌2月頃が禁漁期間です。アユは概ね10月〜翌5月頃が禁漁です。",
  yugyoken: "河川での釣り（特に淡水域）では遊漁券（入漁券）の購入が必要な場合があります。各漁協に確認してください。",
  sizeLimit: "小さすぎる魚はリリースしましょう。地域の漁業調整規則で定められたサイズ制限がある場合はそちらを優先してください。",
  penalty: "漁業権を侵害した場合、20万円以下の罰金が科される可能性があります（漁業法第195条）。",
};

/**
 * 都道府県別データ
 * 最低限の共通情報 + 都道府県固有の特記事項
 */
export const prefectureFishingRules: PrefectureFishingRule[] = [
  {
    prefSlug: "hokkaido",
    prefName: "北海道",
    yugyokenRivers: ["石狩川", "十勝川", "天塩川", "釧路川", "尻別川"],
    closedSeasons: [
      { fish: "サケ・マス", period: "河川での釣りは原則禁止（一部区間で期間限定許可）", note: "サケは河川での採捕が原則禁止。海でのサケ釣りは地域により可。" },
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌3月31日", note: "河川により異なる場合あり" },
      { fish: "アユ", period: "9月〜翌6月（河川による）" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
      { fish: "イワナ", minSize: "15cm" },
    ],
    specialNotes: [
      "北海道ではサケの河川での採捕は原則禁止です。海面でのサケ釣りは一部地域で許可されています。",
      "ヒグマの出没に注意。特に渓流釣りの際は熊鈴や熊スプレーを携帯しましょう。",
      "冬季は結氷する湖沼でのワカサギ釣りが人気ですが、氷の厚さを必ず確認してください。",
    ],
    authority: "北海道",
    referenceText: "北海道の内水面漁業調整規則は北海道庁のウェブサイトで確認できます。",
    seaRules: {
      fishingRightsNotes: [
        "ケガニ（毛ガニ）は全道で漁業権の対象。遊漁者の採捕は禁止されています。",
        "ウニ・アワビ・ナマコは漁業権の対象。採取すると密漁になります。",
        "昆布・ワカメ等の海藻類も漁業権の対象地域が多く、採取は禁止です。",
        "タコは一部海域で漁業権が設定されています。事前に確認してください。",
      ],
      closedSeasons: [
        { fish: "サケ", period: "河口から一定距離（概ね500m〜1km）は周年採捕禁止", note: "河口規制。海面でのサケ釣りは地域・時期により可能な場合あり。" },
        { fish: "ケガニ", period: "周年（遊漁者は採捕禁止）", note: "漁業者のみ許可期間に採捕可能" },
      ],
      sizeLimits: [
        { fish: "ヒラメ", minSize: "35cm" },
        { fish: "マガレイ", minSize: "15cm" },
        { fish: "クロソイ", minSize: "20cm" },
      ],
      methodRestrictions: [
        "サケの引っ掛け釣り（スレ掛け）は禁止されています。",
        "河口付近でのサケ・マス釣りは、地域ごとに規制区域が設定されています。",
      ],
      restrictedAreas: [
        "各河川の河口付近は「さけ・ます河口規制」により採捕禁止区域が設定されています。",
        "漁港内の作業区域は立入禁止の場合があります。漁業者の指示に従ってください。",
        "積丹半島の一部磯場は漁業権区域のため、ウニ・アワビの採取は厳禁です。",
      ],
      otherNotes: [
        "冬季の防波堤は積雪・凍結で滑りやすく、落水事故が多発しています。ライフジャケット必須。",
        "ヒグマが海岸にも出没することがあります。特にサケの遡上時期は注意してください。",
        "北海道では釣り場のゴミ問題が深刻化しています。ゴミは必ず持ち帰りましょう。",
      ],
    },
  },
  {
    prefSlug: "aomori",
    prefName: "青森県",
    yugyokenRivers: ["奥入瀬川", "岩木川", "馬淵川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "十和田湖ではヒメマス釣りが有名。遊漁券が必要です。",
      "陸奥湾でのホタテ養殖エリアでの釣りは制限されています。",
    ],
    authority: "青森県",
    referenceText: "青森県の内水面漁業調整規則は青森県庁のウェブサイトで確認できます。",
    seaRules: {
      fishingRightsNotes: [
        "ナマコは全域で漁業権の対象。遊漁者の採取は禁止されています。",
        "アワビ・ウニも漁業権の対象地域が多く、採取は密漁となります。",
        "陸奥湾のホタテ・ホヤは養殖漁業権が設定されています。養殖施設周辺での釣りは避けてください。",
        "昆布・ワカメ等の海藻類の採取も禁止区域があります。",
      ],
      closedSeasons: [
        { fish: "ヒラメ", period: "地域により禁漁期間あり", note: "資源保護のため" },
      ],
      sizeLimits: [
        { fish: "ヒラメ", minSize: "30cm" },
      ],
      methodRestrictions: [
        "陸奥湾内の養殖施設付近での投げ釣りは、養殖ロープに絡まる恐れがあるため自粛が求められています。",
      ],
      restrictedAreas: [
        "大間崎周辺は漁業者のマグロ漁が盛んなエリア。遊漁船の航行ルールを守ってください。",
        "陸奥湾のホタテ養殖区域は船釣りでの進入が制限されています。",
        "八戸港の一部区域は立入禁止です。",
      ],
      otherNotes: [
        "日本海側（深浦・鰺ヶ沢）は冬季の荒波に注意。防波堤からの高波被害が発生しています。",
        "津軽海峡は潮流が速いため、船釣りでは十分な装備と経験が必要です。",
        "釣り場のゴミ問題が深刻です。ゴミは必ず持ち帰りましょう。",
      ],
    },
  },
  {
    prefSlug: "iwate",
    prefName: "岩手県",
    yugyokenRivers: ["北上川", "閉伊川", "気仙川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "三陸海岸での釣りは複雑な岩場が多いため、安全装備を必ず着用しましょう。",
      "内水面でのサクラマス釣りは遊漁券が必要です。",
    ],
    authority: "岩手県",
    referenceText: "岩手県の内水面漁業調整規則は岩手県庁のウェブサイトで確認できます。",
    seaRules: {
      fishingRightsNotes: [
        "アワビ・ウニは三陸沿岸全域で漁業権の対象。採取は密漁となります。",
        "ナマコの採取も禁止されています。高値で取引されるため密漁の取り締まりが強化されています。",
        "ワカメ・昆布等の海藻類も漁業権の対象。採取は厳禁です。",
        "三陸沿岸の磯場は広範囲に漁業権区域が設定されています。貝類・海藻の採取はしないでください。",
      ],
      closedSeasons: [],
      sizeLimits: [
        { fish: "ヒラメ", minSize: "30cm" },
      ],
      methodRestrictions: [
        "漁港内での投げ釣りは漁業作業の妨げになるため、禁止・自粛が求められている場所があります。",
      ],
      restrictedAreas: [
        "宮古港・釜石港・大船渡港の一部区域は立入禁止です。",
        "三陸沿岸の養殖施設（ワカメ・カキ・ホタテ等）周辺は釣り禁止の場合があります。",
        "震災復旧工事中のエリアは引き続き立入禁止の場所があります。事前に確認してください。",
      ],
      otherNotes: [
        "三陸海岸はリアス式海岸で足場が悪い磯場が多いです。磯靴・ライフジャケットを必ず着用してください。",
        "秋〜冬の三陸沿岸は急な時化に注意。天候の急変に備えましょう。",
        "釣り場周辺の漁具（カゴ・ロープ等）には絶対に触れないでください。",
      ],
    },
  },
  {
    prefSlug: "miyagi",
    prefName: "宮城県",
    yugyokenRivers: ["広瀬川", "名取川", "北上川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "松島湾周辺は漁業権設定区域が多いため、貝類の採取は厳禁です。",
      "仙台湾でのハゼ釣りは秋のシーズンが特に人気。",
    ],
    authority: "宮城県",
    referenceText: "宮城県の内水面漁業調整規則は宮城県庁のウェブサイトで確認できます。",
    seaRules: {
      fishingRightsNotes: [
        "カキ・ワカメ・ノリは養殖漁業権が設定されています。養殖施設に近づかないでください。",
        "アワビ・ウニ・ナマコは漁業権の対象。採取は密漁となります。",
        "ホヤも養殖漁業権の対象地域があります。",
        "松島湾内はほぼ全域に漁業権が設定されています。貝類・海藻の採取は厳禁です。",
      ],
      closedSeasons: [],
      sizeLimits: [
        { fish: "ヒラメ", minSize: "30cm" },
      ],
      methodRestrictions: [
        "松島湾内の養殖施設付近での投げ釣りは禁止されています。",
      ],
      restrictedAreas: [
        "松島湾内は釣り禁止区域が複数設定されています。現地の看板を確認してください。",
        "塩釜港・石巻港の一部区域は関係者以外立入禁止です。",
        "養殖筏周辺（特にカキ・ワカメ養殖エリア）は船釣りでの進入が制限されています。",
      ],
      otherNotes: [
        "仙台湾のハゼ釣りは秋が最盛期。投げ釣りで気軽に楽しめます。",
        "三陸沿岸は複雑な地形のため、磯場では足元に注意してください。",
        "冬季の金華山沖は荒天になりやすいです。船釣りは天候を十分確認してから出港してください。",
      ],
    },
  },
  {
    prefSlug: "akita",
    prefName: "秋田県",
    yugyokenRivers: ["雄物川", "米代川", "子吉川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
      { fish: "サクラマス", period: "河川により制限あり" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "田沢湖ではクニマスの保護のため、釣りに制限がある場合があります。",
      "男鹿半島では磯釣りが盛んですが、荒天時は波浪に注意。",
    ],
    authority: "秋田県",
    referenceText: "秋田県の内水面漁業調整規則は秋田県庁のウェブサイトで確認できます。",
    seaRules: {
      fishingRightsNotes: [
        "タコは一部海域で漁業権が設定されています。タコ釣りの可否を事前に確認してください。",
        "アワビ・サザエ・ウニは漁業権の対象。採取は密漁となります。",
        "ワカメ・昆布等の海藻類も漁業権区域があります。",
      ],
      closedSeasons: [
        { fish: "ハタハタ", period: "産卵期（12月頃）に規制あり", note: "秋田県の県魚。産卵保護のため地域ごとに規制が設けられています。" },
      ],
      sizeLimits: [
        { fish: "ヒラメ", minSize: "30cm" },
      ],
      methodRestrictions: [
        "男鹿半島の一部磯場では、漁業者との共存のため釣り方に制限がある場合があります。",
      ],
      restrictedAreas: [
        "秋田港・船川港の一部区域は立入禁止です。",
        "男鹿半島の入道崎周辺は断崖絶壁のため、安全上立入りが制限されている磯場があります。",
      ],
      otherNotes: [
        "ハタハタの接岸シーズン（12月前後）は沿岸が大変混雑します。マナーを守って釣りを楽しんでください。",
        "冬季の日本海は荒天が多く、高波に注意が必要です。天気予報を必ず確認してください。",
        "男鹿半島は磯釣りの好ポイントが多数ありますが、滑りやすい岩場が多いため磯靴を着用してください。",
      ],
    },
  },
  {
    prefSlug: "yamagata",
    prefName: "山形県",
    yugyokenRivers: ["最上川", "赤川", "寒河江川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "最上川は東北有数のアユ釣り河川。遊漁券の購入を忘れずに。",
      "庄内地方の海岸での釣りは、冬季の日本海の荒波に注意してください。",
    ],
    authority: "山形県",
    referenceText: "山形県の内水面漁業調整規則は山形県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "fukushima",
    prefName: "福島県",
    yugyokenRivers: ["阿武隈川", "只見川", "久慈川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "桧原湖・猪苗代湖でのワカサギ釣り・バス釣りが人気。",
      "一部河川では放射性物質検査の結果に基づく出荷制限・採捕自粛がある場合があります。最新情報を確認してください。",
    ],
    authority: "福島県",
    referenceText: "福島県の内水面漁業調整規則は福島県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "ibaraki",
    prefName: "茨城県",
    yugyokenRivers: ["那珂川", "久慈川", "利根川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "那珂川は関東有数のアユ釣り河川です。",
      "大洗海岸・鹿島灘は波が高いことがあるため、サーフでの釣りは安全に注意。",
      "霞ヶ浦でのバス釣りは人気ですが、リリース禁止条例があります。",
    ],
    authority: "茨城県",
    referenceText: "茨城県の内水面漁業調整規則は茨城県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "tochigi",
    prefName: "栃木県",
    yugyokenRivers: ["鬼怒川", "那珂川", "渡良瀬川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "内陸県のため海釣りはできませんが、渓流釣り・川釣りが盛んです。",
      "中禅寺湖ではマス類の釣りが楽しめます。特別な遊漁規則があります。",
    ],
    authority: "栃木県",
    referenceText: "栃木県の内水面漁業調整規則は栃木県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "gunma",
    prefName: "群馬県",
    yugyokenRivers: ["利根川", "渡良瀬川", "吾妻川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "内陸県のため海釣りはできませんが、利根川水系の渓流釣りが有名。",
      "榛名湖でのワカサギ釣り（冬季）やバス釣りが人気。",
    ],
    authority: "群馬県",
    referenceText: "群馬県の内水面漁業調整規則は群馬県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "saitama",
    prefName: "埼玉県",
    yugyokenRivers: ["荒川", "入間川", "秩父の渓流"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "内陸県のため海釣りはできませんが、荒川・秩父エリアの渓流釣りが楽しめます。",
      "荒川水系のバス釣りが人気。一部河川ではリリース禁止の場合あり。",
    ],
    authority: "埼玉県",
    referenceText: "埼玉県の内水面漁業調整規則は埼玉県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "chiba",
    prefName: "千葉県",
    yugyokenRivers: ["養老川", "小櫃川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヒラメ", minSize: "30cm" },
    ],
    specialNotes: [
      "千葉県は外房・内房・東京湾と多彩な海釣りスポットがあります。",
      "九十九里浜でのサーフ釣りは離岸流に注意してください。",
      "アワビ・サザエの採取は漁業権侵害で厳しく取り締まられています。",
    ],
    authority: "千葉県",
    referenceText: "千葉県の漁業調整規則は千葉県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "tokyo",
    prefName: "東京都",
    yugyokenRivers: ["多摩川", "秋川", "日原川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "東京湾では多くの釣り公園（若洲海浜公園など）が無料で利用できます。",
      "多摩川での釣りには遊漁券が必要な区間があります。",
      "伊豆諸島・小笠原諸島では離島特有のルールがあるため、事前確認が必要。",
    ],
    authority: "東京都",
    referenceText: "東京都の内水面漁業調整規則は東京都庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "kanagawa",
    prefName: "神奈川県",
    yugyokenRivers: ["相模川", "酒匂川", "早川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "相模湾はカツオ・マグロの釣りで有名。遊漁船の利用が一般的。",
      "芦ノ湖ではトラウト釣りが人気。特別な遊漁規則があります。",
      "三浦半島の磯場はアクセスしやすく、人気の釣り場が多い。",
    ],
    authority: "神奈川県",
    referenceText: "神奈川県の漁業調整規則は神奈川県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "niigata",
    prefName: "新潟県",
    yugyokenRivers: ["信濃川", "阿賀野川", "三面川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
      { fish: "サケ", period: "河川での採捕は原則禁止" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "三面川のサケの遡上時期は河口付近での釣りが制限されます。",
      "佐渡島での磯釣りは絶好のポイントが多数ありますが、渡船の利用が必要な場合も。",
    ],
    authority: "新潟県",
    referenceText: "新潟県の漁業調整規則は新潟県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "toyama",
    prefName: "富山県",
    yugyokenRivers: ["神通川", "庄川", "黒部川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "富山湾はホタルイカの名所。漁業権に注意。",
      "神通川はアユ釣りの名所として全国的に有名。",
    ],
    authority: "富山県",
    referenceText: "富山県の漁業調整規則は富山県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "ishikawa",
    prefName: "石川県",
    yugyokenRivers: ["手取川", "犀川", "浅野川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "能登半島は全国有数の磯釣りスポット。アクセスの悪い場所もあるため安全対策を。",
      "手取川はサクラマス・アユの名川。遊漁券が必要です。",
    ],
    authority: "石川県",
    referenceText: "石川県の漁業調整規則は石川県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "fukui",
    prefName: "福井県",
    yugyokenRivers: ["九頭竜川", "足羽川", "日野川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "九頭竜川は日本屈指のアユ釣り河川。全国から釣り人が集まります。",
      "越前海岸はエギングの好スポット。秋のアオリイカシーズンが特に人気。",
    ],
    authority: "福井県",
    referenceText: "福井県の漁業調整規則は福井県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "yamanashi",
    prefName: "山梨県",
    yugyokenRivers: ["富士川", "桂川", "笛吹川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "内陸県のため海釣りはできませんが、渓流釣りの名所が多数。",
      "山中湖・河口湖でのバス釣り・ワカサギ釣りが人気。",
    ],
    authority: "山梨県",
    referenceText: "山梨県の内水面漁業調整規則は山梨県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "nagano",
    prefName: "長野県",
    yugyokenRivers: ["千曲川", "犀川", "天竜川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
      { fish: "イワナ", minSize: "15cm" },
    ],
    specialNotes: [
      "内陸県のため海釣りはできませんが、日本屈指の渓流釣りエリア。",
      "諏訪湖でのワカサギ釣りは冬の風物詩。",
      "木曽川・千曲川水系は遊漁券が必要な区間が多い。",
    ],
    authority: "長野県",
    referenceText: "長野県の内水面漁業調整規則は長野県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "gifu",
    prefName: "岐阜県",
    yugyokenRivers: ["長良川", "揖斐川", "飛騨川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "内陸県のため海釣りはできませんが、長良川は日本三大清流の一つでアユ釣りの聖地。",
      "長良川の鵜飼い期間中は一部区間で釣りが制限される場合があります。",
    ],
    authority: "岐阜県",
    referenceText: "岐阜県の内水面漁業調整規則は岐阜県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "shizuoka",
    prefName: "静岡県",
    yugyokenRivers: ["狩野川", "天竜川", "大井川", "安倍川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "ヤマメ", minSize: "15cm" },
    ],
    specialNotes: [
      "駿河湾は深海魚釣りのメッカ。タチウオやアカムツなどの深場の魚が狙えます。",
      "伊豆半島は磯釣り・堤防釣りの人気スポットが集中。",
      "狩野川はアユ釣りの名所として全国的に知られています。",
    ],
    authority: "静岡県",
    referenceText: "静岡県の漁業調整規則は静岡県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "aichi",
    prefName: "愛知県",
    yugyokenRivers: ["木曽川", "矢作川", "豊川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "三河湾・伊勢湾はハゼ・クロダイ釣りが盛んです。",
      "知多半島は堤防釣り・サビキ釣りの好スポットが多い。",
      "木曽川河口はシーバス釣りの人気ポイント。",
    ],
    authority: "愛知県",
    referenceText: "愛知県の漁業調整規則は愛知県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "mie",
    prefName: "三重県",
    yugyokenRivers: ["宮川", "櫛田川", "雲出川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [
      { fish: "イセエビ", minSize: "採取禁止（漁業権対象）" },
    ],
    specialNotes: [
      "三重県はイセエビの名産地ですが、一般の採取は厳禁です。",
      "志摩半島・紀伊半島は磯釣りの好ポイントが多数。",
      "宮川はアユ釣り・渓流釣りの名所。",
    ],
    authority: "三重県",
    referenceText: "三重県の漁業調整規則は三重県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "shiga",
    prefName: "滋賀県",
    yugyokenRivers: ["琵琶湖及び流入河川全般"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "内陸県のため海釣りはできませんが、琵琶湖は日本最大の湖で多彩な魚が釣れます。",
      "琵琶湖ではブラックバスのリリース禁止条例があります（外来魚回収BOXに入れる）。",
      "ビワマス釣りは許可が必要な場合があります。",
    ],
    authority: "滋賀県",
    referenceText: "滋賀県の内水面漁業調整規則は滋賀県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "kyoto",
    prefName: "京都府",
    yugyokenRivers: ["鴨川", "由良川", "桂川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "京都は日本海側と内陸部で釣り環境が大きく異なります。",
      "舞鶴・宮津方面は日本海での釣りが楽しめます。",
      "鴨川での釣りは一部区間で制限があります。",
    ],
    authority: "京都府",
    referenceText: "京都府の漁業調整規則は京都府庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "osaka",
    prefName: "大阪府",
    yugyokenRivers: ["淀川", "大和川"],
    closedSeasons: [
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "大阪湾沿岸は堤防釣り・サビキ釣りの好スポットが多く、アクセスも良好。",
      "南港・泉南地域はタチウオ釣りの人気スポット。",
      "淀川でのシーバス釣りは全国的に有名。",
    ],
    authority: "大阪府",
    referenceText: "大阪府の漁業調整規則は大阪府庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "hyogo",
    prefName: "兵庫県",
    yugyokenRivers: ["加古川", "揖保川", "円山川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "兵庫県は瀬戸内海と日本海の両方に面しており、多彩な釣りが楽しめます。",
      "明石海峡周辺はタイ釣りの名所。",
      "淡路島は四方を海に囲まれ、年間を通じて釣りが楽しめます。",
    ],
    authority: "兵庫県",
    referenceText: "兵庫県の漁業調整規則は兵庫県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "nara",
    prefName: "奈良県",
    yugyokenRivers: ["吉野川", "大和川上流"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "内陸県のため海釣りはできませんが、吉野川（紀ノ川上流）でのアユ釣りが有名。",
      "渓流釣りは十津川・天川エリアが人気。",
    ],
    authority: "奈良県",
    referenceText: "奈良県の内水面漁業調整規則は奈良県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "wakayama",
    prefName: "和歌山県",
    yugyokenRivers: ["紀ノ川", "日高川", "古座川", "熊野川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "和歌山県は磯釣り・エギングの聖地として全国的に有名。",
      "串本・白浜エリアはグレ・イシダイの好ポイント。",
      "古座川はアユの名川として知られています。",
    ],
    authority: "和歌山県",
    referenceText: "和歌山県の漁業調整規則は和歌山県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "tottori",
    prefName: "鳥取県",
    yugyokenRivers: ["千代川", "天神川", "日野川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "鳥取砂丘周辺でのキス釣り（投げ釣り）が人気。",
      "境港周辺はアジ・サバのサビキ釣りが好調。",
    ],
    authority: "鳥取県",
    referenceText: "鳥取県の漁業調整規則は鳥取県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "shimane",
    prefName: "島根県",
    yugyokenRivers: ["斐伊川", "高津川", "江の川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "高津川は日本有数の清流でアユ釣りの名所。",
      "宍道湖・中海でのシーバス釣りが人気。",
      "隠岐諸島は大型の磯魚が狙える穴場的存在。",
    ],
    authority: "島根県",
    referenceText: "島根県の漁業調整規則は島根県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "okayama",
    prefName: "岡山県",
    yugyokenRivers: ["旭川", "高梁川", "吉井川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "児島湾・倉敷水域はチヌ（クロダイ）釣りの好ポイント。",
      "下津井瀬戸周辺は潮通しが良く、多彩な魚種が狙えます。",
    ],
    authority: "岡山県",
    referenceText: "岡山県の漁業調整規則は岡山県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "hiroshima",
    prefName: "広島県",
    yugyokenRivers: ["太田川", "芦田川", "江の川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "瀬戸内海の島々周辺は多彩な釣りが楽しめます。",
      "カキ養殖エリアでの釣りは制限される場合があります。",
      "太田川でのアユ釣りは広島市内からもアクセス良好。",
    ],
    authority: "広島県",
    referenceText: "広島県の漁業調整規則は広島県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "yamaguchi",
    prefName: "山口県",
    yugyokenRivers: ["錦川", "佐波川", "阿武川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "山口県は日本海・瀬戸内海・関門海峡と三方を海に囲まれ、釣りの名所が豊富。",
      "下関周辺はフグ釣りで有名。",
      "角島周辺は透明度の高い海で釣りが楽しめます。",
    ],
    authority: "山口県",
    referenceText: "山口県の漁業調整規則は山口県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "tokushima",
    prefName: "徳島県",
    yugyokenRivers: ["吉野川", "那賀川", "勝浦川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "吉野川は四国最大の河川でアユ釣りの名所。",
      "鳴門海峡周辺はタイ・アジ釣りの好ポイント。",
      "南部の海岸線は磯釣りに適したポイントが多い。",
    ],
    authority: "徳島県",
    referenceText: "徳島県の漁業調整規則は徳島県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "kagawa",
    prefName: "香川県",
    yugyokenRivers: ["土器川", "綾川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "瀬戸内海に面し、穏やかな海で堤防釣りが楽しめます。",
      "小豆島周辺はタイやメバルの好ポイント。",
    ],
    authority: "香川県",
    referenceText: "香川県の漁業調整規則は香川県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "ehime",
    prefName: "愛媛県",
    yugyokenRivers: ["肱川", "仁淀川上流", "重信川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "宇和海は養殖が盛んなエリア。養殖筏周辺での釣りには注意が必要。",
      "しまなみ海道の橋脚周辺は潮通しが良く、大型魚が狙えます。",
    ],
    authority: "愛媛県",
    referenceText: "愛媛県の漁業調整規則は愛媛県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "kochi",
    prefName: "高知県",
    yugyokenRivers: ["四万十川", "仁淀川", "物部川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "四万十川は「日本最後の清流」として有名。アユ釣りの聖地です。",
      "仁淀川は「仁淀ブルー」で知られる清流。アユ・アマゴ釣りが人気。",
      "太平洋側の磯場ではグレ・イシダイなどの大物が狙えます。",
    ],
    authority: "高知県",
    referenceText: "高知県の漁業調整規則は高知県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "fukuoka",
    prefName: "福岡県",
    yugyokenRivers: ["筑後川", "遠賀川", "矢部川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "博多湾は都市型の釣りが楽しめるエリア。シーバス・チヌが人気。",
      "筑後川は有明海に注ぐ九州最大の河川。エツ漁期間中は一部制限あり。",
      "玄界灘は潮通し抜群で、大型の回遊魚も狙えます。",
    ],
    authority: "福岡県",
    referenceText: "福岡県の漁業調整規則は福岡県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "saga",
    prefName: "佐賀県",
    yugyokenRivers: ["嘉瀬川", "松浦川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "有明海ではムツゴロウなど独特の生態系がある。漁業権に注意。",
      "玄界灘側は磯釣り・船釣りの好ポイント。",
      "呼子周辺はイカ釣りの名所として全国的に有名。",
    ],
    authority: "佐賀県",
    referenceText: "佐賀県の漁業調整規則は佐賀県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "nagasaki",
    prefName: "長崎県",
    yugyokenRivers: ["本明川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "日本有数の海岸線の長さを誇り、釣りスポットが非常に豊富。",
      "五島列島・壱岐・対馬は磯釣りの聖地。大型のヒラマサ・クエが狙えます。",
      "長崎港周辺でも手軽に釣りが楽しめます。",
    ],
    authority: "長崎県",
    referenceText: "長崎県の漁業調整規則は長崎県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "kumamoto",
    prefName: "熊本県",
    yugyokenRivers: ["球磨川", "白川", "緑川"],
    closedSeasons: [
      { fish: "ヤマメ・イワナ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "球磨川は日本三大急流の一つ。アユ釣りの名所。",
      "天草はエギング・磯釣りの好スポットが多数。",
      "有明海側はハゼ・チヌなどの釣りが楽しめます。",
    ],
    authority: "熊本県",
    referenceText: "熊本県の漁業調整規則は熊本県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "oita",
    prefName: "大分県",
    yugyokenRivers: ["大野川", "大分川", "番匠川"],
    closedSeasons: [
      { fish: "ヤマメ（アマゴ）", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "豊後水道は潮通しが良く、タイ・ブリなどの大物が狙えます。",
      "佐伯・蒲江エリアは磯釣りのメッカ。",
      "別府湾周辺でも手軽な堤防釣りが楽しめます。",
    ],
    authority: "大分県",
    referenceText: "大分県の漁業調整規則は大分県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "miyazaki",
    prefName: "宮崎県",
    yugyokenRivers: ["五ヶ瀬川", "大淀川", "耳川"],
    closedSeasons: [
      { fish: "ヤマメ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "五ヶ瀬川はアユ釣りの名川。毎年全国から釣り人が訪れます。",
      "日南海岸はサーフ釣り・磯釣りの好ポイント。",
      "延岡・日向エリアはショアジギングでブリやカンパチが狙えます。",
    ],
    authority: "宮崎県",
    referenceText: "宮崎県の漁業調整規則は宮崎県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "kagoshima",
    prefName: "鹿児島県",
    yugyokenRivers: ["川内川", "肝属川"],
    closedSeasons: [
      { fish: "ヤマメ", period: "10月1日〜翌2月末日" },
      { fish: "アユ", period: "10月〜翌5月" },
    ],
    sizeLimits: [],
    specialNotes: [
      "鹿児島湾（錦江湾）は独特の地形で多彩な魚種が狙えます。",
      "屋久島・種子島・奄美大島は南国の大型魚が釣れる憧れのフィールド。",
      "桜島周辺でも手軽に堤防釣りが楽しめます。",
    ],
    authority: "鹿児島県",
    referenceText: "鹿児島県の漁業調整規則は鹿児島県庁のウェブサイトで確認できます。",
  },
  {
    prefSlug: "okinawa",
    prefName: "沖縄県",
    yugyokenRivers: [],
    closedSeasons: [],
    sizeLimits: [],
    specialNotes: [
      "沖縄は亜熱帯特有の魚種が多く、本州とは異なる釣りが楽しめます。",
      "サンゴ礁域での釣りは自然保護区域に注意。サンゴを傷つけない釣り方を心がけましょう。",
      "ウミガメの産卵地では特に配慮が必要です。",
      "タマン（ハマフエフキ）やガーラ（カスミアジ）など沖縄特有のターゲットが人気。",
    ],
    authority: "沖縄県",
    referenceText: "沖縄県の漁業調整規則は沖縄県庁のウェブサイトで確認できます。",
  },
];

export function getFishingRuleByPrefSlug(slug: string): PrefectureFishingRule | undefined {
  return prefectureFishingRules.find((r) => r.prefSlug === slug);
}
