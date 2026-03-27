#!/usr/bin/env python3
"""
analyze_coastline.py

OSM海岸線データを航空写真に描画し、釣り座・テトラ帯を自動判定する。

判定ロジック:
  - OSM公園ポリゴン範囲内の海岸線 → 釣り座（緑）
  - 範囲外で短いセグメント密集 → テトラ帯（赤）
  - 範囲外で長い直線 → 立入禁止（赤太）
  - その他 → 港湾施設等（黄）

使用方法:
    python analyze_coastline.py <slug>
"""

import sys
import json
import math
from pathlib import Path
from urllib.request import urlopen, Request
from PIL import Image, ImageDraw


STRUCTURES_DIR = Path(__file__).parent.parent / "data" / "structures"
SATELLITE_DIR = Path(__file__).parent / "satellite"
CACHE_DIR = Path(__file__).parent / "satellite" / "cache"


def latlng_to_tile_float(lat: float, lng: float, zoom: int) -> tuple[float, float]:
    """緯度経度 → タイル座標（小数付き）"""
    n = 2 ** zoom
    x = (lng + 180.0) / 360.0 * n
    lat_rad = math.radians(lat)
    y = (1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2.0 * n
    return x, y


def latlng_to_pixel(
    lat: float, lng: float, zoom: int, tile_x_min: int, tile_y_min: int
) -> tuple[int, int]:
    """緯度経度 → 画像上のピクセル座標"""
    tx, ty = latlng_to_tile_float(lat, lng, zoom)
    px = int((tx - tile_x_min) * 256)
    py = int((ty - tile_y_min) * 256)
    return px, py


def haversine(lat1, lon1, lat2, lon2):
    """2点間の距離（メートル）"""
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def point_in_polygon(lat: float, lon: float, polygon: list[tuple[float, float]]) -> bool:
    """Ray casting法で点がポリゴン内かを判定"""
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        yi, xi = polygon[i]
        yj, xj = polygon[j]
        if ((yi > lon) != (yj > lon)) and (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def point_near_polygon(lat: float, lon: float, polygon: list[tuple[float, float]], threshold_m: float = 30) -> bool:
    """点がポリゴンの辺から threshold_m 以内か、またはポリゴン内かを判定"""
    if point_in_polygon(lat, lon, polygon):
        return True
    # 各辺との最短距離を計算
    for i in range(len(polygon) - 1):
        d = _point_to_segment_distance(lat, lon, polygon[i], polygon[i + 1])
        if d < threshold_m:
            return True
    return False


def _point_to_segment_distance(lat, lon, p1, p2):
    """点から線分への最短距離（メートル）"""
    lat1, lon1 = p1
    lat2, lon2 = p2
    dx = (lon2 - lon1) * math.cos(math.radians(lat1))
    dy = lat2 - lat1
    line_len_sq = dx * dx + dy * dy
    if line_len_sq < 1e-12:
        return haversine(lat, lon, lat1, lon1)
    px = (lon - lon1) * math.cos(math.radians(lat1))
    py = lat - lat1
    t = max(0, min(1, (px * dx + py * dy) / line_len_sq))
    proj_lon = lon1 + t * (lon2 - lon1)
    proj_lat = lat1 + t * (lat2 - lat1)
    return haversine(lat, lon, proj_lat, proj_lon)


def overpass_query(query_body: str, cache_key: str) -> dict:
    """Overpass APIクエリ実行（キャッシュ付き）"""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"{cache_key}.json"
    if cache_file.exists():
        print(f"  キャッシュ使用: {cache_file.name}")
        with open(cache_file, "r", encoding="utf-8") as f:
            return json.load(f)

    query = f'[out:json][timeout:30];{query_body}'
    url = 'https://overpass-api.de/api/interpreter'
    req = Request(url, data=f'data={query}'.encode(), method='POST')
    with urlopen(req, timeout=40) as resp:
        data = json.loads(resp.read())
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(data, f)
    print(f"  キャッシュ保存: {cache_file.name}")
    return data


def parse_ways(data: dict) -> tuple[dict, list]:
    """Overpassレスポンスからノードとwayを抽出"""
    nodes = {}
    ways = []
    for e in data['elements']:
        if e['type'] == 'node':
            nodes[e['id']] = (e['lat'], e['lon'])
        elif e['type'] == 'way':
            ways.append(e)
    return nodes, ways


def fetch_coastline(bbox: tuple[float, float, float, float], slug: str = "") -> list[list[tuple[float, float]]]:
    """Overpass APIで海岸線のノード座標列を取得"""
    south, west, north, east = bbox
    query_body = (
        f'way["natural"="coastline"]({south},{west},{north},{east});'
        f'(._;>;);out body;'
    )
    data = overpass_query(query_body, f"{slug}_coastline")

    nodes, ways = parse_ways(data)
    coastlines = []
    for w in ways:
        coords = [nodes[nid] for nid in w.get('nodes', []) if nid in nodes]
        if coords:
            coastlines.append(coords)
    return coastlines


def fetch_park_polygon(park_name: str, bbox: tuple[float, float, float, float], slug: str = "", center: tuple[float, float] | None = None) -> list[tuple[float, float]] | None:
    """OSMから公園ポリゴンを取得（釣り関連のleisure=parkを検索）"""
    south, west, north, east = bbox
    # 釣り関連の名前パターンで検索
    query_body = (
        f'('
        f'way["leisure"~"park|fishing"]["name"~"釣|つり|フィッシング|海づり"]'
        f'({south},{west},{north},{east});'
        f'way["leisure"~"park|fishing"]["url"]'
        f'({south},{west},{north},{east});'
        f');'
        f'(._;>;);out body;'
    )
    data = overpass_query(query_body, f"{slug}_park")

    nodes, ways = parse_ways(data)
    if not ways:
        return None

    # スポット中心座標に最も近いwayを選択
    best_way = None
    best_dist = float('inf')
    for w in ways:
        way_coords = [nodes[nid] for nid in w.get('nodes', []) if nid in nodes]
        if not way_coords:
            continue
        # ポリゴン重心
        avg_lat = sum(c[0] for c in way_coords) / len(way_coords)
        avg_lon = sum(c[1] for c in way_coords) / len(way_coords)
        if center:
            d = haversine(center[0], center[1], avg_lat, avg_lon)
        else:
            d = 0
        tags = w.get('tags', {})
        # URL付き（公式サイト持ち）はボーナス
        if tags.get('url') or tags.get('website'):
            d -= 10000
        if d < best_dist:
            best_dist = d
            best_way = w

    if not best_way:
        return None

    coords = [nodes[nid] for nid in best_way.get('nodes', []) if nid in nodes]
    tags = best_way.get('tags', {})
    print(f"  公園ポリゴン: way/{best_way['id']} ({tags.get('name', '?')}) {len(coords)}ノード")
    return coords


def classify_segments(
    coords: list[tuple[float, float]],
    park_polygon: list[tuple[float, float]] | None = None,
    fishing_west: tuple[float, float] | None = None,
    fishing_east: tuple[float, float] | None = None,
) -> list[dict]:
    """
    海岸線セグメントを分類:
      - 'platform':   公園ポリゴン内 → 釣り座（コンクリ護岸）
      - 'tetrapod':   ノード密度高い → テトラ帯
      - 'restricted': 範囲外の大きな構造物 → 立入禁止
      - 'port':       その他 → 港湾施設等
    """
    segments = []
    for i in range(len(coords) - 1):
        lat1, lon1 = coords[i]
        lat2, lon2 = coords[i + 1]
        dist = haversine(lat1, lon1, lat2, lon2)
        segments.append({
            "start": coords[i],
            "end": coords[i + 1],
            "dist": dist,
            "type": "unknown",
        })

    # 分類: 公園ポリゴンがある場合はポリゴン内判定
    if park_polygon:
        for seg in segments:
            mid_lat = (seg["start"][0] + seg["end"][0]) / 2
            mid_lon = (seg["start"][1] + seg["end"][1]) / 2
            if point_near_polygon(mid_lat, mid_lon, park_polygon, 30):
                seg["type"] = "platform"
            else:
                seg["type"] = "outside"
    elif fishing_west and fishing_east:
        # フォールバック: structureEndpointsからの距離判定
        for seg in segments:
            mid_lat = (seg["start"][0] + seg["end"][0]) / 2
            mid_lon = (seg["start"][1] + seg["end"][1]) / 2
            dist_w = haversine(mid_lat, mid_lon, fishing_west[0], fishing_west[1])
            dist_e = haversine(mid_lat, mid_lon, fishing_east[0], fishing_east[1])
            total_len = haversine(fishing_west[0], fishing_west[1], fishing_east[0], fishing_east[1])
            if dist_w < total_len * 1.1 and dist_e < total_len * 1.1:
                seg["type"] = "platform"
            else:
                seg["type"] = "outside"
    else:
        for seg in segments:
            seg["type"] = "outside"

    # 公園内セグメントのうち、テトラ帯を細分（短いセグメント密集）
    for i in range(len(segments)):
        if segments[i]["type"] != "platform":
            continue
        if segments[i]["dist"] < 30:
            short_count = 0
            for j in range(max(0, i - 3), min(len(segments), i + 4)):
                if segments[j]["dist"] < 50:
                    short_count += 1
            if short_count >= 3:
                segments[i]["type"] = "tetrapod"

    return segments


def draw_on_image(
    image_path: str,
    coastlines: list[list[tuple[float, float]]],
    zoom: int,
    tile_x_min: int,
    tile_y_min: int,
    output_path: str,
    park_polygon: list[tuple[float, float]] | None = None,
    fishing_west: tuple[float, float] | None = None,
    fishing_east: tuple[float, float] | None = None,
):
    """航空写真に海岸線セグメントを色分けして描画"""
    img = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(img)

    colors = {
        "platform": (0, 255, 0),      # 緑 = 釣り座
        "tetrapod": (255, 50, 50),     # 赤 = テトラ帯
        "restricted": (255, 0, 0),     # 赤太 = 立入禁止
        "port": (255, 255, 0),         # 黄 = 港湾施設
    }

    legend_labels = {
        "platform": "釣り座（コンクリ護岸）",
        "tetrapod": "テトラ帯（立入困難）",
    }

    stats = {"platform": 0, "tetrapod": 0, "restricted": 0, "port": 0}

    for coords in coastlines:
        segments = classify_segments(coords, park_polygon, fishing_west, fishing_east)

        for seg in segments:
            # 公園範囲内のセグメントのみ描画（範囲外はスキップ）
            if seg["type"] not in ("platform", "tetrapod"):
                continue

            lat1, lon1 = seg["start"]
            lat2, lon2 = seg["end"]
            px1, py1 = latlng_to_pixel(lat1, lon1, zoom, tile_x_min, tile_y_min)
            px2, py2 = latlng_to_pixel(lat2, lon2, zoom, tile_x_min, tile_y_min)

            color = colors.get(seg["type"], (128, 128, 128))
            width = 6 if seg["type"] == "platform" else 4

            draw.line([(px1, py1), (px2, py2)], fill=color, width=width)

            r = 4
            draw.ellipse([px1 - r, py1 - r, px1 + r, py1 + r], fill=color)
            draw.ellipse([px2 - r, py2 - r, px2 + r, py2 + r], fill=color)

            stats[seg["type"]] += seg["dist"]

    # 公園ポリゴンの境界を半透明で描画
    if park_polygon:
        poly_pixels = [
            latlng_to_pixel(lat, lon, zoom, tile_x_min, tile_y_min)
            for lat, lon in park_polygon
        ]
        # ポリゴン境界線（シアン破線風）
        for i in range(len(poly_pixels) - 1):
            draw.line([poly_pixels[i], poly_pixels[i + 1]],
                      fill=(0, 200, 255), width=2)

    # 凡例を描画
    legend_y = 30
    for seg_type, label in legend_labels.items():
        color = colors[seg_type]
        dist = stats[seg_type]
        draw.rectangle([30, legend_y, 60, legend_y + 20], fill=color, outline=(255, 255, 255))
        draw.text((70, legend_y + 2), f"{label} ({dist:.0f}m)", fill=(255, 255, 255))
        legend_y += 30

    # 公園ポリゴン凡例
    if park_polygon:
        draw.rectangle([30, legend_y, 60, legend_y + 20], fill=(0, 200, 255), outline=(255, 255, 255))
        draw.text((70, legend_y + 2), "OSM park boundary", fill=(255, 255, 255))

    img.save(output_path, "JPEG", quality=95)
    return stats


def main():
    if len(sys.argv) < 2:
        print("使用方法: python analyze_coastline.py <slug>")
        sys.exit(1)

    slug = sys.argv[1]

    # 構造JSONから情報を読み込み
    json_path = STRUCTURES_DIR / f"{slug}.json"
    if not json_path.exists():
        print(f"エラー: {json_path} が見つかりません")
        sys.exit(1)

    with open(json_path, "r", encoding="utf-8") as f:
        structure = json.load(f)

    endpoints = structure.get("structureEndpoints", {})
    west = endpoints.get("west", {})
    east = endpoints.get("east", {})

    if not west or not east:
        print("エラー: structureEndpointsが見つかりません")
        sys.exit(1)

    # メタデータから画像情報を取得
    meta_path = SATELLITE_DIR / f"{slug}.meta.json"
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    zoom = meta["zoom"]
    grid_size = meta["gridSize"]
    tile_center_x = meta["tileCenter"]["x"]
    tile_center_y = meta["tileCenter"]["y"]
    half = grid_size // 2
    tile_x_min = tile_center_x - half
    tile_y_min = tile_center_y - half

    # 範囲（structureEndpoints + マージン）
    margin = 0.005
    bbox = (
        min(west["lat"], east["lat"]) - margin,
        min(west["lng"], east["lng"]) - margin,
        max(west["lat"], east["lat"]) + margin,
        max(west["lng"], east["lng"]) + margin,
    )

    print(f"=== 海岸線分析: {slug} ===")

    # OSM公園ポリゴンを取得
    center = (structure["coordinates"]["lat"], structure["coordinates"]["lng"])
    print(f"公園ポリゴン取得中...")
    park_polygon = fetch_park_polygon("", bbox, slug, center)

    if park_polygon:
        print(f"  → 公園ポリゴンで分類します")
    else:
        print(f"  → 公園ポリゴンなし、structureEndpointsで分類します")

    # OSM海岸線を取得
    print(f"OSM海岸線取得中... bbox={bbox}")
    coastlines = fetch_coastline(bbox, slug)
    total_nodes = sum(len(c) for c in coastlines)
    print(f"  {len(coastlines)} ways, {total_nodes} nodes")

    # 航空写真に描画
    image_path = str(SATELLITE_DIR / f"{slug}.jpg")
    output_path = str(SATELLITE_DIR / f"{slug}_analyzed.jpg")

    fishing_west = (west["lat"], west["lng"])
    fishing_east = (east["lat"], east["lng"])

    print(f"描画中...")
    stats = draw_on_image(
        image_path, coastlines, zoom, tile_x_min, tile_y_min, output_path,
        park_polygon, fishing_west, fishing_east,
    )

    print(f"\n=== 結果 ===")
    print(f"  釣り座（緑）:     {stats['platform']:.0f}m")
    print(f"  テトラ帯（赤）:   {stats['tetrapod']:.0f}m")
    print(f"  立入禁止（赤太）: {stats['restricted']:.0f}m")
    print(f"  港湾等（黄）:     {stats['port']:.0f}m")
    print(f"  出力: {output_path}")

    # structureEndpointsをOSMポリゴンから更新提案
    if park_polygon:
        # 公園ポリゴンの海岸線寄りのノード（南側）を抽出
        south_nodes = sorted(park_polygon, key=lambda p: p[0])[:4]
        west_node = min(south_nodes, key=lambda p: p[1])
        east_node = max(south_nodes, key=lambda p: p[1])
        ep_dist = haversine(west_node[0], west_node[1], east_node[0], east_node[1])
        print(f"\n  [参考] 公園ポリゴンから算出したendpoints:")
        print(f"    西端: ({west_node[0]:.7f}, {west_node[1]:.7f})")
        print(f"    東端: ({east_node[0]:.7f}, {east_node[1]:.7f})")
        print(f"    距離: {ep_dist:.0f}m")


if __name__ == "__main__":
    main()
