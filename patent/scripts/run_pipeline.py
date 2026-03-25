#!/usr/bin/env python3
"""
run_pipeline.py

SAM2 + CLIP 構造物検出パイプライン（実行用）
GSI航空写真を入力として、構造物を自動検出しJSONを出力する。

使用方法:
    python run_pipeline.py                    # 全スポット処理
    python run_pipeline.py hiraiso-fishing-park  # 単一スポット処理
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime

import numpy as np
import torch
from PIL import Image

# ---------------------------------------------------------------------------
# 定数
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
SATELLITE_DIR = SCRIPT_DIR / "satellite"
MODEL_DIR = SCRIPT_DIR / "models"
OUTPUT_DIR = SCRIPT_DIR.parent / "data" / "structures"

SAM2_CHECKPOINT = MODEL_DIR / "sam2.1_hiera_base_plus.pt"
SAM2_CONFIG = "configs/sam2.1/sam2.1_hiera_b+.yaml"

# 9カテゴリのCLIPプロンプト
STRUCTURE_PROMPTS = {
    "seawall": [
        "a concrete seawall for fishing",
        "a vertical concrete wall along the coastline",
        "a fishing pier with concrete guardrails",
    ],
    "tetrapod": [
        "concrete tetrapod wave breakers",
        "tetrapod structures in the ocean",
        "wave-dissipating concrete blocks along the shore",
    ],
    "rocky": [
        "natural rocky coastline",
        "rocks and boulders along the shore",
        "a rocky reef underwater",
    ],
    "sandy": [
        "sandy beach shoreline",
        "flat sandy seabed visible through water",
        "a sandy beach area",
    ],
    "pier": [
        "a wooden or concrete fishing pier extending into the sea",
        "a jetty or pier structure",
        "a fishing platform over water",
    ],
    "port-facility": [
        "a port or harbor facility with boats",
        "harbor infrastructure with docks",
        "marina or port with moored boats",
    ],
    "other-structure": [
        "man-made coastal structure",
        "coastal infrastructure",
    ],
    "water": [
        "open ocean water surface",
        "calm sea water",
        "ocean or sea surface",
    ],
    "land": [
        "land area with buildings or roads",
        "terrestrial area with vegetation",
    ],
}

# 構造物 → 魚種マッピング
STRUCTURE_FISH_MAPPING = {
    "seawall": {
        "fish": [
            {"name": "アジ", "method": "サビキ釣り", "season": "5月〜11月"},
            {"name": "サバ", "method": "サビキ釣り", "season": "6月〜10月"},
            {"name": "イワシ", "method": "サビキ釣り", "season": "5月〜10月"},
            {"name": "スズキ", "method": "ルアー", "season": "3月〜12月"},
            {"name": "クロダイ", "method": "ウキフカセ", "season": "4月〜11月"},
        ],
    },
    "tetrapod": {
        "fish": [
            {"name": "メバル", "method": "メバリング", "season": "11月〜4月"},
            {"name": "カサゴ", "method": "穴釣り", "season": "通年"},
            {"name": "アイナメ", "method": "ブラクリ", "season": "10月〜3月"},
            {"name": "ソイ", "method": "穴釣り", "season": "通年"},
            {"name": "クロダイ", "method": "ヘチ釣り", "season": "4月〜11月"},
        ],
    },
    "rocky": {
        "fish": [
            {"name": "メジナ", "method": "ウキフカセ", "season": "10月〜5月"},
            {"name": "クロダイ", "method": "ウキフカセ", "season": "4月〜11月"},
            {"name": "アコウ", "method": "ルアー", "season": "6月〜9月"},
            {"name": "イシダイ", "method": "石鯛仕掛け", "season": "5月〜11月"},
        ],
    },
    "sandy": {
        "fish": [
            {"name": "カレイ", "method": "投げ釣り", "season": "10月〜3月"},
            {"name": "キス", "method": "ちょい投げ", "season": "5月〜10月"},
            {"name": "ヒラメ", "method": "泳がせ釣り", "season": "3月〜12月"},
        ],
    },
    "pier": {
        "fish": [
            {"name": "クロダイ", "method": "ヘチ釣り", "season": "4月〜11月"},
            {"name": "スズキ", "method": "ルアー", "season": "3月〜12月"},
            {"name": "メバル", "method": "メバリング", "season": "11月〜4月"},
            {"name": "アジ", "method": "アジング", "season": "5月〜11月"},
        ],
    },
    "port-facility": {
        "fish": [
            {"name": "アジ", "method": "サビキ釣り", "season": "5月〜11月"},
            {"name": "イワシ", "method": "サビキ釣り", "season": "5月〜10月"},
            {"name": "クロダイ", "method": "ウキ釣り", "season": "4月〜11月"},
            {"name": "スズキ", "method": "ルアー", "season": "3月〜12月"},
            {"name": "サバ", "method": "サビキ釣り", "season": "6月〜10月"},
        ],
    },
}

SPOTS = {
    "hiraiso-fishing-park": {
        "lat": 34.6264, "lng": 135.0661,
        "name": "平磯海づり公園", "seaLabel": "大阪湾",
        "layoutType": "seawall",
        "endpoints": {
            "west": {"lat": 34.6261, "lng": 135.0629},
            "east": {"lat": 34.6273, "lng": 135.0692},
        },
    },
    "akashi-port": {
        "lat": 34.6430, "lng": 134.9870,
        "name": "明石港", "seaLabel": "明石海峡",
        "layoutType": "port",
        "endpoints": {
            "west": {"lat": 34.6425, "lng": 134.9850},
            "east": {"lat": 34.6435, "lng": 134.9895},
        },
    },
    "akashi-shinhato": {
        "lat": 34.6387, "lng": 134.9773,
        "name": "明石新波止", "seaLabel": "明石海峡",
        "layoutType": "pier",
        "endpoints": {
            "west": {"lat": 34.6380, "lng": 134.9760},
            "east": {"lat": 34.6395, "lng": 134.9790},
        },
    },
    "handa-kou": {
        "lat": 34.8917, "lng": 136.9367,
        "name": "半田港", "seaLabel": "衣浦湾",
        "layoutType": "port",
        "endpoints": {
            "west": {"lat": 34.8910, "lng": 136.9350},
            "east": {"lat": 34.8925, "lng": 136.9385},
        },
    },
    "kamezaki-kou": {
        "lat": 34.8686, "lng": 136.9542,
        "name": "亀崎港", "seaLabel": "衣浦湾",
        "layoutType": "port",
        "endpoints": {
            "west": {"lat": 34.8680, "lng": 136.9530},
            "east": {"lat": 34.8692, "lng": 136.9555},
        },
    },
    "taketoyo-kou-ryokuchi": {
        "lat": 34.8500, "lng": 136.9167,
        "name": "武豊港緑地", "seaLabel": "衣浦湾",
        "layoutType": "port",
        "endpoints": {
            "west": {"lat": 34.8493, "lng": 136.9150},
            "east": {"lat": 34.8507, "lng": 136.9185},
        },
    },
}


# ---------------------------------------------------------------------------
# SAM2 セグメンテーション
# ---------------------------------------------------------------------------

def segment_with_sam2(image: np.ndarray) -> list[dict]:
    """SAM2による自動セグメンテーション"""
    from sam2.build_sam import build_sam2
    from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"  デバイス: {device}")

    sam2 = build_sam2(
        SAM2_CONFIG,
        str(SAM2_CHECKPOINT),
        device=device,
    )

    mask_generator = SAM2AutomaticMaskGenerator(
        model=sam2,
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


# ---------------------------------------------------------------------------
# CLIP 分類
# ---------------------------------------------------------------------------

def classify_with_clip(image: np.ndarray, masks: list[dict]) -> list[dict]:
    """CLIP分類: 各マスク領域を9カテゴリに分類"""
    import open_clip

    device = "cuda" if torch.cuda.is_available() else "cpu"

    model, _, preprocess = open_clip.create_model_and_transforms(
        "ViT-B-32", pretrained="openai"
    )
    tokenizer = open_clip.get_tokenizer("ViT-B-32")
    model = model.to(device)

    # テキストプロンプト事前エンコード
    categories = list(STRUCTURE_PROMPTS.keys())
    text_features_list = []

    for category in categories:
        prompts = STRUCTURE_PROMPTS[category]
        tokens = tokenizer(prompts).to(device)
        with torch.no_grad():
            text_features = model.encode_text(tokens)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            text_features_list.append(text_features.mean(dim=0))

    text_matrix = torch.stack(text_features_list)
    text_matrix = text_matrix / text_matrix.norm(dim=-1, keepdim=True)

    results = []
    h, w = image.shape[:2]

    for mask_data in masks:
        mask = mask_data["mask"]
        bbox = mask_data["bbox"]

        # マスク領域を切り出し
        x, y, bw, bh = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
        crop = image[y:y+bh, x:x+bw].copy()

        # マスク外を黒塗り
        mask_crop = mask[y:y+bh, x:x+bw]
        crop[~mask_crop] = 0

        # CLIP入力
        pil_crop = Image.fromarray(crop)
        img_tensor = preprocess(pil_crop).unsqueeze(0).to(device)

        with torch.no_grad():
            image_features = model.encode_image(img_tensor)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)

        similarity = (image_features @ text_matrix.T).squeeze(0)
        best_idx = similarity.argmax().item()
        confidence = float(similarity[best_idx].item())

        center_x = (bbox["x"] + bbox["width"] / 2) / w
        center_y = (bbox["y"] + bbox["height"] / 2) / h

        if center_y < 0.4:
            distance = "onshore"
        elif center_y < 0.55:
            distance = "near"
        elif center_y < 0.75:
            distance = "medium"
        else:
            distance = "far"

        results.append({
            "id": mask_data["id"],
            "category": categories[best_idx],
            "confidence": round(confidence, 3),
            "bbox": bbox,
            "areaRatio": round(mask_data["area_ratio"], 4),
            "relativePosition": round(center_x, 3),
            "distanceFromShore": distance,
        })

    return results


# ---------------------------------------------------------------------------
# ゾーン生成 + 魚種推定
# ---------------------------------------------------------------------------

def generate_zones(structures: list[dict], image_width: int) -> list[dict]:
    """検出構造物からゾーンを自動生成"""
    # 護岸/桟橋を基準構造物とする
    base_structs = [
        s for s in structures
        if s["category"] in ("seawall", "pier", "port-facility")
    ]
    if not base_structs:
        # 護岸がない場合は全構造物で
        base_structs = [s for s in structures if s["category"] not in ("water", "land")]

    if not base_structs:
        return []

    min_x = min(s["bbox"]["x"] for s in base_structs) / image_width
    max_x = max(
        (s["bbox"]["x"] + s["bbox"]["width"]) for s in base_structs
    ) / image_width

    # ゾーン数を決定
    unique_cats = set(s["category"] for s in structures if s["category"] not in ("water", "land"))
    zone_count = min(8, max(4, len(unique_cats) + 2))

    zone_width = (max_x - min_x) / zone_count
    zones = []
    zone_names = ["西端", "西寄り", "中央西", "中央", "中央東", "東寄り", "東端", "最東端"]

    for i in range(zone_count):
        x_start = min_x + i * zone_width
        x_end = min_x + (i + 1) * zone_width

        # このゾーンに含まれる構造物
        zone_structs = [
            s for s in structures
            if s["category"] not in ("water", "land")
            and (s["bbox"]["x"] / image_width) < x_end
            and ((s["bbox"]["x"] + s["bbox"]["width"]) / image_width) > x_start
        ]

        zone_categories = list(set(s["category"] for s in zone_structs))

        # 潮通しスコア
        zone_center = (x_start + x_end) / 2
        edge_dist = min(abs(zone_center - min_x), abs(zone_center - max_x))
        max_edge = (max_x - min_x) / 2
        current_flow = round(
            0.5 + 0.5 * (1 - edge_dist / max_edge) if max_edge > 0 else 0.5,
            2,
        )

        # 海底地物を構造物から推定
        sea_bottom = []
        for s in zone_structs:
            if s["category"] == "tetrapod":
                if "tetrapod" not in sea_bottom:
                    sea_bottom.append("tetrapod")
            elif s["category"] == "rocky":
                if "rocky-bottom" not in sea_bottom:
                    sea_bottom.append("rocky-bottom")

        # 魚種推定（おすすめ度スコアに変更：★1-5の根拠）
        estimated_fish = estimate_fish(zone_categories, current_flow)

        # 水深推定（構造物タイプ別のデフォルト + ランダム幅）
        depth = estimate_depth(zone_categories, i, zone_count)

        # rating
        if current_flow >= 0.8 and len(estimated_fish) >= 5:
            rating = "hot"
        elif len(estimated_fish) >= 3 or current_flow >= 0.7:
            rating = "good"
        else:
            rating = "normal"

        name = zone_names[i] if i < len(zone_names) else f"ゾーン{i+1}"

        zones.append({
            "id": f"zone-{i}",
            "name": f"{name}エリア",
            "xRange": [round(x_start, 3), round(x_end, 3)],
            "structures": zone_categories,
            "seaBottomFeatures": sea_bottom,
            "estimatedDepth": depth,
            "currentFlow": current_flow,
            "estimatedFish": estimated_fish,
            "rating": rating,
        })

    return zones


def estimate_depth(categories: list[str], zone_idx: int, total_zones: int) -> dict:
    """構造物タイプと位置から水深を推定（デフォルト値、実測ではない）"""
    base_shore = 3.0
    base_offshore = 5.0

    if "tetrapod" in categories:
        base_shore += 1.5
        base_offshore += 2.0
    if "rocky" in categories:
        base_shore += 2.0
        base_offshore += 3.0
    if "pier" in categories:
        base_shore += 1.0
        base_offshore += 2.5

    # 端は少し深い傾向
    edge_factor = 1.0 + 0.15 * (1.0 - abs(zone_idx - total_zones / 2) / (total_zones / 2))

    return {
        "shore": round(base_shore * edge_factor, 1),
        "offshore": round(base_offshore * edge_factor, 1),
    }


def estimate_fish(categories: list[str], current_flow: float) -> list[dict]:
    """
    構造物カテゴリから推定魚種リストを生成。

    おすすめ度（旧: probability）は5段階:
    - 0.9+  = ★★★★★ その構造物の主要ターゲット
    - 0.7-0.9 = ★★★★  よく釣れる
    - 0.5-0.7 = ★★★   時期が合えば
    - 0.3-0.5 = ★★     難易度高め
    - <0.3    = ★      稀に釣れる程度
    """
    fish_scores: dict[str, dict] = {}

    for cat in categories:
        mapping = STRUCTURE_FISH_MAPPING.get(cat)
        if not mapping:
            continue
        for i, fish_info in enumerate(mapping["fish"]):
            name = fish_info["name"]
            # おすすめ度は構造物との適合性（1番目=最適）
            base = 0.85 - i * 0.15
            # 複数構造物で重複する魚は少しボーナス
            if name in fish_scores:
                fish_scores[name]["score"] = min(1.0, fish_scores[name]["score"] + 0.1)
            else:
                fish_scores[name] = {
                    "score": max(0.2, base),
                    "method": fish_info["method"],
                    "season": fish_info["season"],
                }

    # スコア順にソート
    sorted_fish = sorted(fish_scores.items(), key=lambda x: -x[1]["score"])

    result = []
    for name, info in sorted_fish[:8]:
        difficulty = "easy" if info["score"] >= 0.7 else "medium" if info["score"] >= 0.4 else "hard"
        result.append({
            "name": name,
            "probability": round(info["score"], 2),
            "season": info["season"],
            "method": info["method"],
            "difficulty": difficulty,
        })

    return result


# ---------------------------------------------------------------------------
# メイン処理
# ---------------------------------------------------------------------------

def process_spot(slug: str) -> dict | None:
    """1スポットを処理"""
    spot = SPOTS.get(slug)
    if not spot:
        print(f"  エラー: スポット '{slug}' が見つかりません")
        return None

    image_path = SATELLITE_DIR / f"{slug}.jpg"
    if not image_path.exists():
        print(f"  エラー: 画像が見つかりません: {image_path}")
        return None

    # メタデータ読み込み
    meta_path = SATELLITE_DIR / f"{slug}.meta.json"
    image_meta = {}
    if meta_path.exists():
        with open(meta_path, "r") as f:
            image_meta = json.load(f)

    # 1. 画像読み込み
    print("  [1/4] 画像読み込み...")
    image = np.array(Image.open(str(image_path)).convert("RGB"))
    h, w = image.shape[:2]
    print(f"    サイズ: {w}x{h}")

    # 2. SAM2セグメンテーション
    print("  [2/4] SAM2セグメンテーション...")
    masks = segment_with_sam2(image)
    print(f"    検出マスク数: {len(masks)}")

    # 3. CLIP分類
    print("  [3/4] CLIP構造物分類...")
    structures = classify_with_clip(image, masks)

    # カテゴリサマリー
    cat_summary = {}
    for s in structures:
        cat = s["category"]
        cat_summary[cat] = cat_summary.get(cat, 0) + 1
    print(f"    分類結果: {cat_summary}")

    # 水とland以外の構造物のconfidenceサマリー
    real_structs = [s for s in structures if s["category"] not in ("water", "land")]
    if real_structs:
        avg_conf = sum(s["confidence"] for s in real_structs) / len(real_structs)
        print(f"    構造物平均confidence: {avg_conf:.3f}")

    # 4. ゾーン生成
    print("  [4/4] ゾーン生成・魚種推定...")
    zones = generate_zones(structures, w)
    print(f"    ゾーン数: {len(zones)}")

    # 結果構築
    result = {
        "spotSlug": slug,
        "coordinates": {"lat": spot["lat"], "lng": spot["lng"]},
        "imageMetadata": {
            "source": image_meta.get("source", "gsi-aerial"),
            "date": image_meta.get("date", "2024"),
            "resolution": image_meta.get("resolution_m", 0.25),
            "imageSize": {"width": w, "height": h},
        },
        "layoutType": spot["layoutType"],
        "structureEndpoints": spot["endpoints"],
        "structureLabel": "護岸",
        "seaLabel": spot["seaLabel"],
        "detectedStructures": [
            {k: v for k, v in s.items() if k != "mask"}
            for s in structures
            if s["category"] not in ("water", "land")
        ],
        "seaBottomFeatures": [],
        "zones": zones,
        "facilities": [],
        "structureLength": 0,
        "analyzedAt": datetime.now().isoformat(),
        "pipelineVersion": "1.0.0",
    }

    # 全魚種サマリー
    all_fish = set()
    for z in zones:
        for f in z["estimatedFish"]:
            all_fish.add(f["name"])
    print(f"    推定魚種: {len(all_fish)}種 ({', '.join(sorted(all_fish))})")

    return result


def main():
    print("=" * 60)
    print("特許パイプライン: SAM2 + CLIP 構造物自動検出")
    print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
    print(f"SAM2チェックポイント: {SAM2_CHECKPOINT}")
    print("=" * 60)

    if not SAM2_CHECKPOINT.exists():
        print(f"\nエラー: SAM2チェックポイントが見つかりません: {SAM2_CHECKPOINT}")
        print("ダウンロード: python download_aerial.py でモデルを取得してください")
        sys.exit(1)

    # 処理対象スポットを決定
    if len(sys.argv) > 1:
        slugs = [sys.argv[1]]
    else:
        # 画像がある全スポットを処理
        slugs = [
            slug for slug in SPOTS
            if (SATELLITE_DIR / f"{slug}.jpg").exists()
        ]

    if not slugs:
        print("処理対象のスポットがありません。先に航空写真をダウンロードしてください。")
        print("  python download_aerial.py --all")
        sys.exit(1)

    print(f"\n処理対象: {len(slugs)}スポット\n")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for slug in slugs:
        print(f"\n{'='*40}")
        print(f"[{SPOTS[slug]['name']}] {slug}")
        print(f"{'='*40}")

        result = process_spot(slug)
        if result:
            output_path = OUTPUT_DIR / f"{slug}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"\n  出力: {output_path}")

    print(f"\n{'='*60}")
    print("全スポット処理完了")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
