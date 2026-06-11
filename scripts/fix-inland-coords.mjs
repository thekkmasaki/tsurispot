#!/usr/bin/env node
/**
 * 誤座標スポットの修正候補生成 + 自己検証
 *
 * 背景: coord-sweep-report.json の inlandSuspects（海釣りスポットなのに700m圏に
 * 海がない）のうち、中心標高 > 20m のものは「GSI地名検索の第1ヒット（市町村中心点）を
 * 鵜呑みにした」生成エラーの可能性が極めて高い。
 * 検証済みの例:
 *   - 「小樽港」検索 → 第1ヒット「北海道小樽市」(140.9945,43.1907) = 現在の誤座標。
 *     第4ヒット「小樽港」(141.0140,43.1985) = 実際の港湾部
 *   - 「宮之浦港」検索 → 第1ヒットは香川県直島町（別県！）→ 県フィルタ必須
 *   - 「恵曇漁港」→ GSIヒット0件 → Overpass(OSM)併用が必要
 *
 * ── 処理フロー（1スポットあたり） ──
 * 1. 候補生成（優先順）
 *    a. GSI地名検索（https://msearch.gsi.go.jp/address-search/AddressSearch）
 *       スポット名 + バリエーション（県・市町村プレフィックス除去 / （）除去 /
 *       漁港↔港スワップ / ・分割 / 末尾施設語除去）で検索。
 *       市町村中心ヒット（dataSourceなし＝住所サジェスト）は除外し、
 *       title が港湾・海岸系キーワード or スポット名を含む POI のみ候補化。
 *    b. Overpass API: 元座標±50km相当のbbox内で name がスポット名の主要部分に
 *       マッチする node/way を検索（都道府県areaスコープ+正規表現はクエリタイム
 *       アウトするためbbox方式。県一致は検証フェーズの逆ジオコーダ照合で担保）。
 *       港湾・海岸系タグ（harbour / leisure=marina / man_made=pier|breakwater /
 *       natural=beach|cape 等）を持つもの、または名前完全一致のみ候補化。
 * 2. 候補検証（すべて通過したものだけ採用）
 *    - 元座標からの距離 < 50km（同名遠隔地の誤マッチ防止、ローカル計算）
 *    - 水際検証: 候補の中心 + 4方向×400m を GSI標高API でプローブし、
 *      海("-----")が1点以上あること（find-inland-spots.mjs のロジック流用）
 *    - 都道府県一致: GSI逆ジオコーダ（LonLatToAddress）の muniCd 先頭2桁
 *      （JIS都道府県コード）がスポットの都道府県と一致すること。
 *      候補点が海上で muniCd が取れない場合は水際プローブで見つかった陸点、
 *      それも無ければ 800m/1600m×4方向の陸点で代用。
 * 3. 判定
 *    - 強ソース候補（GSI完全一致 / OSM港湾タグ）が検証通過 → 即採用 confidence=high
 *    - それ以外で通過1クラスタ（500m以内は同一視）→ confidence=high
 *    - 通過複数クラスタ → 元座標に最も近いもの、confidence=medium
 *    - 通過0件 → manual-review 行き
 * 4. 出力: scripts/output/coord-fixes-proposed.json
 *    { fixes: [{slug,name,prefecture,oldLat,oldLng,newLat,newLng,source,confidence}],
 *      manualReview: [{slug,name,prefecture,oldLat,oldLng,reason,...}] }
 *    **spots-*.ts は一切変更しない**（修正適用は別ステップ）。
 *
 * ── レート制限（厳守） ──
 * - GSI地名検索 / Overpass / 逆ジオコーダ: 直列・1リクエストごとに1秒待機
 * - GSI標高API: 200ms間隔（probeElevation 内蔵）
 * - 全リクエストに User-Agent: "tsurispot-coord-fix/1.0"
 *
 * ── 中断・再開 ──
 * 10スポットごとに .claude/state/coord-fix-progress.json へ保存（gitignored）。
 * 再実行時は自動再開。--fresh でチェックポイント破棄。
 *
 * 使い方:
 *   node scripts/fix-inland-coords.mjs                        # 全対象（中心標高>20m）
 *   node scripts/fix-inland-coords.mjs --check slug1,slug2    # 指定slugのみ詳細表示（検証用）
 *   node scripts/fix-inland-coords.mjs --limit 20             # 先頭20件のみ
 *   node scripts/fix-inland-coords.mjs --fresh                # チェックポイント破棄
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  loadSpots,
  haversine,
  offsetPoint,
  probeElevation,
  sleep,
} from './find-inland-spots.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const SWEEP_REPORT = path.join(ROOT, 'scripts/output/coord-sweep-report.json');
const OUTPUT = path.join(ROOT, 'scripts/output/coord-fixes-proposed.json');
const CHECKPOINT = path.join(ROOT, '.claude/state/coord-fix-progress.json');

const UA = 'tsurispot-coord-fix/1.0';
const ADDR_API = 'https://msearch.gsi.go.jp/address-search/AddressSearch';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const REVGEO_API = 'https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress';

const SLOW_API_INTERVAL_MS = 1100; // 地名検索/Overpass/逆ジオコーダは1req/秒以下
const MAX_DIST_KM = 50; // 元座標からの距離上限（同名遠隔地の誤マッチ防止）
const CENTER_ELEVATION_MIN = 20; // 対象: 中心プローブ標高 > 20m
const MAX_CANDIDATES_VALIDATED = 5; // 1スポットあたり検証する候補数上限
const CLUSTER_RADIUS_M = 500; // 検証通過候補のクラスタリング半径
const CHECKPOINT_EVERY = 10;

// ── JIS都道府県コード（muniCd先頭2桁と照合） ──────────────
const PREF_CODE = {
  北海道: '01', 青森県: '02', 岩手県: '03', 宮城県: '04', 秋田県: '05',
  山形県: '06', 福島県: '07', 茨城県: '08', 栃木県: '09', 群馬県: '10',
  埼玉県: '11', 千葉県: '12', 東京都: '13', 神奈川県: '14', 新潟県: '15',
  富山県: '16', 石川県: '17', 福井県: '18', 山梨県: '19', 長野県: '20',
  岐阜県: '21', 静岡県: '22', 愛知県: '23', 三重県: '24', 滋賀県: '25',
  京都府: '26', 大阪府: '27', 兵庫県: '28', 奈良県: '29', 和歌山県: '30',
  鳥取県: '31', 島根県: '32', 岡山県: '33', 広島県: '34', 山口県: '35',
  徳島県: '36', 香川県: '37', 愛媛県: '38', 高知県: '39', 福岡県: '40',
  佐賀県: '41', 長崎県: '42', 熊本県: '43', 大分県: '44', 宮崎県: '45',
  鹿児島県: '46', 沖縄県: '47',
};

/** 末尾の汎用施設語（バリエーション生成・Overpassステム抽出に使用） */
const GENERIC_SUFFIX_RE =
  /(漁港|港|河口|海岸|海水浴場|海浜公園|海浜|浜|堤防|防波堤|波止場|波止|護岸|埠頭|ふ頭|岸壁|桟橋|緑地|公園|サーフ|磯|岬)$/;

/** GSIヒットtitleの港湾・海岸系キーワード */
const WATER_KEYWORD_RE =
  /(漁港|港|海岸|海水浴場|浜|岬|埠頭|ふ頭|波止|防波堤|堤防|護岸|桟橋|マリーナ|ハーバー|灯台|海浜|渚|磯)/;

// ── ユーティリティ ──────────────────────────────────────
const normalize = (s) => (s ?? '').normalize('NFKC').replace(/\s+/g, '');

async function fetchWithRetry(url, { body, timeoutMs = 15000, retries = 2 } = {}) {
  let lastError = 'unknown';
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          'User-Agent': UA,
          ...(body != null ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        },
        ...(body != null ? { method: 'POST', body } : {}),
      });
      clearTimeout(timer);
      await sleep(SLOW_API_INTERVAL_MS); // 1req/秒以下を厳守
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        if (res.status === 429 || res.status >= 500) await sleep(5000); // サーバ負荷時は追加待機
        continue;
      }
      return await res.json();
    } catch (e) {
      lastError = e.name === 'AbortError' ? 'timeout' : String(e.message || e);
      await sleep(SLOW_API_INTERVAL_MS);
    }
  }
  throw new Error(lastError);
}

// ── 名前バリエーション生成 ──────────────────────────────
/**
 * GSI検索用のスポット名バリエーションを優先順で返す。
 * 例: 「松江市恵曇漁港」→ [松江市恵曇漁港, 恵曇漁港, 恵曇港, 恵曇]
 *     「鹿児島屋久島宮之浦港」→ [..., 宮之浦港, 宮之浦漁港, 宮之浦]
 */
function buildVariations(spot) {
  const vars = [];
  const push = (v) => {
    v = (v ?? '').trim();
    if (v.length >= 2 && !vars.includes(v)) vars.push(v);
  };

  const base = normalize(spot.name).replace(/[（(][^）)]*[）)]/g, '');
  push(base);

  // 都道府県プレフィックス除去（「北海道」は道を削ると壊れるので特別扱い）
  const pref = spot.region?.prefecture ?? '';
  const prefStems = pref === '北海道' ? ['北海道'] : [pref, pref.replace(/[都府県]$/, '')];
  let core = base;
  for (const ps of prefStems) {
    if (ps && core.startsWith(ps) && core.length - ps.length >= 2) {
      core = core.slice(ps.length);
      break;
    }
  }

  // 市区町村プレフィックス除去: address（郵便番号・都道府県を除去した残り）の先頭から
  // 「〜市/郡/町/村/区」トークンを順に抽出し、そのもの＋接尾辞を外した形
  // （屋久島町→屋久島）でスポット名の先頭から剥がす
  const muniTokens = new Set();
  let addr = normalize(spot.address).replace(/〒?\d{3}-?\d{4}/g, '');
  for (const ps of prefStems) {
    if (ps && addr.startsWith(ps)) {
      addr = addr.slice(ps.length);
      break;
    }
  }
  for (let i = 0; i < 3; i++) {
    const m = addr.match(/^(.{1,6}?[市郡町村区])/);
    if (!m) break;
    muniTokens.add(m[1]);
    const stem = m[1].slice(0, -1);
    if (stem.length >= 2) muniTokens.add(stem);
    addr = addr.slice(m[1].length);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const t of muniTokens) {
      if (core.startsWith(t) && core.length - t.length >= 2) {
        core = core.slice(t.length);
        changed = true;
      }
    }
  }
  push(core);

  // 汎用: 先頭の「漢字1-3+市/町/村」を1回だけ剥がした形も追加（address に無い旧町名等）
  const genericMuni = core.match(/^[一-龥]{1,3}[市町村](.{2,})$/);
  if (genericMuni) push(genericMuni[1]);

  // 「・」「/」区切りの複合名は分割して個別に
  for (const part of base.split(/[・/／]/)) push(part);

  // 漁港↔港スワップ
  for (const v of [...vars]) {
    if (v.endsWith('漁港')) push(v.slice(0, -2) + '港');
    else if (v.endsWith('港')) push(v.slice(0, -1) + '漁港');
  }

  // 末尾施設語を除去したステム
  for (const v of [...vars]) {
    const m = v.match(GENERIC_SUFFIX_RE);
    if (m && v.length - m[0].length >= 2) push(v.slice(0, v.length - m[0].length));
  }

  return vars;
}

/** Overpass の name 正規表現に使うステム（汎用語そのものは除外、最大3つ） */
function buildOverpassStems(variations) {
  const stems = [];
  for (const v of variations) {
    const m = v.match(GENERIC_SUFFIX_RE);
    const stem = m && v.length - m[0].length >= 2 ? v.slice(0, v.length - m[0].length) : v;
    if (stem.length < 2) continue;
    if (GENERIC_SUFFIX_RE.test(stem) && stem.match(GENERIC_SUFFIX_RE)[0] === stem) continue; // 「港」「海岸」等の汎用語単体は除外
    if (/^[ぁ-んー]{1,2}$/.test(stem)) continue; // ひらがな1-2文字はノイズ
    if (!stems.includes(stem)) stems.push(stem);
  }
  // 短い（=コアに近い）ものを優先しつつ最大3つ
  return stems.sort((a, b) => a.length - b.length).slice(0, 3);
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\"]/g, '\\$&');

// ── 候補生成 ────────────────────────────────────────────
/**
 * GSI地名検索。市町村中心ヒット（dataSourceなし）は除外。
 * 返値: [{ lat, lng, label, source: 'gsi-exact'|'gsi-poi' }]
 */
async function gsiCandidates(spot, variations, log) {
  const out = [];
  const queries = variations.slice(0, 4); // リクエスト数を抑制
  for (const q of queries) {
    let features;
    try {
      features = await fetchWithRetry(`${ADDR_API}?q=${encodeURIComponent(q)}`);
    } catch (e) {
      log(`    GSI検索「${q}」: エラー (${e.message})`);
      continue;
    }
    if (!Array.isArray(features)) continue;
    let kept = 0;
    for (const f of features) {
      const props = f?.properties ?? {};
      const coords = f?.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;
      // dataSource の無いヒットは住所サジェスト（市町村・大字中心点）= 誤座標の発生源そのもの → 除外
      if (!props.dataSource) continue;
      const title = normalize(props.title);
      const exact = variations.some((v) => title === v);
      // 非完全一致は「スポット名を含む かつ 港湾・海岸系キーワードあり」のみ（交番・裁判所等のノイズ除外）
      const related =
        variations.some((v) => title.includes(v)) && WATER_KEYWORD_RE.test(title);
      if (!exact && !related) continue;
      out.push({
        lat: coords[1],
        lng: coords[0],
        label: props.title,
        source: exact ? 'gsi-exact' : 'gsi-poi',
      });
      kept++;
    }
    log(`    GSI検索「${q}」: ${features.length}ヒット → 候補${kept}件`);
  }
  return out;
}

/** OSMタグが港湾・海岸系か */
function isWaterTag(tags) {
  if (!tags) return false;
  if (tags.harbour || tags.mooring) return true;
  if (['marina', 'slipway', 'fishing'].includes(tags.leisure)) return true;
  if (['pier', 'breakwater', 'groyne', 'quay', 'lighthouse'].includes(tags.man_made)) return true;
  if (['beach', 'cape', 'bay', 'coastline', 'peninsula', 'reef', 'shoal'].includes(tags.natural)) return true;
  if (['harbour', 'port'].includes(tags.landuse) || tags.industrial === 'port') return true;
  if (tags.amenity === 'ferry_terminal') return true;
  if (Object.keys(tags).some((k) => k.startsWith('seamark:'))) return true;
  return false;
}

/** 明らかにスポットと無関係なOSM要素（学校・役場・地名ノード等） */
function isExcludedTag(tags) {
  if (!tags) return true;
  if (tags.place) return true; // 地名・行政点（市町村中心と同類）
  if (tags.railway || tags.shop || tags.highway) return true; // 駅・店・道路・バス停
  if (tags.waterway) return true; // 河川セグメント（way中心は川の途中になるため不適）
  if (['school', 'kindergarten', 'hospital', 'social_facility', 'townhall', 'post_office',
       'police', 'fire_station', 'bank', 'restaurant', 'fast_food', 'cafe'].includes(tags.amenity)) return true;
  return false;
}

/**
 * Overpass検索。
 * 都道府県area + name正規表現は重くタイムアウトするため、元座標±50km相当の
 * bboxでスコープする（距離<50kmルールと整合。都道府県一致は検証フェーズの
 * 逆ジオコーダ照合で担保）。
 * 返値: [{ lat, lng, label, source: 'overpass-water'|'overpass-name' }]
 */
async function overpassCandidates(spot, variations, stems, log) {
  const prefCode = PREF_CODE[spot.region?.prefecture];
  if (!prefCode || stems.length === 0) return [];
  const regex = stems.map(escapeRegex).join('|');
  // bbox: 緯度±0.45°(≈50km)・経度±50km相当
  const dLat = 0.45;
  const dLng = 50000 / (111320 * Math.cos((spot.latitude * Math.PI) / 180));
  const bbox = [
    (spot.latitude - dLat).toFixed(4),
    (spot.longitude - dLng).toFixed(4),
    (spot.latitude + dLat).toFixed(4),
    (spot.longitude + dLng).toFixed(4),
  ].join(',');
  const query = `[out:json][timeout:25][bbox:${bbox}];
(
  node["name"~"${regex}"];
  way["name"~"${regex}"];
);
out center 40;`;
  let json;
  try {
    json = await fetchWithRetry(OVERPASS_API, {
      body: new URLSearchParams({ data: query }).toString(),
      timeoutMs: 30000,
    });
  } catch (e) {
    log(`    Overpass検索: エラー (${e.message})`);
    return [];
  }
  if (json?.remark) log(`    Overpass remark: ${json.remark}`);
  const out = [];
  for (const el of json?.elements ?? []) {
    const tags = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;
    if (isExcludedTag(tags)) continue;
    const name = normalize(tags.name);
    const water = isWaterTag(tags);
    const exact = variations.some((v) => name === v);
    if (water && stems.some((st) => name.includes(st))) {
      out.push({ lat, lng, label: `OSM:${tags.name}`, source: 'overpass-water' });
    } else if (exact) {
      out.push({ lat, lng, label: `OSM:${tags.name}`, source: 'overpass-name' });
    }
  }
  log(`    Overpass検索 /${regex}/ (JP-${prefCode}): ${json?.elements?.length ?? 0}要素 → 候補${out.length}件`);
  return out;
}

const SOURCE_PRIORITY = { 'gsi-exact': 1, 'overpass-water': 2, 'gsi-poi': 3, 'overpass-name': 4 };

/**
 * 候補の前処理: 50km超の遠隔地を除外し、近接重複（150m以内）を優先度の高い方に
 * 集約して優先度順に返す。
 */
function dedupeCandidates(candidates, spot) {
  const inRange = candidates.filter(
    (c) => haversine(spot.latitude, spot.longitude, c.lat, c.lng) / 1000 <= MAX_DIST_KM,
  );
  const sorted = inRange.sort(
    (a, b) => SOURCE_PRIORITY[a.source] - SOURCE_PRIORITY[b.source],
  );
  const kept = [];
  for (const c of sorted) {
    if (kept.some((k) => haversine(k.lat, k.lng, c.lat, c.lng) < 150)) continue;
    kept.push(c);
  }
  return kept;
}

// ── 候補検証 ────────────────────────────────────────────
const revGeoCache = new Map();

/** GSI逆ジオコーダで muniCd を取得（海上は {} が返り null）。結果はキャッシュ */
async function reverseGeocodeMuniCd(lat, lng) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (revGeoCache.has(key)) return revGeoCache.get(key);
  let muniCd = null;
  try {
    const json = await fetchWithRetry(`${REVGEO_API}?lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}`);
    muniCd = json?.results?.muniCd ?? null;
  } catch {
    muniCd = null;
  }
  revGeoCache.set(key, muniCd);
  return muniCd;
}

/**
 * 候補1件を検証する。
 * 返値: { pass, reasons: [...], waterProbes, muniCd, distanceKm }
 */
async function validateCandidate(spot, cand, log) {
  const reasons = [];

  // (1) 距離 < 50km（ローカル計算、API不要）
  const distanceKm = haversine(spot.latitude, spot.longitude, cand.lat, cand.lng) / 1000;
  if (distanceKm > MAX_DIST_KM) {
    log(`      距離 ${distanceKm.toFixed(1)}km > ${MAX_DIST_KM}km → 不採用`);
    return { pass: false, reasons: [`too-far (${distanceKm.toFixed(1)}km)`], distanceKm };
  }

  // (2) 水際検証: 中心 + 4方向×400m。海("-----")1点以上で合格。
  //     陸点は都道府県照合用に記録（海が見つかり陸点も確保できたら打ち切り）。
  //     例外: 沿岸部の5mレーザーDEMは沖合数百mまで負の標高値を持つことがある
  //     （実測: 鳥取県大山町沖は400〜700m沖で-0.1〜-0.2m、1000m沖でやっと"-----"）。
  //     400m圏に負標高(≤-0.05m)がある場合のみ、8方向×1000mの拡張リングで海を探し、
  //     見つかれば「拡張合格」とする（採用時はconfidenceをmediumに格下げ）。
  const probePoints = [
    { dir: 'C', lat: cand.lat, lng: cand.lng },
    ...[0, 90, 180, 270].map((b, i) => ({
      dir: ['N', 'E', 'S', 'W'][i],
      ...offsetPoint(cand.lat, cand.lng, b, 400),
    })),
  ];
  const waterProbes = [];
  let seaFound = false;
  let negativeNear = false; // DEMに覆われた浅海の兆候
  let landPoint = null;
  for (const p of probePoints) {
    const r = await probeElevation(p.lat, p.lng, UA);
    waterProbes.push({ dir: p.dir, dist: p.dir === 'C' ? 0 : 400, ...r });
    if (r.status === 'sea') seaFound = true;
    if (r.status === 'land') {
      if (r.elevation <= -0.05) negativeNear = true;
      else if (!landPoint) landPoint = p;
    }
    if (seaFound && landPoint) break; // 両方確保できたら以降のプローブは不要
  }
  let waterfrontLevel = seaFound ? 'sea-within-400m' : null;
  if (!seaFound && negativeNear) {
    for (const b of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const p = { dir: `ext${b}`, ...offsetPoint(cand.lat, cand.lng, b, 1000) };
      const r = await probeElevation(p.lat, p.lng, UA);
      waterProbes.push({ dir: p.dir, dist: 1000, ...r });
      if (r.status === 'sea') {
        seaFound = true;
        waterfrontLevel = 'extended-1000m';
        break;
      }
      if (r.status === 'land' && r.elevation > -0.05 && !landPoint) landPoint = p;
    }
  }
  if (!seaFound) {
    reasons.push('no-sea-within-400m');
    log(`      水際検証: 400m圏に海なし${negativeNear ? '（拡張1000m圏でも海なし）' : ''} → 不採用 [${waterProbes.map((p) => `${p.dir}:${p.status === 'land' ? p.elevation + 'm' : p.status}`).join(' ')}]`);
    return { pass: false, reasons, waterProbes, distanceKm };
  }

  // (3) 都道府県照合: 候補点（海上なら近傍の陸点）の muniCd 先頭2桁
  const expected = PREF_CODE[spot.region?.prefecture];
  let muniCd = null;
  const revGeoTargets = [];
  if (waterProbes[0]?.status === 'land') revGeoTargets.push({ lat: cand.lat, lng: cand.lng });
  if (landPoint) revGeoTargets.push(landPoint);
  // 候補もリング陸点も無ければ 800m/1600m×4方向から陸点を探す（最大6リクエスト）
  for (const dist of [800, 1600]) {
    for (const b of [0, 90, 180, 270]) {
      revGeoTargets.push(offsetPoint(cand.lat, cand.lng, b, dist));
    }
  }
  let revGeoTried = 0;
  for (const t of revGeoTargets) {
    if (revGeoTried >= 6) break;
    revGeoTried++;
    muniCd = await reverseGeocodeMuniCd(t.lat, t.lng);
    if (muniCd) break;
  }
  if (!muniCd) {
    reasons.push('prefecture-unverifiable');
    log(`      都道府県照合: muniCd取得不能 → 不採用`);
    return { pass: false, reasons, waterProbes, distanceKm };
  }
  if (muniCd.slice(0, 2) !== expected) {
    reasons.push(`prefecture-mismatch (muniCd=${muniCd}, expected=${expected})`);
    log(`      都道府県照合: muniCd=${muniCd}（期待 ${expected}**）→ 不採用`);
    return { pass: false, reasons, waterProbes, muniCd, distanceKm };
  }

  log(`      検証OK: 距離${distanceKm.toFixed(1)}km / 海あり(${waterfrontLevel}) / muniCd=${muniCd}`);
  return { pass: true, reasons: [], waterProbes, muniCd, distanceKm, waterfrontLevel };
}

// ── 1スポットの処理 ─────────────────────────────────────
async function processSpot(spot, log) {
  const variations = buildVariations(spot);
  const stems = buildOverpassStems(variations);
  log(`  名前バリエーション: ${variations.join(' / ')}`);
  log(`  Overpassステム: ${stems.join(' / ')}`);

  // 候補生成
  const gsi = await gsiCandidates(spot, variations, log);
  const osm = await overpassCandidates(spot, variations, stems, log);
  const candidates = dedupeCandidates([...gsi, ...osm], spot);
  log(`  候補（重複排除後・優先度順）: ${candidates.length}件`);
  for (const c of candidates) {
    log(`    [${c.source}] ${c.label} (${c.lat.toFixed(5)}, ${c.lng.toFixed(5)})`);
  }

  if (candidates.length === 0) {
    return { status: 'manual', reason: 'no-candidates', candidatesTried: 0 };
  }

  // 検証（優先度順、上限あり。強ソースが通過したら即採用）
  const passed = [];
  const failures = [];
  let tried = 0;
  for (const cand of candidates) {
    if (tried >= MAX_CANDIDATES_VALIDATED) break;
    tried++;
    log(`    検証中 [${cand.source}] ${cand.label} ...`);
    const v = await validateCandidate(spot, cand, log);
    if (v.pass) {
      passed.push({ ...cand, distanceKm: v.distanceKm, muniCd: v.muniCd, waterfrontLevel: v.waterfrontLevel });
      if (SOURCE_PRIORITY[cand.source] <= 2) {
        // GSI完全一致 / OSM港湾タグの強ソースが全検証を通過 → 即採用
        // （拡張リングでの水際合格は確度を1段下げる）
        return {
          status: 'fix',
          newLat: cand.lat,
          newLng: cand.lng,
          source: `${cand.source}: ${cand.label}`,
          confidence: v.waterfrontLevel === 'extended-1000m' ? 'medium' : 'high',
          waterfront: v.waterfrontLevel,
          distanceKm: v.distanceKm,
          muniCd: v.muniCd,
          candidatesTried: tried,
        };
      }
    } else {
      failures.push({ label: cand.label, source: cand.source, reasons: v.reasons });
    }
  }

  if (passed.length === 0) {
    return {
      status: 'manual',
      reason: 'all-candidates-failed-validation',
      candidatesTried: tried,
      failures,
    };
  }

  // 通過候補を500mクラスタに集約
  const clusters = [];
  for (const p of passed) {
    const cluster = clusters.find((cl) =>
      cl.some((m) => haversine(m.lat, m.lng, p.lat, p.lng) < CLUSTER_RADIUS_M),
    );
    if (cluster) cluster.push(p);
    else clusters.push([p]);
  }
  // クラスタ代表 = 優先度最高の候補。複数クラスタなら元座標に最も近いクラスタ。
  const reps = clusters.map(
    (cl) => cl.sort((a, b) => SOURCE_PRIORITY[a.source] - SOURCE_PRIORITY[b.source])[0],
  );
  reps.sort((a, b) => a.distanceKm - b.distanceKm);
  const chosen = reps[0];
  const downgraded = chosen.waterfrontLevel === 'extended-1000m' || clusters.length > 1;
  return {
    status: 'fix',
    newLat: chosen.lat,
    newLng: chosen.lng,
    source: `${chosen.source}: ${chosen.label}`,
    confidence: downgraded ? 'medium' : 'high',
    waterfront: chosen.waterfrontLevel,
    distanceKm: chosen.distanceKm,
    muniCd: chosen.muniCd,
    candidatesTried: tried,
    clusterCount: clusters.length,
  };
}

// ── チェックポイント ─────────────────────────────────────
function loadCheckpoint() {
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT, 'utf8'));
  } catch {
    return null;
  }
}
function saveCheckpoint(state) {
  fs.mkdirSync(path.dirname(CHECKPOINT), { recursive: true });
  fs.writeFileSync(CHECKPOINT, JSON.stringify(state));
}

// ── 出力 ────────────────────────────────────────────────
function writeOutput(results, spotBySlug, targetCount) {
  const fixes = [];
  const manualReview = [];
  for (const [slug, r] of Object.entries(results)) {
    const spot = spotBySlug.get(slug);
    if (!spot) continue;
    const common = {
      slug,
      name: spot.name,
      prefecture: spot.region?.prefecture ?? '',
      oldLat: spot.latitude,
      oldLng: spot.longitude,
    };
    if (r.status === 'fix') {
      fixes.push({
        ...common,
        newLat: r.newLat,
        newLng: r.newLng,
        source: r.source,
        confidence: r.confidence,
        waterfront: r.waterfront,
        movedKm: Number(r.distanceKm?.toFixed(2)),
      });
    } else {
      manualReview.push({ ...common, reason: r.reason, failures: r.failures ?? [] });
    }
  }
  const report = {
    generatedAt: new Date().toISOString(),
    note: 'fix-inland-coords.mjs による修正候補。spots-*.ts は未変更。適用前に要レビュー。',
    stats: {
      targets: targetCount,
      processed: Object.keys(results).length,
      fixes: fixes.length,
      manualReview: manualReview.length,
      byConfidence: {
        high: fixes.filter((f) => f.confidence === 'high').length,
        medium: fixes.filter((f) => f.confidence === 'medium').length,
      },
    },
    fixes,
    manualReview,
  };
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2));
  return report;
}

// ── メイン ──────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const checkIdx = args.indexOf('--check');
  const checkSlugs = checkIdx >= 0 ? (args[checkIdx + 1] || '').split(',').filter(Boolean) : null;
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : null;
  const fresh = args.includes('--fresh');

  console.log('スポットデータを読み込み中（esbuildバンドル評価）...');
  const fishingSpots = await loadSpots();
  const spotBySlug = new Map(fishingSpots.map((s) => [s.slug, s]));
  console.log(`総スポット数: ${fishingSpots.length}`);

  const sweep = JSON.parse(fs.readFileSync(SWEEP_REPORT, 'utf8'));

  // ── 検証モード: 指定slugのみ詳細表示（チェックポイント・出力ファイルは触らない） ──
  if (checkSlugs) {
    for (const slug of checkSlugs) {
      const spot = spotBySlug.get(slug);
      if (!spot) {
        console.log(`\n[--check] ${slug}: スポットが見つかりません`);
        continue;
      }
      const entry = sweep.inlandSuspects.find((s) => s.slug === slug);
      const centerElev = entry?.probes?.find((p) => p.dir === 'C')?.elevation;
      console.log(`\n[--check] ${slug} (${spot.name}, ${spot.region?.prefecture}, ${spot.spotType})`);
      console.log(`  現座標: ${spot.latitude}, ${spot.longitude}（中心標高: ${centerElev ?? '不明'}m）`);
      const r = await processSpot(spot, (msg) => console.log(msg));
      if (r.status === 'fix') {
        console.log(`  → fix提案: (${r.newLat.toFixed(6)}, ${r.newLng.toFixed(6)}) 移動${r.distanceKm.toFixed(2)}km`);
        console.log(`     source=${r.source} / confidence=${r.confidence} / muniCd=${r.muniCd}`);
      } else {
        console.log(`  → manual-review: ${r.reason}`);
        for (const f of r.failures ?? []) {
          console.log(`     不採用 [${f.source}] ${f.label}: ${f.reasons.join(', ')}`);
        }
      }
    }
    return;
  }

  // ── 対象抽出: inlandSuspects のうち中心プローブ標高 > 20m ──
  let targets = sweep.inlandSuspects.filter((s) => {
    const c = s.probes?.find((p) => p.dir === 'C');
    return c?.status === 'land' && c.elevation > CENTER_ELEVATION_MIN;
  });
  console.log(`対象（inlandSuspects ${sweep.inlandSuspects.length}件中、中心標高>${CENTER_ELEVATION_MIN}m）: ${targets.length}件`);
  if (limit) {
    targets = targets.slice(0, limit);
    console.log(`--limit ${limit} → 先頭${targets.length}件のみ処理`);
  }

  // チェックポイント再開
  let results = {};
  if (!fresh) {
    const cp = loadCheckpoint();
    if (cp?.results) {
      results = cp.results;
      console.log(`チェックポイントから再開: ${Object.keys(results).length}件処理済み`);
    }
  }

  const pending = targets.filter((t) => !(t.slug in results) && spotBySlug.has(t.slug));
  console.log(`残り: ${pending.length}件\n`);
  const startedAt = Date.now();
  let processed = 0;

  for (const entry of pending) {
    const spot = spotBySlug.get(entry.slug);
    console.log(`[${processed + 1}/${pending.length}] ${spot.slug} (${spot.name}, ${spot.region?.prefecture})`);
    let r;
    try {
      r = await processSpot(spot, () => {}); // フルランでは詳細ログ抑制
    } catch (e) {
      console.log(`  処理エラー: ${e.message} → manual-review`);
      r = { status: 'manual', reason: `error: ${e.message}` };
    }
    results[entry.slug] = r;
    processed++;
    if (r.status === 'fix') {
      console.log(`  → fix (${r.newLat.toFixed(5)}, ${r.newLng.toFixed(5)}) ${r.confidence} / ${r.source}`);
    } else {
      console.log(`  → manual-review (${r.reason})`);
    }

    if (processed % CHECKPOINT_EVERY === 0 || processed === pending.length) {
      saveCheckpoint({ updatedAt: new Date().toISOString(), results });
      const elapsed = (Date.now() - startedAt) / 1000;
      const rate = processed / elapsed;
      const etaMin = ((pending.length - processed) / rate / 60).toFixed(0);
      const fixCount = Object.values(results).filter((v) => v.status === 'fix').length;
      console.log(`  -- 進捗 ${processed}/${pending.length}（${elapsed.toFixed(0)}s経過, 残り約${etaMin}分） fix累計${fixCount}件 --`);
    }
  }

  const report = writeOutput(results, spotBySlug, targets.length);
  console.log('\n=== 修正候補生成 結果 ===');
  console.log(`対象: ${report.stats.targets} / 処理済み: ${report.stats.processed}`);
  console.log(`fix提案: ${report.stats.fixes}件（high ${report.stats.byConfidence.high} / medium ${report.stats.byConfidence.medium}）`);
  console.log(`manual-review: ${report.stats.manualReview}件`);
  console.log(`出力: ${path.relative(ROOT, OUTPUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
