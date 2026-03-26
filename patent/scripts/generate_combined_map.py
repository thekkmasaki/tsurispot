#!/usr/bin/env python3
"""
generate_combined_map.py

航空写真 + GEBCO水深 + OSM海岸線 + テクスチャ解析を統合した可視化画像を生成。

使用方法:
    python generate_combined_map.py <slug>
"""

import sys
import json
import math
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

STRUCTURES_DIR = Path(__file__).parent.parent / "data" / "structures"
SATELLITE_DIR = Path(__file__).parent / "satellite"
CACHE_DIR = SATELLITE_DIR / "cache"

# --- GEBCO API ---
GEBCO_URL = "https://www.msil.go.jp/server/rest/services/msil-o/GEBCO_2025/ImageServer/identify"
BATHYMETRY_EXPORT_URL = "https://www.msil.go.jp/server/rest/services/msil-o/basemap_bathymetry/MapServer/export"


def latlng_to_tile_float(lat, lng, zoom):
    n = 2 ** zoom
    x = (lng + 180.0) / 360.0 * n
    lat_rad = math.radians(lat)
    y = (1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2.0 * n
    return x, y


def latlng_to_pixel(lat, lng, zoom, tx_min, ty_min):
    tx, ty = latlng_to_tile_float(lat, lng, zoom)
    return int((tx - tx_min) * 256), int((ty - ty_min) * 256)


def to_web_mercator(lat, lng):
    x = lng * 20037508.34 / 180
    y_rad = math.log(math.tan((90 + lat) * math.pi / 360)) / (math.pi / 180)
    y = y_rad * 20037508.34 / 180
    return x, y


def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


# --- GEBCO水深取得 ---
def fetch_gebco_depth(lat, lng):
    """GEBCO 2025 ImageServer identify APIで1点の水深を取得"""
    x, y = to_web_mercator(lat, lng)
    url = f"{GEBCO_URL}?geometry={x},{y}&geometryType=esriGeometryPoint&returnGeometry=false&f=json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TsuriSpot/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            val = data.get("value", "NoData")
            if val == "NoData":
                return None
            return int(val)
    except Exception as e:
        print(f"  GEBCO取得失敗: {e}")
        return None


def fetch_depth_grid(bbox, cache_key=""):
    """範囲内のグリッド水深を取得"""
    cache_file = CACHE_DIR / f"{cache_key}_gebco_grid.json"
    if cache_file.exists():
        print(f"  GEBCOキャッシュ使用: {cache_file.name}")
        with open(cache_file, "r") as f:
            return json.load(f)

    south, west, north, east = bbox
    # 約100m間隔のグリッド
    lat_step = 0.001  # ~111m
    lng_step = 0.0012  # ~100m
    points = []
    lat = south
    while lat <= north:
        lng = west
        while lng <= east:
            depth = fetch_gebco_depth(lat, lng)
            if depth is not None:
                points.append({"lat": lat, "lng": lng, "depth": depth})
            lng += lng_step
        lat += lat_step

    print(f"  GEBCO: {len(points)} points")
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    with open(cache_file, "w") as f:
        json.dump(points, f)
    return points


# --- バサイメトリタイル画像取得 ---
def fetch_bathymetry_image(bbox, width=800, height=400):
    """海しるMapServerからバサイメトリ画像を取得"""
    south, west, north, east = bbox
    x1, y1 = to_web_mercator(south, west)
    x2, y2 = to_web_mercator(north, east)
    url = (
        f"{BATHYMETRY_EXPORT_URL}?"
        f"bbox={x1},{y1},{x2},{y2}&bboxSR=3857&imageSR=3857"
        f"&size={width},{height}&format=png&transparent=true"
        f"&layers=show:0&f=image"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TsuriSpot/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            from io import BytesIO
            return Image.open(BytesIO(resp.read())).convert("RGBA")
    except Exception as e:
        print(f"  バサイメトリ画像取得失敗: {e}")
        return None


# --- OSMデータ読み込み ---
def load_cached_coastline(slug):
    cache_file = CACHE_DIR / f"{slug}_coastline.json"
    if not cache_file.exists():
        return []
    with open(cache_file, "r") as f:
        data = json.load(f)
    nodes = {}
    ways = []
    for e in data["elements"]:
        if e["type"] == "node":
            nodes[e["id"]] = (e["lat"], e["lon"])
        elif e["type"] == "way":
            ways.append(e)
    coastlines = []
    for w in ways:
        coords = [nodes[nid] for nid in w.get("nodes", []) if nid in nodes]
        if coords:
            coastlines.append(coords)
    return coastlines


def load_cached_park(slug):
    cache_file = CACHE_DIR / f"{slug}_park.json"
    if not cache_file.exists():
        return None
    with open(cache_file, "r") as f:
        data = json.load(f)
    nodes = {}
    ways = []
    for e in data["elements"]:
        if e["type"] == "node":
            nodes[e["id"]] = (e["lat"], e["lon"])
        elif e["type"] == "way":
            ways.append(e)
    if not ways:
        return None
    # URL付きwayを優先
    best = None
    for w in ways:
        tags = w.get("tags", {})
        if tags.get("url") or tags.get("website"):
            best = w
            break
    if not best:
        best = ways[0]
    return [nodes[nid] for nid in best.get("nodes", []) if nid in nodes]


# --- 分類 ---
def point_near_polygon(lat, lon, polygon, threshold_m=30):
    """点がポリゴン辺からthreshold_m以内か"""
    n = len(polygon)
    # Ray casting
    inside = False
    j = n - 1
    for i in range(n):
        yi, xi = polygon[i]
        yj, xj = polygon[j]
        if ((yi > lon) != (yj > lon)) and (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    if inside:
        return True
    for i in range(len(polygon) - 1):
        lat1, lon1 = polygon[i]
        lat2, lon2 = polygon[i + 1]
        dx = (lon2 - lon1) * math.cos(math.radians(lat1))
        dy = lat2 - lat1
        line_len_sq = dx * dx + dy * dy
        if line_len_sq < 1e-12:
            d = haversine(lat, lon, lat1, lon1)
        else:
            px = (lon - lon1) * math.cos(math.radians(lat1))
            py = lat - lat1
            t = max(0, min(1, (px * dx + py * dy) / line_len_sq))
            proj_lon = lon1 + t * (lon2 - lon1)
            proj_lat = lat1 + t * (lat2 - lat1)
            d = haversine(lat, lon, proj_lat, proj_lon)
        if d < threshold_m:
            return True
    return False


def classify_coastline(coords, park_polygon):
    """海岸線を釣り場/テトラ/外に分類"""
    segments = []
    for i in range(len(coords) - 1):
        lat1, lon1 = coords[i]
        lat2, lon2 = coords[i + 1]
        dist = haversine(lat1, lon1, lat2, lon2)
        mid_lat = (lat1 + lat2) / 2
        mid_lon = (lon1 + lon2) / 2
        in_park = point_near_polygon(mid_lat, mid_lon, park_polygon, 30) if park_polygon else False
        segments.append({
            "start": coords[i], "end": coords[i + 1],
            "dist": dist, "type": "platform" if in_park else "outside"
        })
    # テトラ帯検出
    for i in range(len(segments)):
        if segments[i]["type"] != "platform":
            continue
        if segments[i]["dist"] < 30:
            short_count = sum(1 for j in range(max(0, i - 3), min(len(segments), i + 4))
                              if segments[j]["dist"] < 50)
            if short_count >= 3:
                segments[i]["type"] = "tetrapod"
    return segments


def detect_coastline_from_image(img, hint_pts, scan_step=2):
    """航空写真から海岸線を検出（海側から陸に向かうbottom-upスキャン）。

    海側（暗い）→ 陸側（明るい）に向かってスキャンし、
    最初に見つかる「暗→明」境界を海岸線とする。
    影やコンクリートの誤検出を回避。
    """
    w, h = img.size
    pix = img.load()

    sorted_hints = sorted(hint_pts, key=lambda p: p[0])

    def hint_y(x):
        if not sorted_hints:
            return h // 2
        if x <= sorted_hints[0][0]:
            return sorted_hints[0][1]
        if x >= sorted_hints[-1][0]:
            return sorted_hints[-1][1]
        for i in range(len(sorted_hints) - 1):
            x1, y1 = sorted_hints[i]
            x2, y2 = sorted_hints[i + 1]
            if x1 <= x <= x2:
                t = (x - x1) / (x2 - x1) if x2 != x1 else 0
                return y1 + t * (y2 - y1)
        return sorted_hints[-1][1]

    raw_detected = {}
    win = 8  # 比較ウィンドウ

    for col_x in range(0, w, scan_step):
        hy = int(hint_y(col_x))
        # 海側の開始点（ヒントの80px下 = 確実に海）
        y_sea = min(h - win - 2, hy + 80)
        # 陸側の終了点（ヒントの40px上 = 確実に陸）
        y_land = max(win + 2, hy - 40)

        if y_sea <= y_land:
            continue

        # 海側から陸に向かってスキャン（Y減少方向）
        found = False
        for y in range(y_sea, y_land, -1):
            above_b = 0
            for dy in range(win):
                pixel = pix[col_x, max(0, y - dy - 1)]
                above_b += sum(pixel[:3]) / 3
            above_b /= win

            below_b = 0
            for dy in range(win):
                pixel = pix[col_x, min(h - 1, y + dy + 1)]
                below_b += sum(pixel[:3]) / 3
            below_b /= win

            # 厳格な境界条件:
            # - 上(陸): 明るい (>115 = コンクリート)
            # - 下(海): 暗い (<85 = 水面)
            # - 差が大きい (>35)
            if above_b < 115 or below_b > 85 or above_b - below_b < 35:
                continue

            # 持続的水面チェック: 15-30px下が全て暗い（影でなく本当の水面）
            sustained = True
            for check_dy in range(12, 30):
                check_y = min(h - 1, y + check_dy)
                check_b = sum(pix[col_x, check_y][:3]) / 3
                if check_b > 105:
                    sustained = False
                    break
            if sustained:
                raw_detected[col_x] = y
                found = True
                break

        if not found:
            raw_detected[col_x] = hy

    # 外れ値除去（中央値フィルタ）
    xs = sorted(raw_detected.keys())
    median_filtered = {}
    for x in xs:
        neighbors = sorted([raw_detected[nx] for nx in xs if abs(nx - x) <= 40])
        if len(neighbors) >= 3:
            median_val = neighbors[len(neighbors) // 2]
            if abs(raw_detected[x] - median_val) < 25:
                median_filtered[x] = raw_detected[x]
            else:
                median_filtered[x] = median_val
        else:
            median_filtered[x] = raw_detected[x]

    # 移動平均で平滑化
    xs2 = sorted(median_filtered.keys())
    smoothed = {}
    radius_s = 40  # 80px ≈ 20m
    for x in xs2:
        neighbors = [median_filtered[nx] for nx in xs2 if abs(nx - x) <= radius_s]
        if neighbors:
            smoothed[x] = int(sum(neighbors) / len(neighbors))

    return smoothed


# --- メイン描画 ---
def generate_combined_map(slug):
    # 構造JSON
    json_path = STRUCTURES_DIR / f"{slug}.json"
    with open(json_path, "r", encoding="utf-8") as f:
        structure = json.load(f)

    endpoints = structure.get("structureEndpoints", {})
    west_ep = endpoints.get("west", {})
    east_ep = endpoints.get("east", {})

    # メタデータ
    meta_path = SATELLITE_DIR / f"{slug}.meta.json"
    with open(meta_path, "r") as f:
        meta = json.load(f)

    zoom = meta["zoom"]
    grid_size = meta["gridSize"]
    half = grid_size // 2
    tx_min = meta["tileCenter"]["x"] - half
    ty_min = meta["tileCenter"]["y"] - half

    # --- 1. 航空写真を公園エリアにクロップ ---
    print("1. 航空写真クロップ...")
    img_full = Image.open(str(SATELLITE_DIR / f"{slug}.jpg")).convert("RGB")

    park_polygon = load_cached_park(slug)
    coastlines = load_cached_coastline(slug)
    zones = structure.get("zones", [])

    if park_polygon:
        park_pixels = [latlng_to_pixel(lat, lon, zoom, tx_min, ty_min) for lat, lon in park_polygon]
        min_px = min(p[0] for p in park_pixels)
        max_px = max(p[0] for p in park_pixels)
        min_py = min(p[1] for p in park_pixels)
        max_py = max(p[1] for p in park_pixels)
        # パディング（釣り範囲: 護岸+沖150m程度 = 約600px@0.25m/px）
        pad_land = 100
        pad_sea = 350  # 沖150m ≒ 350px（投げ釣り射程圏内）
        pad_lr = 60
        crop_left = max(0, min_px - pad_lr)
        crop_top = max(0, min_py - pad_land)
        crop_right = min(img_full.width, max_px + pad_lr)
        crop_bottom = min(img_full.height, max_py + pad_sea)
    else:
        w_px = latlng_to_pixel(west_ep["lat"], west_ep["lng"], zoom, tx_min, ty_min)
        e_px = latlng_to_pixel(east_ep["lat"], east_ep["lng"], zoom, tx_min, ty_min)
        crop_left = max(0, min(w_px[0], e_px[0]) - 100)
        crop_top = max(0, min(w_px[1], e_px[1]) - 80)
        crop_right = min(img_full.width, max(w_px[0], e_px[0]) + 100)
        crop_bottom = min(img_full.height, max(w_px[1], e_px[1]) + 600)

    img = img_full.crop((crop_left, crop_top, crop_right, crop_bottom))
    w, h = img.size
    print(f"   クロップ: {w}x{h}px")

    # ピクセル座標のオフセット関数
    def to_px(lat, lng):
        px, py = latlng_to_pixel(lat, lng, zoom, tx_min, ty_min)
        return px - crop_left, py - crop_top

    # フォント
    try:
        font_large = ImageFont.truetype("C:/Windows/Fonts/meiryob.ttc", 32)
        font_medium = ImageFont.truetype("C:/Windows/Fonts/meiryob.ttc", 24)
        font_small = ImageFont.truetype("C:/Windows/Fonts/meiryo.ttc", 20)
        font_depth = ImageFont.truetype("C:/Windows/Fonts/meiryob.ttc", 26)
    except:
        font_large = ImageFont.load_default()
        font_medium = font_large
        font_small = font_large
        font_depth = font_large

    # --- 2. 水深グラデーションオーバーレイ ---
    print("2. 水深オーバーレイ生成中...")

    # GEBCO水深を取得（近沖の代表点）
    mid_lat = (west_ep["lat"] + east_ep["lat"]) / 2
    mid_lng = (west_ep["lng"] + east_ep["lng"]) / 2
    depth_near = fetch_gebco_depth(mid_lat - 0.001, mid_lng)   # 護岸直下
    depth_far = fetch_gebco_depth(mid_lat - 0.003, mid_lng)    # 沖300m
    depth_west = fetch_gebco_depth(west_ep["lat"] - 0.001, west_ep["lng"])
    depth_east = fetch_gebco_depth(east_ep["lat"] - 0.001, east_ep["lng"])
    print(f"   GEBCO: 近={depth_near}m, 沖={depth_far}m, 西={depth_west}m, 東={depth_east}m")

    # 護岸ラインのピクセル座標を求める（OSM海岸線の実形状を使用）
    coast_pts = []
    if coastlines and park_polygon:
        # OSM海岸線から公園内セグメントの頂点を集める
        for coords in coastlines:
            segments = classify_coastline(coords, park_polygon)
            for seg in segments:
                if seg["type"] in ("platform", "tetrapod"):
                    coast_pts.append(to_px(*seg["start"]))
                    coast_pts.append(to_px(*seg["end"]))
        # X座標順にソート（重複は保持して精度を維持）
        coast_pts = sorted(coast_pts, key=lambda p: p[0])
    if len(coast_pts) < 3:
        # フォールバック: structureEndpointsの直線補間
        coast_pts = []
        for t in [i / 20 for i in range(21)]:
            lat = west_ep["lat"] + (east_ep["lat"] - west_ep["lat"]) * t
            lng = west_ep["lng"] + (east_ep["lng"] - west_ep["lng"]) * t
            coast_pts.append(to_px(lat, lng))
    print(f"   海岸線ポイント数: {len(coast_pts)}")

    # 護岸からの距離ベースで水深グラデーション帯を描画
    # 各ピクセルについて護岸ラインからの最短距離を計算 → 距離に応じた水深色
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pixels = overlay.load()

    def coast_distance_px(px_x, px_y):
        """ピクセル座標から護岸ラインまでの最短距離（ピクセル単位）"""
        min_d = float('inf')
        for i in range(len(coast_pts) - 1):
            x1, y1 = coast_pts[i]
            x2, y2 = coast_pts[i + 1]
            dx, dy = x2 - x1, y2 - y1
            seg_len_sq = dx * dx + dy * dy
            if seg_len_sq < 1:
                d = math.sqrt((px_x - x1) ** 2 + (px_y - y1) ** 2)
            else:
                t = max(0, min(1, ((px_x - x1) * dx + (px_y - y1) * dy) / seg_len_sq))
                proj_x = x1 + t * dx
                proj_y = y1 + t * dy
                d = math.sqrt((px_x - proj_x) ** 2 + (px_y - proj_y) ** 2)
            min_d = min(min_d, d)
        return min_d

    # 航空写真から高精度海岸線を検出（bottom-upスキャン）
    print("   航空写真から海岸線を検出中（bottom-up）...")
    detected_coast = detect_coastline_from_image(img, coast_pts)
    print(f"   検出ポイント: {len(detected_coast)}")

    coast_y_lut = detected_coast
    detected_xs = sorted(detected_coast.keys()) if detected_coast else []

    def coast_y_at_x(px_x):
        """指定X座標での護岸Y（航空写真検出ベース）"""
        bx = px_x // 2 * 2
        if bx in coast_y_lut:
            return coast_y_lut[bx]
        if not detected_xs:
            return coast_pts[0][1] if coast_pts else h // 2
        if px_x <= detected_xs[0]:
            return coast_y_lut[detected_xs[0]]
        if px_x >= detected_xs[-1]:
            return coast_y_lut[detected_xs[-1]]
        lo, hi = 0, len(detected_xs) - 1
        while lo < hi - 1:
            mid = (lo + hi) // 2
            if detected_xs[mid] <= px_x:
                lo = mid
            else:
                hi = mid
        x1, x2 = detected_xs[lo], detected_xs[hi]
        t = (px_x - x1) / (x2 - x1) if x2 != x1 else 0
        return coast_y_lut[x1] + t * (coast_y_lut[x2] - coast_y_lut[x1])

    # ストライプ間隔 (px) — 4px刻みで高速化
    step = 4
    img_pixels = img.load()
    for py in range(0, h, step):
        for px_x in range(0, w, step):
            # 1. 護岸ラインより上（陸側）は完全スキップ
            coast_y = coast_y_at_x(px_x)
            if py < coast_y + 15:  # 護岸の少し下から描画開始
                continue

            # 2. ピクセル色で陸地判定（明るい=陸、暗い=海）
            sx, sy = min(px_x, w-1), min(py, h-1)
            try:
                r_val, g_val, b_val = img_pixels[sx, sy][:3]
            except:
                continue
            brightness = (r_val + g_val + b_val) / 3
            # 航空写真で海は暗い（<120）、陸は明るい
            # 護岸から近い場所は閾値を厳しく
            dist = coast_distance_px(px_x, py)
            dist_m = dist * 0.25
            if dist_m < 30:
                # 護岸近く: 明るいピクセルはスキップ（コンクリ・石畳等）
                if brightness > 100:
                    continue
            elif brightness > 160:
                continue  # 遠くても明るすぎるのは陸地

            if dist < 8:
                continue  # 護岸直上はスキップ

            # 距離を実際のメートルに換算 (0.25m/px)
            dist_m = dist * 0.25
            if dist_m > 200:
                continue  # 200m以遠は描画しない

            # 距離→水深を線形補間
            d_near = abs(depth_near or 5)
            d_far = abs(depth_far or 15)
            ratio = min(dist_m / 300, 1.0)
            estimated_depth = d_near + (d_far - d_near) * ratio

            # 水深→色: 距離ベースで3段階グラデーション
            # 0-50m: 薄い水色, 50-100m: 青, 100m+: 濃紺
            if dist_m < 50:
                r, g, b = 80, 200, 240
                alpha = int(60 + 60 * (dist_m / 50))
            elif dist_m < 100:
                t = (dist_m - 50) / 50
                r = int(80 - 60 * t)
                g = int(200 - 120 * t)
                b = int(240 - 20 * t)
                alpha = int(120 + 50 * t)
            else:
                t = min((dist_m - 100) / 100, 1.0)
                r = int(20 - 10 * t)
                g = int(80 - 50 * t)
                b = int(220 - 30 * t)
                alpha = int(170 + 40 * t)

            for dy in range(step):
                for dx in range(step):
                    if py + dy < h and px_x + dx < w:
                        pixels[px_x + dx, py + dy] = (r, g, b, alpha)

    # ブラーで滑らかに
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=8))
    img_rgba = img.convert("RGBA")
    img_rgba = Image.alpha_composite(img_rgba, overlay)

    # --- ヘルパー: structureEndpointsから沖方向にオフセットしたライン ---
    def ep_offset_line(dist_m, num_pts=41):
        """structureEndpointsの直線から沖方向にdist_mオフセット"""
        dist_px = dist_m / 0.25
        pts = []
        for i in range(num_pts):
            t = i / (num_pts - 1)
            lat = west_ep["lat"] + (east_ep["lat"] - west_ep["lat"]) * t
            lng = west_ep["lng"] + (east_ep["lng"] - west_ep["lng"]) * t
            bx, by = to_px(lat, lng)
            pts.append((bx, by + int(dist_px)))
        return pts

    # --- 2b. 距離目盛り線（捨て石18m / 50m / 100m）---
    draw_temp = ImageDraw.Draw(img_rgba)
    dist_lines = [
        (18, "捨て石 18m（根掛かり注意）", (255, 165, 0, 200), 3),
        (50, "50m", (255, 255, 255, 180), 2),
        (100, "100m", (255, 255, 255, 140), 2),
    ]
    for dist_m, label, color, lw in dist_lines:
        line_pts = ep_offset_line(dist_m)
        # 破線で描画
        for i in range(0, len(line_pts) - 1, 2):
            j = min(i+1, len(line_pts)-1)
            if 0 <= line_pts[i][1] < h and 0 <= line_pts[j][1] < h:
                draw_temp.line([line_pts[i], line_pts[j]], fill=color, width=lw)
        # ラベル
        li = len(line_pts) * 3 // 4  # 3/4地点
        lx, ly = line_pts[li]
        if 0 <= ly < h:
            bbox_d = draw_temp.textbbox((0, 0), label, font=font_small)
            dtw = bbox_d[2] - bbox_d[0] + 16
            dth = bbox_d[3] - bbox_d[1] + 8
            bg = (0, 60, 130, 200) if dist_m > 18 else (150, 70, 0, 220)
            draw_temp.rounded_rectangle(
                [lx - dtw // 2, ly - dth // 2, lx + dtw // 2, ly + dth // 2],
                radius=6, fill=bg)
            draw_temp.text((lx - dtw // 2 + 8, ly - dth // 2 + 3), label,
                          fill=(255, 255, 255), font=font_small)

    # --- 3. 構造物描画（テトラ帯: 海岸線の先に描画、緑ラインの下に来る）---
    print("3. 捨て石・テトラ帯描画...")
    rip_rap_px = int(18 / 0.25)  # 72px = 18m
    coast_offset = 14  # 護岸線の下(3.5m)

    struct_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    struct_pixels = struct_overlay.load()
    for px_x in range(w):
        cy = int(coast_y_at_x(px_x))
        y_start = cy + coast_offset
        y_end = min(cy + coast_offset + rip_rap_px, h)
        for py in range(max(0, y_start), y_end):
            if (px_x + py) % 16 < 10:
                struct_pixels[px_x, py] = (255, 140, 20, 140)
            else:
                struct_pixels[px_x, py] = (255, 160, 40, 80)
        for lw in range(3):
            if 0 <= y_start + lw < h:
                struct_pixels[px_x, y_start + lw] = (255, 120, 0, 230)
            if 0 <= y_end - 1 - lw < h:
                struct_pixels[px_x, y_end - 1 - lw] = (255, 100, 0, 200)
    struct_overlay = struct_overlay.filter(ImageFilter.GaussianBlur(radius=1))
    img_rgba = Image.alpha_composite(img_rgba, struct_overlay)
    print(f"   捨て石・テトラ帯: 護岸全域（18m幅）")

    # --- 4. 海岸線描画（緑ライン: テトラ帯の上に描画）---
    print("4. 海岸線描画...")
    draw = ImageDraw.Draw(img_rgba)

    platform_m = 0
    tetrapod_m = 0

    for coords in coastlines:
        segments = classify_coastline(coords, park_polygon)
        for seg in segments:
            if seg["type"] not in ("platform", "tetrapod"):
                continue
            px1, py1 = to_px(*seg["start"])
            px2, py2 = to_px(*seg["end"])
            if seg["type"] == "platform":
                draw.line([(px1, py1), (px2, py2)], fill=(255, 255, 255), width=10)
                draw.line([(px1, py1), (px2, py2)], fill=(0, 230, 80), width=7)
                platform_m += seg["dist"]
            else:
                draw.line([(px1, py1), (px2, py2)], fill=(255, 255, 255), width=8)
                draw.line([(px1, py1), (px2, py2)], fill=(255, 60, 40), width=5)
                tetrapod_m += seg["dist"]

    # --- 5. 水深表示（直感的: 少数の代表ラベル + カラーバー）---
    print("5. 水深ラベル配置...")

    # 代表3点のみ: 西端・中央・東端の足元水深
    representative_zones = [
        zones[0],   # 西端
        zones[3],   # 中央
        zones[6],   # 東端
    ] if len(zones) >= 7 else zones[:3]
    for zone in representative_zones:
        x_mid = (zone["xRange"][0] + zone["xRange"][1]) / 2
        lat_z = west_ep["lat"] + (east_ep["lat"] - west_ep["lat"]) * x_mid
        lng_z = west_ep["lng"] + (east_ep["lng"] - west_ep["lng"]) * x_mid
        shore_d = zone.get("estimatedDepth", {}).get("shore", 5)
        offshore_d = zone.get("estimatedDepth", {}).get("offshore", 8)
        # 足元ラベル（護岸から15m沖）
        px_s, py_s = to_px(lat_z, lng_z)
        py_s += 60  # 護岸の少し沖
        if 0 <= px_s < w and 0 <= py_s < h:
            label = f"足元 {shore_d}m"
            bbox_t = draw.textbbox((0, 0), label, font=font_depth)
            tw = bbox_t[2] - bbox_t[0] + 24
            th = bbox_t[3] - bbox_t[1] + 14
            draw.rounded_rectangle(
                [px_s - tw // 2, py_s - th // 2, px_s + tw // 2, py_s + th // 2],
                radius=th // 2, fill=(0, 80, 160, 230),
                outline=(120, 210, 255, 220), width=2)
            draw.text((px_s - tw // 2 + 12, py_s - th // 2 + 5), label,
                      fill=(220, 245, 255), font=font_depth)
        # 沖ラベル（護岸から80m沖）
        py_o = py_s + int(65 / 0.25)  # 65m先
        if 0 <= px_s < w and 0 <= py_o < h:
            label = f"沖 {offshore_d}m"
            bbox_t = draw.textbbox((0, 0), label, font=font_depth)
            tw = bbox_t[2] - bbox_t[0] + 24
            th = bbox_t[3] - bbox_t[1] + 14
            draw.rounded_rectangle(
                [px_s - tw // 2, py_o - th // 2, px_s + tw // 2, py_o + th // 2],
                radius=th // 2, fill=(0, 40, 100, 230),
                outline=(80, 160, 220, 220), width=2)
            draw.text((px_s - tw // 2 + 12, py_o - th // 2 + 5), label,
                      fill=(180, 220, 255), font=font_depth)

    # --- 6. カラーバー（右端に縦型）---
    print("6. カラーバー＋凡例...")
    bar_x = w - 80
    bar_y_start = 80
    bar_height = 300
    bar_width = 30
    # 背景
    draw.rounded_rectangle(
        [bar_x - 15, bar_y_start - 30, bar_x + bar_width + 60, bar_y_start + bar_height + 40],
        radius=10, fill=(0, 0, 0, 200))
    draw.text((bar_x - 5, bar_y_start - 25), "水深", fill=(255, 255, 255), font=font_small)
    # グラデーションバー
    for i in range(bar_height):
        t = i / bar_height  # 0=浅い, 1=深い
        r_c = int(80 * (1 - t))
        g_c = int(200 - 170 * t)
        b_c = int(240 - 50 * t)
        draw.line([(bar_x, bar_y_start + i), (bar_x + bar_width, bar_y_start + i)],
                  fill=(r_c, g_c, b_c))
    # 目盛り
    depth_min = min(z.get("estimatedDepth", {}).get("shore", 5) for z in zones)
    depth_max = max(z.get("estimatedDepth", {}).get("offshore", 10) for z in zones)
    for depth_val in [depth_min, (depth_min + depth_max) / 2, depth_max]:
        t = (depth_val - depth_min) / (depth_max - depth_min) if depth_max > depth_min else 0
        y_pos = bar_y_start + int(t * bar_height)
        draw.line([(bar_x + bar_width, y_pos), (bar_x + bar_width + 8, y_pos)],
                  fill=(255, 255, 255), width=2)
        draw.text((bar_x + bar_width + 10, y_pos - 8), f"{depth_val:.0f}m",
                  fill=(255, 255, 255), font=font_small)

    # --- 7. 凡例（左下、コンパクト）---
    legend_x = 20
    legend_y = h - 100
    draw.rounded_rectangle(
        [legend_x - 10, legend_y - 10, legend_x + 480, legend_y + 85],
        radius=12, fill=(0, 0, 0, 200))
    items = [
        ((0, 230, 80), f"護岸（釣り座） {platform_m:.0f}m"),
        ((255, 160, 40), "捨て石・テトラ帯（〜18m）根掛かり注意"),
    ]
    for i, (color, label) in enumerate(items):
        y = legend_y + i * 36
        draw.rectangle([legend_x, y, legend_x + 28, y + 24],
                       fill=color, outline=(255, 255, 255))
        draw.text((legend_x + 38, y + 2), label,
                  fill=(255, 255, 255), font=font_small)

    # --- タイトル ---
    SLUG_NAMES = {
        "hiraiso-fishing-park": "平磯海づり公園",
    }
    title = structure.get("name") or SLUG_NAMES.get(slug, slug)
    title_text = f"{title} 水深・構造物マップ"
    bbox_t = draw.textbbox((0, 0), title_text, font=font_large)
    ttw = bbox_t[2] - bbox_t[0] + 40
    draw.rounded_rectangle(
        [w // 2 - ttw // 2, 8, w // 2 + ttw // 2, 50],
        radius=10, fill=(0, 0, 0, 220), outline=(255, 255, 255, 100))
    draw.text((w // 2 - ttw // 2 + 20, 14), title_text,
              fill=(255, 255, 255), font=font_large)

    # --- 保存 ---
    output = img_rgba.convert("RGB")
    output_path = str(SATELLITE_DIR / f"{slug}_combined.jpg")
    output.save(output_path, "JPEG", quality=95)
    print(f"\n=== 出力: {output_path} ({output.size[0]}x{output.size[1]}px) ===")
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使用方法: python generate_combined_map.py <slug>")
        sys.exit(1)
    generate_combined_map(sys.argv[1])
