#!/usr/bin/env python3
"""
detect_structures.py

特許パイプライン: 衛星画像からの構造物自動検出
特願2026-042836「衛星画像解析による釣り場ポイント情報自動生成システム」

パイプラインフロー:
  1. 衛星画像取得（Sentinel-2 or Google Maps Static API）
  2. SAM2セグメンテーション → マスク群生成
  3. CLIP分類 → 各マスクを9カテゴリに分類
  4. 後処理 → 構造物の位置・範囲・カテゴリをJSON出力
  5. ゾーン分割 → 構造物配置に基づくゾーン生成
  6. 魚種推定 → 構造物×環境データ → 推定魚種

実行環境: GPU必須（Google Colab Pro or ローカルGPU）
"""

import json
import sys
import os
from pathlib import Path
from typing import TypedDict, Literal

import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# 型定義
# ---------------------------------------------------------------------------

StructureCategory = Literal[
    "seawall", "tetrapod", "rocky", "sandy", "pier",
    "port-facility", "other-structure", "water", "land"
]

# CLIP分類用のテキストプロンプト（9カテゴリ）
STRUCTURE_PROMPTS: dict[StructureCategory, list[str]] = {
    "seawall": [
        "a concrete seawall for fishing",
        "a vertical concrete wall along the coastline",
        "a fishing pier with concrete guardrails",
    ],
    "tetrapod": [
        "concrete tetrapod wave breakers",
        "tetrapod structures in the ocean",
        "wave-dissipating concrete blocks",
    ],
    "rocky": [
        "natural rocky coastline",
        "rocky reef formation",
        "natural rock formations along the shore",
    ],
    "sandy": [
        "sandy beach shoreline",
        "sand dunes along the coast",
        "flat sandy beach",
    ],
    "pier": [
        "a wooden or concrete fishing pier",
        "a jetty extending into the water",
        "a dock structure for fishing",
    ],
    "port-facility": [
        "a port or harbor facility",
        "fishing port buildings and structures",
        "harbor infrastructure with boats",
    ],
    "other-structure": [
        "man-made coastal structure",
        "bridge or water gate structure",
        "artificial coastal construction",
    ],
    "water": [
        "open ocean water surface",
        "calm sea water",
        "blue ocean surface",
    ],
    "land": [
        "land area with buildings",
        "parking lot or road near coast",
        "terrestrial area with vegetation",
    ],
}

# 構造物 → 魚種マッピング（特許明細書【0031】準拠）
STRUCTURE_FISH_MAPPING: dict[StructureCategory, dict] = {
    "seawall": {
        "fish": ["アジ", "サバ", "イワシ", "スズキ", "クロダイ"],
        "methods": ["サビキ釣り", "ウキ釣り", "ちょい投げ"],
    },
    "tetrapod": {
        "fish": ["メバル", "カサゴ", "アイナメ", "ソイ", "クロダイ"],
        "methods": ["穴釣り", "メバリング", "ヘチ釣り"],
    },
    "rocky": {
        "fish": ["メジナ", "クロダイ", "アコウ", "イシダイ"],
        "methods": ["ウキ釣り", "フカセ釣り", "カゴ釣り"],
    },
    "sandy": {
        "fish": ["カレイ", "キス", "ヒラメ"],
        "methods": ["投げ釣り", "ちょい投げ", "サーフキャスティング"],
    },
    "pier": {
        "fish": ["クロダイ", "スズキ", "メバル", "アジ"],
        "methods": ["ヘチ釣り", "ウキ釣り", "サビキ釣り"],
    },
    "port-facility": {
        "fish": ["アジ", "イワシ", "クロダイ", "スズキ", "サバ"],
        "methods": ["サビキ釣り", "ウキ釣り", "アジング"],
    },
    "other-structure": {
        "fish": ["アジ", "クロダイ"],
        "methods": ["サビキ釣り", "ウキ釣り"],
    },
    "water": {"fish": [], "methods": []},
    "land": {"fish": [], "methods": []},
}


class DetectionResult(TypedDict):
    id: str
    category: StructureCategory
    confidence: float
    bbox: dict
    areaRatio: float
    relativePosition: float
    distanceFromShore: str


def load_satellite_image(image_path: str) -> np.ndarray:
    """衛星画像を読み込み、numpy配列として返す。"""
    img = Image.open(image_path).convert("RGB")
    return np.array(img)


def segment_with_sam2(image: np.ndarray) -> list[dict]:
    """
    SAM2による自動セグメンテーション。
    画像を意味のある領域（マスク）に分割する。

    Returns:
        list of {"mask": np.ndarray, "bbox": dict, "area": float, "score": float}
    """
    try:
        from segment_anything_2 import SAM2AutomaticMaskGenerator, sam2_model_registry
    except ImportError:
        print("SAM2未インストール。pip install segment-anything-2 を実行してください。")
        print("代替: segment-geospatial パッケージも使用可能。")
        sys.exit(1)

    # SAM2モデルのロード
    model_type = "vit_h"
    checkpoint = os.environ.get("SAM2_CHECKPOINT", "sam2_hiera_large.pt")

    sam = sam2_model_registry[model_type](checkpoint=checkpoint)
    mask_generator = SAM2AutomaticMaskGenerator(
        model=sam,
        points_per_side=32,
        pred_iou_thresh=0.7,
        stability_score_thresh=0.85,
        min_mask_region_area=500,
    )

    masks = mask_generator.generate(image)

    results = []
    h, w = image.shape[:2]
    total_area = h * w

    for i, mask_data in enumerate(masks):
        mask = mask_data["segmentation"]
        bbox = mask_data["bbox"]  # [x, y, w, h]
        area = mask_data["area"]

        results.append({
            "id": f"mask-{i:03d}",
            "mask": mask,
            "bbox": {
                "x": int(bbox[0]),
                "y": int(bbox[1]),
                "width": int(bbox[2]),
                "height": int(bbox[3]),
            },
            "area_ratio": area / total_area,
            "score": float(mask_data["predicted_iou"]),
        })

    return results


def classify_with_clip(
    image: np.ndarray,
    masks: list[dict],
) -> list[DetectionResult]:
    """
    CLIP分類: 各マスク領域を9カテゴリに分類。

    各マスクで切り出した画像パッチをCLIPに入力し、
    9カテゴリのテキストプロンプトとのcos類似度で分類する。
    """
    try:
        import open_clip
    except ImportError:
        print("open-clip未インストール。pip install open-clip-torch を実行してください。")
        sys.exit(1)

    import torch

    # CLIPモデルのロード
    model, _, preprocess = open_clip.create_model_and_transforms(
        "ViT-B-32", pretrained="openai"
    )
    tokenizer = open_clip.get_tokenizer("ViT-B-32")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)

    # テキストプロンプトの事前エンコード
    text_features_dict: dict[StructureCategory, torch.Tensor] = {}
    for category, prompts in STRUCTURE_PROMPTS.items():
        tokens = tokenizer(prompts).to(device)
        with torch.no_grad():
            text_features = model.encode_text(tokens)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            text_features_dict[category] = text_features.mean(dim=0)

    # 全カテゴリのテキスト特徴を1つのテンソルに
    categories = list(STRUCTURE_PROMPTS.keys())
    text_matrix = torch.stack([text_features_dict[c] for c in categories])
    text_matrix = text_matrix / text_matrix.norm(dim=-1, keepdim=True)

    results: list[DetectionResult] = []
    h, w = image.shape[:2]

    for mask_data in masks:
        mask = mask_data["mask"]
        bbox = mask_data["bbox"]

        # マスク領域を切り出し
        x, y, bw, bh = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
        crop = image[y : y + bh, x : x + bw].copy()

        # マスク外を黒塗り（背景除去）
        mask_crop = mask[y : y + bh, x : x + bw]
        crop[~mask_crop] = 0

        # CLIP入力画像に変換
        pil_crop = Image.fromarray(crop)
        img_tensor = preprocess(pil_crop).unsqueeze(0).to(device)

        # 画像特徴量の抽出
        with torch.no_grad():
            image_features = model.encode_image(img_tensor)
            image_features = image_features / image_features.norm(
                dim=-1, keepdim=True
            )

        # cos類似度で分類
        similarity = (image_features @ text_matrix.T).squeeze(0)
        best_idx = similarity.argmax().item()
        confidence = similarity[best_idx].item()

        # 相対位置の計算（構造物長に対する水平位置）
        center_x = (bbox["x"] + bbox["width"] / 2) / w
        center_y = (bbox["y"] + bbox["height"] / 2) / h

        # 海岸線からの距離カテゴリ（Y座標ベース）
        if center_y < 0.4:
            distance = "onshore"
        elif center_y < 0.55:
            distance = "near"
        elif center_y < 0.75:
            distance = "medium"
        else:
            distance = "far"

        results.append(
            DetectionResult(
                id=mask_data["id"],
                category=categories[best_idx],
                confidence=float(confidence),
                bbox=bbox,
                areaRatio=mask_data["area_ratio"],
                relativePosition=center_x,
                distanceFromShore=distance,
            )
        )

    return results


def generate_zones(
    structures: list[DetectionResult],
    image_width: int,
) -> list[dict]:
    """
    検出された構造物の配置からゾーンを自動生成。

    アルゴリズム:
    1. 構造物の水平範囲を分析
    2. 変化点（構造物種類の切り替わり）でゾーン境界を設定
    3. 各ゾーンに含まれる構造物と海底地物を集約
    4. 潮通しスコア（端ほど高い）を計算
    5. 構造物→魚種マッピングで推定魚種を付与
    """
    # 主要構造物（護岸）の水平範囲を取得
    seawall_structs = [
        s for s in structures if s["category"] in ("seawall", "pier")
    ]
    if not seawall_structs:
        return []

    # 全構造物の水平範囲
    min_x = min(s["bbox"]["x"] for s in seawall_structs) / image_width
    max_x = max(
        (s["bbox"]["x"] + s["bbox"]["width"]) for s in seawall_structs
    ) / image_width

    # ゾーン数を構造物の多様性から決定（5-8ゾーン）
    unique_categories = set(s["category"] for s in structures)
    zone_count = min(8, max(5, len(unique_categories) + 2))

    zone_width = (max_x - min_x) / zone_count
    zones = []

    for i in range(zone_count):
        x_start = min_x + i * zone_width
        x_end = min_x + (i + 1) * zone_width

        # このゾーンに含まれる構造物
        zone_structs = [
            s for s in structures
            if (s["bbox"]["x"] / image_width) < x_end
            and ((s["bbox"]["x"] + s["bbox"]["width"]) / image_width) > x_start
        ]

        zone_categories = list(set(s["category"] for s in zone_structs))

        # 潮通しスコア（端ほど高い）
        zone_center = (x_start + x_end) / 2
        edge_distance = min(
            abs(zone_center - min_x), abs(zone_center - max_x)
        )
        max_edge = (max_x - min_x) / 2
        current_flow = 0.5 + 0.5 * (1 - edge_distance / max_edge) if max_edge > 0 else 0.5

        # 構造物 → 魚種推定
        estimated_fish = estimate_fish_for_zone(zone_categories, current_flow)

        # 評価
        if current_flow >= 0.85 and len(estimated_fish) >= 6:
            rating = "hot"
        elif len(estimated_fish) >= 4 or current_flow >= 0.7:
            rating = "good"
        else:
            rating = "normal"

        zones.append({
            "id": f"zone-{i}",
            "name": f"ゾーン{i + 1}",
            "xRange": [round(x_start, 3), round(x_end, 3)],
            "structures": zone_categories,
            "seaBottomFeatures": [],  # 海底地物は別途推定
            "estimatedDepth": {"shore": 4, "offshore": 6},
            "currentFlow": round(current_flow, 2),
            "estimatedFish": estimated_fish,
            "rating": rating,
        })

    return zones


def estimate_fish_for_zone(
    structure_categories: list[StructureCategory],
    current_flow: float,
) -> list[dict]:
    """
    構造物カテゴリと潮通しから、ゾーン内の推定魚種リストを生成。
    特許の「魚種推定部(130)」に相当。
    """
    fish_scores: dict[str, float] = {}
    methods_map: dict[str, str] = {}

    for category in structure_categories:
        mapping = STRUCTURE_FISH_MAPPING.get(category, {"fish": [], "methods": []})
        for i, fish_name in enumerate(mapping["fish"]):
            # 基本スコア（構造物との関連度）
            base_score = 0.9 - i * 0.1
            # 潮通しボーナス
            flow_bonus = current_flow * 0.15
            score = min(1.0, base_score + flow_bonus)

            if fish_name not in fish_scores or fish_scores[fish_name] < score:
                fish_scores[fish_name] = score
                if mapping["methods"]:
                    methods_map[fish_name] = mapping["methods"][
                        min(i, len(mapping["methods"]) - 1)
                    ]

    # スコア順にソートして返す
    result = []
    for fish_name, score in sorted(
        fish_scores.items(), key=lambda x: -x[1]
    ):
        result.append({
            "name": fish_name,
            "method": methods_map.get(fish_name, "サビキ釣り"),
            "season": "通年",  # 季節データは別途統合
            "difficulty": "easy" if score > 0.8 else "medium" if score > 0.5 else "hard",
            "probability": round(score, 2),
        })

    return result


def build_analysis_result(
    spot_slug: str,
    lat: float,
    lng: float,
    structures: list[DetectionResult],
    zones: list[dict],
    image_metadata: dict,
) -> dict:
    """最終的なSpotAnalysisResult JSONを構築。"""
    # レイアウトタイプの推定
    category_counts: dict[str, int] = {}
    for s in structures:
        cat = s["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1

    if "pier" in category_counts:
        layout = "pier"
    elif "sandy" in category_counts:
        layout = "beach"
    elif "port-facility" in category_counts:
        layout = "port"
    else:
        layout = "seawall"

    return {
        "spotSlug": spot_slug,
        "coordinates": {"lat": lat, "lng": lng},
        "imageMetadata": image_metadata,
        "layoutType": layout,
        "structureLabel": "護岸",
        "seaLabel": "",
        "detectedStructures": structures,
        "seaBottomFeatures": [],
        "zones": zones,
        "facilities": [],
        "structureLength": 0,
        "positionCount": max(8, min(20, len(zones) * 2)),
        "analyzedAt": "",
        "pipelineVersion": "0.1.0",
    }


def main():
    """
    メイン実行エントリポイント。

    使用方法:
        python detect_structures.py <image_path> <spot_slug> <lat> <lng> [output_dir]

    例:
        python detect_structures.py satellite/hiraiso.webp hiraiso-fishing-park 34.6264 135.0661 output/
    """
    if len(sys.argv) < 5:
        print("使用方法: python detect_structures.py <image_path> <spot_slug> <lat> <lng> [output_dir]")
        sys.exit(1)

    image_path = sys.argv[1]
    spot_slug = sys.argv[2]
    lat = float(sys.argv[3])
    lng = float(sys.argv[4])
    output_dir = sys.argv[5] if len(sys.argv) > 5 else "output"

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    print(f"=== 特許パイプライン: 構造物検出 ===")
    print(f"対象: {spot_slug} ({lat}, {lng})")
    print(f"画像: {image_path}")
    print()

    # 1. 画像読み込み
    print("[1/4] 衛星画像読み込み中...")
    image = load_satellite_image(image_path)
    h, w = image.shape[:2]
    print(f"  画像サイズ: {w}x{h}")

    # 2. SAM2セグメンテーション
    print("[2/4] SAM2セグメンテーション実行中...")
    masks = segment_with_sam2(image)
    print(f"  検出マスク数: {len(masks)}")

    # 3. CLIP分類
    print("[3/4] CLIP構造物分類中...")
    structures = classify_with_clip(image, masks)
    category_summary = {}
    for s in structures:
        cat = s["category"]
        category_summary[cat] = category_summary.get(cat, 0) + 1
    print(f"  分類結果: {category_summary}")

    # 4. ゾーン生成 + 魚種推定
    print("[4/4] ゾーン生成・魚種推定中...")
    zones = generate_zones(structures, w)
    print(f"  ゾーン数: {len(zones)}")

    # 結果出力
    image_metadata = {
        "source": "sentinel-2",
        "date": "",
        "resolution": 10,
        "imageSize": {"width": w, "height": h},
    }

    result = build_analysis_result(
        spot_slug, lat, lng, structures, zones, image_metadata
    )

    output_path = Path(output_dir) / f"{spot_slug}.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n=== 完了 ===")
    print(f"出力: {output_path}")
    print(f"構造物: {len(structures)}件")
    print(f"ゾーン: {len(zones)}件")

    # 全ゾーンの推定魚種数をサマリー
    total_fish = set()
    for z in zones:
        for f in z["estimatedFish"]:
            total_fish.add(f["name"])
    print(f"推定魚種: {len(total_fish)}種 ({', '.join(sorted(total_fish))})")


if __name__ == "__main__":
    main()
