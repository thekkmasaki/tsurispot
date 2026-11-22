/**
 * 一部の区域・時間帯・釣法だけが禁止されているスポットの「禁止の条件」（2026-11 監査）。
 * 重複統合後の slug → 条件の文（ルール欄の「釣りが禁止・制限される区域と条件」に表示する）。
 * spots.ts の applyAreaConditions で FishingSpot.restrictedAreaConditions に付与する。
 *
 * 外部監査（2026-11-21 時点）で「部分禁止・条件付きなのに、その条件がルール欄に出ていない」と
 * 指摘されたスポットのうち、fishingBan（一次情報つき）も rules.restrictedAreas も持たないものに付ける。
 * 文は監査の根拠欄（港湾管理者・自治体・漁協の公表）に基づき、根拠側で「スポットが該当するか要確認」と
 * されているものは断定せず、利用者に区域図・現地掲示での確認を促す書き方にとどめる。
 * 規制は変わるため、最終的には現地の掲示と管理者の案内が優先される。
 */

// ── 新潟県：県管理の港・漁港の防波堤（原則立入禁止） ──
const NIIGATA_BREAKWATER =
  "新潟県は、県が管理する港・漁港の防波堤を原則として立入禁止としており、一般に開放しているのは姫津漁港・出雲崎漁港など一部の防波堤（開放期間・時間の指定あり）に限られます。この場所の防波堤・突堤・ふ頭が開放の対象かを県の公表と現地の掲示で確認し、立入禁止の表示がある場所には入らないでください。";

// ── 富山新港（富山県富山新港管理局） ──
const TOYAMA_SHINKO =
  "富山県富山新港管理局は、富山新港で魚釣りができる場所を県が指定した5か所に限っています。指定外の防波堤・護岸・岸壁には立ち入れません。この場所が指定箇所に含まれるかを県の案内と現地の掲示で確認してから釣りをしてください。";

// ── 焼津漁港（静岡県・焼津市） ──
const YAIZU =
  "焼津漁港は、外側の防波堤が立入禁止区域です（静岡県漁港管理条例）。水揚げ・荷降ろしの周辺や漁業者の作業場所でも釣りはできません。焼津漁港で釣りができるのは、親水公園「ふぃしゅーな」のフィッシングゾーンなど開放された場所に限られます。";

// ── 長崎県管理の国際港湾施設 ──
const NAGASAKI =
  "長崎県は、県が管理する港のうち国際航海船舶が利用する港湾施設に制限区域を設け、区域図を公表しています。制限区域（フェンス・ゲートで区切られた岸壁など）は関係者以外立入禁止です。釣りをする場所が制限区域外であることを、県の区域図と現地の表示で確認してください。";

// ── 神戸空港島 親水護岸（神戸市港湾局） ──
const KOBE_AIRPORT =
  "神戸市港湾局は、神戸港の港湾施設（岸壁・護岸）での釣りを禁止しており、港湾施設で釣りができるのは神戸空港島の親水護岸だけとしています。親水護岸の区域外（空港島のほかの護岸など）では釣りはできません。";

// ── 葛西海浜公園（東京都港湾局） ──
const KASAI =
  "東京都港湾局は、葛西海浜公園を区域を限って釣りができる公園としており、砂浜と葛西渚橋では釣りができません。東なぎさは環境保全のため許可のない立ち入りが禁止されています。釣りは指定された区域でのみ行ってください。";

// ── 清水港（埠頭先端・SOLAS 保安区域） ──
const SHIMIZU =
  "清水港では、ふ頭の先端部や、国際船舶が利用する保安区域（SOLAS区域。フェンスで囲まれた岸壁など）が立入禁止とされています（現地の看板による）。立入禁止の表示がある場所では釣りをせず、港湾管理者の案内を確認してください。";

// ── 神戸市垂水区の公園・漁港・マリーナ隣接護岸 ──
const KOBE_TARUMI =
  "神戸市は、港湾局が管理する神戸港の岸壁・護岸を釣り禁止としています。この場所は県立舞子公園・垂水漁港・マリンピア神戸など港湾局以外が管理する施設に隣接しており、釣りができる範囲は施設ごとに異なります。立入禁止・釣り禁止の掲示がある区間では釣りをしないでください。";

// ── 名古屋港 潮見ふ頭（9号地） ──
const NAGOYA_SHIOMI =
  "名古屋港の潮見ふ頭（9号地）は、南堤防・東堤防が立入禁止とされ、釣りができるのは西堤防のみとの情報があります（二次情報）。港の制限区域や立入禁止の表示がある場所には入らないでください。";

// ── ダム湖（管理者の立入禁止区域・漁協の禁漁区） ──
const DAM_LAKE =
  "ダム湖には、ダム管理者が定める立入禁止区域（ダム堤体・放流設備・取水設備の周辺など）と、漁協の遊漁規則による禁漁区があります。釣りができるのは、遊漁券を購入したうえで、これらの区域を除いた範囲だけです。区域は現地の掲示と漁協の遊漁規則で確認してください。";

// ── 水島港・玉島港（岡山県：SOLAS 対応バースの立入禁止区域） ──
const MIZUSHIMA =
  "岡山県は、水島港の国際船舶が利用する岸壁（SOLAS対応バース。西公共ふ頭・玉島ふ頭など）を、許可のない立ち入りを禁止する区域として区域図で公表しており、立ち入ると処罰の対象になります。釣りをする岸壁が区域外であることを、県の立入禁止区域図と現地の表示で確認してください。";

// ── サンポート高松（香川県高松港管理事務所） ──
const SUNPORT =
  "サンポート高松には魚釣り禁止区域があり、釣りができるのは玉藻防波堤と、その付け根の階段状護岸だけとされています（香川県高松港管理事務所の案内）。それ以外の護岸・岸壁では釣りをしないでください。";

// ── 苅田港（福岡県：SOLAS 制限区域） ──
const KANDA =
  "福岡県は、苅田港の一部をSOLAS条約に基づく制限区域としており、「釣りなどの目的で陸上・海上から立ち入ることはお止めください」と公表しています。釣りをする場所が制限区域外であることを、県の区域図と現地の表示で確認してください。";

export const spotAreaConditions: Record<string, string[]> = {
  // 新潟県の港・漁港の防波堤
  "kashiwazaki-port": [NIIGATA_BREAKWATER],
  "sado-ryotsu-higashi-futo": [NIIGATA_BREAKWATER],
  "joetsu-minatomachi-tottei": [NIIGATA_BREAKWATER],
  "kashiwazaki-nishi-bohatei-a10": [NIIGATA_BREAKWATER],
  "naoetsu-daisan-higashi-teibo": [
    "直江津港の第3東防波堤で釣りができるのは、開放施設として管理されている期間（3月1日〜10月31日）・時間（日の出〜日没）だけで、期間外・時間外は立ち入れません。新潟県は港の防波堤を原則として立入禁止としているため、開放区間の外には出ないでください。",
  ],
  "niigata-kou-nishi-tottei": [
    "新潟県新潟港湾事務所は、新潟港の防波堤・護岸などの港湾管理施設に釣りの目的で立ち入ることを禁止しています。西港区で釣りができる場所として案内されているのは、新潟港海岸（西海岸地区）の第1〜第4突堤です。この突堤がそれに当たらない場合は釣りはできません。",
  ],

  // 富山新港（新湊漁港東堤防は射水市海竜町＝富山新港の東側。根拠欄は新潟県の漁港ルールだったが、所在地に合わせて富山新港の条件を表示する）
  "shinminato-east-breakwater": [TOYAMA_SHINKO],
  "toyama-shinko-higashi-bohatei": [TOYAMA_SHINKO],
  "kaiomaru-park-gogan-imizu-a12": [TOYAMA_SHINKO],

  // 焼津漁港
  "yaizu-kogawa-kou": [YAIZU],
  "yaizu-ogawa-kou-e8": [YAIZU],
  "ooigawa-lower-unagi": [
    `河川から焼津漁港側へ移って釣りをする場合の注意：${YAIZU}`,
  ],

  // 長崎県
  "nagasaki-port": [NAGASAKI],
  "iki-gonoura-port": [NAGASAKI],
  "tsushima-izuhara-w6": [NAGASAKI],
  "nagasaki-mizubenomori-w6": [NAGASAKI],
  "iki-gounoura-w6": [NAGASAKI],
  "fukue-kou-w6": [NAGASAKI],
  "fukue-kou-terminal-s8": [NAGASAKI],
  "tsushima-hitakatsu-kou-s8": [NAGASAKI],

  // 大阪港
  "seaside-cosmo": [
    "シーサイドコスモ（咲洲）で釣りができるのは「魚釣り開放区域」（約215m）だけで、それ以外の区間は釣り禁止と報じられています。開放区域の表示を確認し、区域外では竿を出さないでください。最新の区域は大阪港湾局の案内と現地の掲示で確認してください。",
  ],
  "tsuruhama-gogan": [
    "大阪港湾局は、大阪市港湾施設条例第10条に基づき「鶴浜通船だまり北波除堤」を立入禁止区域に指定しています。この波除堤には入らず、護岸でも立入禁止の表示がある区間では釣りをしないでください。",
  ],

  // 神戸港
  "kobe-airport-veranda": [KOBE_AIRPORT],
  "kobe-airport-gogan": [KOBE_AIRPORT],
  "marinpia-kobe-gogan": [KOBE_TARUMI],
  "maiko-kouen-gogan-a12": [KOBE_TARUMI],
  "tarumi-gyokou-gogan-a13": [KOBE_TARUMI],

  // 東京港
  "arakawa-kakou-kasai": [KASAI],

  // 清水港
  "shimizu-hinode-futo": [SHIMIZU],
  "shimizu-ejiri-futo": [SHIMIZU],

  // 名古屋港
  "shiomi-futo-nagoya": [NAGOYA_SHIOMI],
  "nagoyakou-shiomi-futou": [NAGOYA_SHIOMI],
  "nagoyakou-shiomi-futou-a13": [NAGOYA_SHIOMI],

  // ダム湖（kameyama-dam・chichibu-sakurako 等の統合済み slug は統合先に含まれる）
  "ikehara-dam": [DAM_LAKE],
  "nanairo-dam": [DAM_LAKE],
  "amanjakuko-hiyoshi-dam": [DAM_LAKE],
  "murou-dam": [DAM_LAKE],
  "nanairo-dam-detail": [DAM_LAKE],
  "kannako-shimokubo-dam": [DAM_LAKE],
  "sameura-dam": [DAM_LAKE],
  "kakkaku-dam": [DAM_LAKE],
  "kawaji-damuko": [DAM_LAKE],
  "yamagata-gassan-dam": [DAM_LAKE],
  "gassan-dam-gassanko6": [DAM_LAKE],
  "urayama-dam-sakurako6": [DAM_LAKE],
  "agigawa-dam-gifu": [DAM_LAKE],
  "kannako-lake-a11": [DAM_LAKE],
  "tsufuro-dam-a11": [DAM_LAKE],
  "kakkaku-dam-chichibu-yoshida-a12": [DAM_LAKE],
  "ena-agigawa-damuko-a13": [DAM_LAKE],
  "ikehara-kamiikehara-wand-a13": [DAM_LAKE],
  "matsukawako-okuno-dam": [
    "伊東市松川漁協の遊漁規則により、奥野ダムのダム軸上流300mから付替トンネル下流端までは周年、すべての漁業（釣りを含む）が禁止されています。また遊漁規則で対象となっているのはアユ・ニジマス・アマゴの疑似餌釣りだけで、バス釣りと餌釣りは規則上できません。",
  ],
  "midori-kusaki-dam-shimoryuu-a13": [
    "両毛漁協の遊漁規則により、草木ダム直下の区間（網場から堰堤下流の柱戸川合流点まで）の渡良瀬川は通年遊漁禁止です。それより下流は遊漁券を購入すれば釣りができます。",
  ],

  // 水島港・玉島港
  "tamashima-e-chiku": [MIZUSHIMA],
  "tamashima-kou-otoshima": [MIZUSHIMA],
  "kurashiki-tamashima-e-ganpeki": [MIZUSHIMA],
  "kurashiki-mizushima-nishi-futou": [MIZUSHIMA],
  "tamashima-kou-okayama-w6": [MIZUSHIMA],
  "mizushima-kou-c8": [MIZUSHIMA],
  "okayama-kurashiki-tamashima-kurosaki-bulk": [MIZUSHIMA],
  "mizushima-kou-gogan-a12": [MIZUSHIMA],
  "tamashima-kou-gogan-a13": [MIZUSHIMA],

  // 高松港
  "takamatsu-sunport-gokan": [SUNPORT],
  "sunport-takamatsu-kagawa": [SUNPORT],
  "takamatsu-sunport-c8": [SUNPORT],
  "kagawa-takamatsu-asahi-futo-bulk": [
    "香川県は、高松港の国際航海船舶が利用するふ頭施設に制限区域を設けており、関係者以外は立ち入れません。朝日ふ頭で釣りをする場合は、制限区域（フェンス・ゲートで区切られた岸壁）の外であることを現地の表示で確認してください。",
  ],

  // 鳥取県
  "sakaiminato-marina-c8": [
    "鳥取県は「県内の漁港は、原則、関係者以外立ち入り禁止」としており、漁港の防波堤・岸壁での釣りは原則として認められていません。マリーナ周辺で釣りができる範囲は、施設の掲示と管理者の案内で確認してください。",
  ],

  // 横浜港
  "kanazawa-suisaisen-ryokuchi": [
    "横浜市港湾局は、横浜港のふ頭・防波堤・岸壁を、海づり施設を除き立入禁止・釣り禁止としています。緑地として開放された区域の外（ふ頭・岸壁側）では釣りはできません。釣りができる範囲は現地の掲示で確認してください。",
  ],
  "umi-no-koen": [
    "横浜市緑の協会の案内では、海の公園の園内の海域では釣りはできません。釣りができるのは公園区域外の護岸の一部だけです。",
  ],

  // 苅田港
  "shiraishi-gyokou-kanda-w6": [KANDA],
  "kanda-kou-s8": [KANDA],
};
