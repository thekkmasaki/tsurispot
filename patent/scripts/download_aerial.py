#!/usr/bin/env python3
"""
download_aerial.py

国土地理院（GSI）航空写真タイルから高解像度画像を取得。
Sentinel-2（10m解像度）ではテトラポッド検出不可のため、
GSI航空写真（〜0.25m解像度）を使用。

使用方法:
    python download_aerial.py <spot_slug> <lat> <lng> [zoom] [grid_size]

例:
    python download_aerial.py hiraiso-fishing-park 34.6264 135.0661 18 6
"""

import sys
import os
import math
import json
from pathlib import Path
from urllib.request import urlopen, Request
from io import BytesIO

import numpy as np
from PIL import Image


# GSI航空写真タイルURL
GSI_TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"

# 6スポットの座標
SPOTS = {
    "hiraiso-fishing-park": {"lat": 34.6264, "lng": 135.0661, "name": "平磯海づり公園"},
    "akashi-port": {"lat": 34.6430, "lng": 134.9870, "name": "明石港"},
    "akashi-shinhato": {"lat": 34.6387, "lng": 134.9773, "name": "明石新波止"},
    "handa-kou": {"lat": 34.8917, "lng": 136.9367, "name": "半田港"},
    "kamezaki-kou": {"lat": 34.8686, "lng": 136.9542, "name": "亀崎港"},
    "taketoyo-kou-ryokuchi": {"lat": 34.8500, "lng": 136.9167, "name": "武豊港緑地"},
}


def latlng_to_tile(lat: float, lng: float, zoom: int) -> tuple[int, int]:
    """緯度経度 → タイル座標変換"""
    n = 2 ** zoom
    x = int((lng + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    y = int((1.0 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2.0 * n)
    return x, y


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
    """
    指定座標周辺のGSI航空写真タイルを取得し、1枚に結合。

    Args:
        slug: スポットスラッグ
        lat, lng: 中心座標
        zoom: ズームレベル（18推奨、〜0.25m/px）
        grid_size: タイルグリッドサイズ（6 → 6x6=36タイル、約1.5km四方）
        output_dir: 出力ディレクトリ

    Returns:
        出力画像パス
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    center_x, center_y = latlng_to_tile(lat, lng, zoom)
    half = grid_size // 2

    print(f"  中心タイル: z={zoom} x={center_x} y={center_y}")
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
        "date": "2024",  # GSI航空写真の撮影時期は不明確だが概ね近年
        "zoom": zoom,
        "gridSize": grid_size,
        "tileCenter": {"x": center_x, "y": center_y},
        "resolution_m": 0.25,  # zoom 18 概算
        "imageSize": {"width": result.size[0], "height": result.size[1]},
    }
    meta_path = str(Path(output_dir) / f"{slug}.meta.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    return output_path


def main():
    if len(sys.argv) >= 4:
        # 引数指定モード
        slug = sys.argv[1]
        lat = float(sys.argv[2])
        lng = float(sys.argv[3])
        zoom = int(sys.argv[4]) if len(sys.argv) > 4 else 18
        grid = int(sys.argv[5]) if len(sys.argv) > 5 else 6
        output_dir = str(Path(__file__).parent / "satellite")

        print(f"=== GSI航空写真取得: {slug} ===")
        download_spot_image(slug, lat, lng, zoom, grid, output_dir)

    elif len(sys.argv) == 1 or sys.argv[1] == "--all":
        # 全スポット一括取得
        output_dir = str(Path(__file__).parent / "satellite")
        print("=== 全スポットの航空写真を取得 ===\n")

        for slug, info in SPOTS.items():
            print(f"\n[{info['name']}] {slug}")
            download_spot_image(
                slug, info["lat"], info["lng"],
                zoom=18, grid_size=6, output_dir=output_dir
            )
            print()

        print("=== 完了 ===")

    else:
        print("使用方法:")
        print("  全スポット: python download_aerial.py --all")
        print("  単体: python download_aerial.py <slug> <lat> <lng> [zoom] [grid_size]")


if __name__ == "__main__":
    main()
