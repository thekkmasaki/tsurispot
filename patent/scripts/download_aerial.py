#!/usr/bin/env python3
"""
download_aerial.py

国土地理院（GSI）航空写真タイルから高解像度画像を取得。
structureEndpoints から中心座標・グリッドサイズを自動計算。

使用方法:
    python download_aerial.py <slug>                  # JSONから自動計算
    python download_aerial.py --all                   # 全スポット自動計算
    python download_aerial.py <slug> <lat> <lng> [zoom] [grid_size]  # 手動指定
"""

import sys
import math
import json
from pathlib import Path
from urllib.request import urlopen, Request
from io import BytesIO

from PIL import Image


# GSI航空写真タイルURL
GSI_TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"

# 構造JSONディレクトリ
STRUCTURES_DIR = Path(__file__).parent.parent / "data" / "structures"


def latlng_to_tile(lat: float, lng: float, zoom: int) -> tuple[int, int]:
    """緯度経度 → タイル座標変換"""
    n = 2 ** zoom
    x = int((lng + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    y = int((1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2.0 * n)
    return x, y


def load_structure_data(slug: str) -> dict | None:
    """構造JSONを読み込み"""
    json_path = STRUCTURES_DIR / f"{slug}.json"
    if not json_path.exists():
        return None
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


def calc_params_from_endpoints(
    west: dict, east: dict, zoom: int = 18, padding: float = 0.3
) -> tuple[float, float, int]:
    """
    structureEndpointsから中心座標とgridSizeを自動計算。

    1. 中心 = 西端と東端の中間点
    2. タイル座標でのスパンを計算
    3. 両側にpadding分を加えてgridSizeを決定

    Args:
        west, east: {"lat": float, "lng": float}
        zoom: ズームレベル
        padding: 片側あたりのパディング割合（0.3 = 30%）

    Returns:
        (center_lat, center_lng, grid_size)
    """
    center_lat = (west["lat"] + east["lat"]) / 2
    center_lng = (west["lng"] + east["lng"]) / 2

    # タイル座標での端点間スパン
    west_tx, west_ty = latlng_to_tile(west["lat"], west["lng"], zoom)
    east_tx, east_ty = latlng_to_tile(east["lat"], east["lng"], zoom)

    span_x = abs(east_tx - west_tx)
    span_y = abs(east_ty - west_ty)
    span = max(span_x, span_y)

    # 両側にpadding → 全体で (1 + 2*padding) 倍
    grid_size = math.ceil(span * (1 + 2 * padding))
    if grid_size % 2 != 0:
        grid_size += 1
    grid_size = max(grid_size, 6)

    return center_lat, center_lng, grid_size


def download_tile(z: int, x: int, y: int) -> Image.Image | None:
    """GSIタイルを1枚ダウンロード"""
    url = GSI_TILE_URL.format(z=z, x=x, y=y)
    try:
        req = Request(url, headers={"User-Agent": "TsuriSpot-Patent-Pipeline/1.0"})
        with urlopen(req, timeout=10) as resp:
            data = resp.read()
            return Image.open(BytesIO(data))
    except Exception as e:
        print(f"  タイル取得失敗: z={z} x={x} y={y} - {e}")
        return None


def download_spot_image(
    slug: str,
    lat: float,
    lng: float,
    zoom: int = 18,
    grid_size: int = 6,
    output_dir: str = "satellite",
) -> str | None:
    """指定座標周辺のGSI航空写真タイルを取得し、1枚に結合。"""
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    center_x, center_y = latlng_to_tile(lat, lng, zoom)
    half = grid_size // 2

    print(f"  中心: ({lat}, {lng}) → タイル z={zoom} x={center_x} y={center_y}")
    print(f"  グリッド: {grid_size}x{grid_size} ({grid_size*grid_size}タイル)")

    tile_size = 256
    result = Image.new("RGB", (grid_size * tile_size, grid_size * tile_size))
    success_count = 0

    for dy in range(grid_size):
        for dx in range(grid_size):
            tx = center_x - half + dx
            ty = center_y - half + dy
            tile = download_tile(zoom, tx, ty)
            if tile:
                result.paste(tile, (dx * tile_size, dy * tile_size))
                success_count += 1

    if success_count == 0:
        print(f"  エラー: タイルが1枚も取得できませんでした")
        return None

    output_path = str(Path(output_dir) / f"{slug}.jpg")
    result.save(output_path, "JPEG", quality=95)

    print(f"  取得: {success_count}/{grid_size*grid_size}タイル")
    print(f"  画像サイズ: {result.size[0]}x{result.size[1]}px")
    print(f"  出力: {output_path}")

    # メタデータ保存
    meta = {
        "source": "gsi-aerial",
        "date": "2024",
        "zoom": zoom,
        "gridSize": grid_size,
        "tileCenter": {"x": center_x, "y": center_y},
        "resolution_m": 0.25,
        "imageSize": {"width": result.size[0], "height": result.size[1]},
    }
    meta_path = str(Path(output_dir) / f"{slug}.meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    return output_path


def download_from_json(slug: str, output_dir: str) -> str | None:
    """構造JSONのstructureEndpointsから自動計算して取得"""
    data = load_structure_data(slug)
    if not data:
        print(f"  エラー: {slug}.json が見つかりません")
        return None

    endpoints = data.get("structureEndpoints")
    if not endpoints:
        # endpointsがない場合はcoordinatesとデフォルトgridで取得
        coords = data.get("coordinates", {})
        lat = coords.get("lat")
        lng = coords.get("lng")
        if not lat or not lng:
            print(f"  エラー: {slug} に座標情報がありません")
            return None
        print(f"  structureEndpointsなし → coordinates + gridSize=6 で取得")
        return download_spot_image(slug, lat, lng, 18, 6, output_dir)

    west = endpoints["west"]
    east = endpoints["east"]
    lat, lng, grid = calc_params_from_endpoints(west, east)

    print(f"  西端: ({west['lat']}, {west['lng']})")
    print(f"  東端: ({east['lat']}, {east['lng']})")
    print(f"  → 中心: ({lat:.4f}, {lng:.4f}), gridSize: {grid}")

    return download_spot_image(slug, lat, lng, 18, grid, output_dir)


def main():
    output_dir = str(Path(__file__).parent / "satellite")

    if len(sys.argv) >= 4:
        # 手動指定モード（従来互換）
        slug = sys.argv[1]
        lat = float(sys.argv[2])
        lng = float(sys.argv[3])
        zoom = int(sys.argv[4]) if len(sys.argv) > 4 else 18
        grid = int(sys.argv[5]) if len(sys.argv) > 5 else 6

        print(f"=== GSI航空写真取得（手動）: {slug} ===")
        download_spot_image(slug, lat, lng, zoom, grid, output_dir)

    elif len(sys.argv) == 2 and sys.argv[1] == "--all":
        # 全スポット一括取得（JSONから自動計算）
        if not STRUCTURES_DIR.exists():
            print("エラー: structures ディレクトリが見つかりません")
            return

        files = sorted(STRUCTURES_DIR.glob("*.json"))
        print(f"=== 全スポットの航空写真を取得（{len(files)}件） ===\n")

        for json_file in files:
            slug = json_file.stem
            print(f"\n[{slug}]")
            download_from_json(slug, output_dir)
            print()

        print("=== 完了 ===")

    elif len(sys.argv) == 2:
        # slug指定 → JSONから自動計算
        slug = sys.argv[1]
        print(f"=== GSI航空写真取得（自動）: {slug} ===")
        download_from_json(slug, output_dir)

    else:
        print("使用方法:")
        print("  自動（JSON）: python download_aerial.py <slug>")
        print("  全スポット:   python download_aerial.py --all")
        print("  手動指定:     python download_aerial.py <slug> <lat> <lng> [zoom] [grid_size]")


if __name__ == "__main__":
    main()
