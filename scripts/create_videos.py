#!/usr/bin/env python3
"""
TsuriSpot SNS Video Generator v2 - BUZZ EDITION
Instagram Reels用 バズる縦長動画10本を自動生成
"""

import os
import math
import time
import random
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from moviepy import VideoClip

# === Constants ===
W, H = 1080, 1920
FPS = 30
FONT_BOLD = "C:/Windows/Fonts/meiryob.ttc"
FONT_REGULAR = "C:/Windows/Fonts/meiryo.ttc"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
LOGO_PATH = os.path.join(PROJECT_DIR, "public", "icon-512.png")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "sns-videos")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
ACCENT = (255, 140, 0)       # Orange
CYAN = (3, 105, 161)
DEEP = (15, 23, 42)
NEON_GREEN = (0, 255, 136)
HOT_PINK = (255, 50, 100)
GOLD = (255, 215, 0)
RED = (239, 68, 68)
LIGHT = (200, 215, 235)

# Assets
logo_original = Image.open(LOGO_PATH).convert("RGBA")
logo_sm = logo_original.resize((70, 70), Image.LANCZOS)

_fc = {}
def font(size, bold=True):
    k = (size, bold)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)
    return _fc[k]


# ============================================================
#  EFFECTS ENGINE
# ============================================================

def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3

def ease_back(t):
    t = max(0.0, min(1.0, t))
    c = 2.5
    return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2

def ease_elastic(t):
    t = max(0.0, min(1.0, t))
    if t == 0 or t == 1:
        return t
    return 2 ** (-13 * t) * math.sin((t * 10 - 0.75) * 2.094) + 1

def lerp(a, b, t):
    return a + (b - a) * t

def grad(w, h, c1, c2):
    r = np.linspace(0, 1, h, dtype=np.float32).reshape(h, 1, 1)
    g = np.array(c1, dtype=np.float32) + (np.array(c2, dtype=np.float32) - np.array(c1, dtype=np.float32)) * r
    return np.broadcast_to(g, (h, w, 3)).astype(np.uint8).copy()

def tsize(draw, text, f):
    bb = draw.textbbox((0, 0), text, font=f)
    return bb[2] - bb[0], bb[3] - bb[1]

def dcenter(draw, text, y, f, fill=WHITE):
    tw, _ = tsize(draw, text, f)
    draw.text(((W - tw) // 2, y), text, font=f, fill=fill)

def dshadow(draw, text, y, f, fill=WHITE, ox=5, oy=5):
    tw, _ = tsize(draw, text, f)
    x = (W - tw) // 2
    draw.text((x + ox, y + oy), text, font=f, fill=(0, 0, 0))
    draw.text((x, y), text, font=f, fill=fill)

def watermark(img):
    rgba = img.convert("RGBA")
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    lc = logo_sm.copy()
    a = lc.split()[3].point(lambda p: int(p * 0.3))
    lc.putalpha(a)
    ov.paste(lc, (W - 100, 50), lc)
    d = ImageDraw.Draw(ov)
    d.text((W - 280, 125), "@tsurispotjapan", font=font(22, False), fill=(255, 255, 255, 70))
    return Image.alpha_composite(rgba, ov).convert("RGB")

def flash(img, t, triggers, dur=0.08):
    """White flash at trigger times."""
    intensity = 0
    for tr in triggers:
        dt = t - tr
        if 0 <= dt < dur:
            intensity = max(intensity, 1.0 - dt / dur)
    if intensity > 0:
        white = Image.new("RGB", (W, H), WHITE)
        return Image.blend(img, white, intensity * 0.85)
    return img

def shake_offset(t, triggers, power=18, decay=0.15):
    """Screen shake offset at trigger times."""
    dx, dy = 0, 0
    for tr in triggers:
        dt = t - tr
        if 0 <= dt < decay:
            s = power * (1 - dt / decay)
            dx += int(s * math.sin(dt * 80))
            dy += int(s * math.cos(dt * 65))
    return dx, dy

def apply_shake(img, t, triggers, power=18):
    dx, dy = shake_offset(t, triggers, power)
    if dx == 0 and dy == 0:
        return img
    shifted = Image.new("RGB", (W, H), BLACK)
    shifted.paste(img, (dx, dy))
    return shifted

def draw_sparkles(draw, t, n=20, seed=99):
    """Sparkle/confetti particles."""
    rng = random.Random(seed)
    for _ in range(n):
        x = rng.randint(0, W)
        base_y = rng.randint(0, H)
        speed = rng.uniform(100, 300)
        y = (base_y + t * speed) % (H + 100) - 50
        size = rng.randint(3, 8)
        phase = rng.uniform(0, 6.28)
        brightness = int(150 + 105 * math.sin(t * 8 + phase))
        color = rng.choice([ACCENT, GOLD, NEON_GREEN, HOT_PINK, WHITE])
        r, g, b = color
        r = min(255, int(r * brightness / 255))
        g_val = min(255, int(g * brightness / 255))
        b = min(255, int(b * brightness / 255))
        draw.ellipse((x - size, int(y) - size, x + size, int(y) + size), fill=(r, g_val, b))


# ============================================================
#  COMMON SCENE BUILDERS
# ============================================================

def scene_bigtext(draw, text, t_in, color=WHITE, size=80, y_pos=None):
    """Full-screen big text slam with overshoot."""
    p = ease_back(min(t_in / 0.3, 1.0))
    s = int(size * p)
    if s < 10:
        return
    y = y_pos if y_pos else H // 2 - s // 2
    lines = text.split("\n")
    for i, line in enumerate(lines):
        dshadow(draw, line, y + i * int(s * 1.3), font(max(s, 12)), fill=color, ox=6, oy=6)

def scene_cta(draw, t_in):
    """Universal CTA ending."""
    p = ease_out(min(t_in / 0.5, 1.0))
    yo = int(40 * (1 - p))

    # Divider line
    lw = int(600 * p)
    lx = (W - lw) // 2
    draw.rounded_rectangle((lx, H // 2 - 200 + yo, lx + lw, H // 2 - 192 + yo), radius=4, fill=ACCENT)

    dshadow(draw, "tsurispot.com", H // 2 - 150 + yo, font(56), fill=ACCENT)
    dcenter(draw, "プロフィールからチェック", H // 2 - 60 + yo, font(38, False), fill=LIGHT)

    # Pulsing arrow
    pulse_y = int(15 * math.sin(t_in * 6))
    dcenter(draw, ">>>", H // 2 + 30 + yo + pulse_y, font(50), fill=WHITE)

    dcenter(draw, "フォローで釣果UP", H // 2 + 130 + yo, font(36), fill=NEON_GREEN)


# ============================================================
#  VIDEO 1: 釣り人あるある5選 (15s)
# ============================================================

def create_video_01():
    items = [
        "天気予報より\n潮見表を見がち",
        "「ちょっと様子見」\nが5時間",
        "タモ忘れた日に\nデカいの来る",
        "「もう帰ろう」\nの直後に爆釣",
        "ボウズでも\n「楽しかった」",
    ]
    bg1 = grad(W, H, DEEP, (5, 15, 40))
    bg2 = grad(W, H, (20, 10, 40), (50, 15, 25))
    bgs = [bg1, bg2, bg1, bg2, bg1]

    flash_times = [0.0, 1.3, 3.5, 5.7, 7.9, 10.1, 12.3]
    shake_times = [0.0, 1.3, 3.5, 5.7, 7.9, 10.1]

    def make_frame(t):
        # Hook (0-1.3s)
        if t < 1.3:
            img = Image.fromarray(bg1)
            draw = ImageDraw.Draw(img)
            scene_bigtext(draw, "釣り人にしか\nわからない", t, color=WHITE, size=78, y_pos=500)
            if t > 0.4:
                dshadow(draw, "あるある 5選", H // 2 + 100, font(90), fill=ACCENT)
            dcenter(draw, "最後まで共感したらフォロー", H - 350, font(30, False), fill=LIGHT)
        # Items (1.3-12.3s = 5 items x 2.2s each)
        elif t < 12.3:
            idx = min(int((t - 1.3) / 2.2), 4)
            st = (t - 1.3) - idx * 2.2
            img = Image.fromarray(bgs[idx % len(bgs)])
            draw = ImageDraw.Draw(img)

            # Number badge
            np_ = ease_back(min(st / 0.25, 1.0))
            ns = int(200 * np_)
            if ns > 10:
                dcenter(draw, str(idx + 1), 200, font(max(ns, 12)), fill=(40, 50, 80))

            # Text slam
            if st > 0.1:
                scene_bigtext(draw, items[idx], st - 0.1, color=WHITE, size=72, y_pos=600)

            # Bottom counter
            for i in range(5):
                cx = W // 2 + (i - 2) * 80
                cy = H - 300
                fill = ACCENT if i <= idx else (40, 50, 70)
                draw.ellipse((cx - 18, cy - 18, cx + 18, cy + 18), fill=fill)

            dcenter(draw, "共感したら保存", H - 230, font(28, False), fill=LIGHT)
        # CTA (12.3-15s)
        else:
            img = Image.fromarray(bg1)
            draw = ImageDraw.Draw(img)
            scene_cta(draw, t - 12.3)

        img = flash(img, t, flash_times)
        img = apply_shake(img, t, shake_times)
        img = watermark(img)
        return np.array(img)

    return make_frame, 15.0


# ============================================================
#  VIDEO 2: この魚何問わかる？ (18s)
# ============================================================

def create_video_02():
    quiz = [
        ("冬の夜釣りの王様", "メバル", "正解率 72%"),
        ("根に潜む赤い奴", "カサゴ", "正解率 85%"),
        ("砂地のフラットフィッシュ", "カレイ", "正解率 61%"),
        ("高級魚 サーフの王者", "ヒラメ", "正解率 48%"),
    ]
    bg = grad(W, H, DEEP, (10, 5, 30))
    flash_t = [0.0, 1.2, 4.2, 7.2, 10.2, 13.2]
    shake_t = [2.0, 5.0, 8.0, 11.0]

    def make_frame(t):
        img = Image.fromarray(bg)
        draw = ImageDraw.Draw(img)

        # Hook (0-1.2s)
        if t < 1.2:
            scene_bigtext(draw, "釣り好きなら\n全問正解できる", t, WHITE, 72, 500)
            if t > 0.3:
                dshadow(draw, "はず...？", H // 2 + 120, font(80), fill=HOT_PINK)
        # Quiz (1.2-13.2s = 4 questions x 3s)
        elif t < 13.2:
            qi = min(int((t - 1.2) / 3.0), 3)
            st = (t - 1.2) - qi * 3.0
            hint, answer, rate = quiz[qi]

            # Question number
            draw.rounded_rectangle((W // 2 - 120, 250, W // 2 + 120, 320), radius=30, fill=ACCENT)
            dcenter(draw, f"Q{qi + 1} / 4", 258, font(40), fill=WHITE)

            # Hint phase (0-1.5s)
            if st < 1.5:
                p = ease_out(min(st / 0.4, 1.0))
                yo = int(50 * (1 - p))
                dshadow(draw, hint, H // 2 - 150 + yo, font(56), fill=LIGHT)
                dcenter(draw, "この魚は...？", H // 2, font(44, False), fill=ACCENT)

                # Countdown dots
                dots_left = max(0, 3 - int(st / 0.5))
                dcenter(draw, "." * dots_left, H // 2 + 100, font(80), fill=WHITE)
            # Answer phase (1.5-3.0s)
            else:
                ast = st - 1.5
                ap = ease_elastic(min(ast / 0.4, 1.0))
                asize = int(120 * ap)
                if asize > 10:
                    dshadow(draw, answer, H // 2 - 120, font(max(asize, 12)), fill=NEON_GREEN)

                if ast > 0.3:
                    dcenter(draw, rate, H // 2 + 50, font(36, False), fill=LIGHT)
                if ast > 0.5:
                    dcenter(draw, "正解できた？", H // 2 + 120, font(34, False), fill=ACCENT)

            # Score tracker
            for i in range(4):
                cx = W // 2 + (i - 1.5) * 80
                cy = H - 320
                done = i < qi or (i == qi and st >= 1.5)
                draw.ellipse((cx - 22, cy - 22, cx + 22, cy + 22),
                           fill=NEON_GREEN if done else (30, 40, 60))
                if done:
                    draw.text((cx - 10, cy - 14), "O", font=font(22), fill=WHITE)

        # Result + CTA (13.2-18s)
        else:
            st = t - 13.2
            p = ease_out(min(st / 0.5, 1.0))
            yo = int(60 * (1 - p))

            dshadow(draw, "全問正解", H // 2 - 250 + yo, font(90), fill=GOLD)
            dshadow(draw, "できた？", H // 2 - 130 + yo, font(90), fill=WHITE)

            if st > 0.5:
                draw_sparkles(draw, t, 30)

            if st > 0.8:
                scene_cta(draw, st - 0.8)

        img = flash(img, t, flash_t)
        img = apply_shake(img, t, shake_t)
        img = watermark(img)
        return np.array(img)

    return make_frame, 18.0


# ============================================================
#  VIDEO 3: 5,000円で釣りフルセット (15s)
# ============================================================

def create_video_03():
    items = [
        ("ロッド", "1,500", CYAN),
        ("リール", "1,000", (0, 160, 200)),
        ("ライン", "300", NEON_GREEN),
        ("仕掛け", "200", GOLD),
        ("バケツ", "500", ACCENT),
    ]
    bg = grad(W, H, DEEP, (5, 20, 45))
    flash_t = [0.0, 1.0, 2.8, 4.6, 6.4, 8.2, 10.0, 12.0]
    shake_t = [1.0, 2.8, 4.6, 6.4, 8.2, 10.0]

    def make_frame(t):
        img = Image.fromarray(bg)
        draw = ImageDraw.Draw(img)

        # Hook (0-1.0s)
        if t < 1.0:
            scene_bigtext(draw, "え、", t, HOT_PINK, 100, 450)
            if t > 0.15:
                dshadow(draw, "5,000円!?", H // 2 - 10, font(110), fill=ACCENT)
        # Items slam (1.0-10.0s)
        elif t < 10.0:
            # Title
            dcenter(draw, "5,000円フルセット", 200, font(40, False), fill=LIGHT)

            idx = min(int((t - 1.0) / 1.8), 4)
            st_base = t - 1.0

            running_total = 0
            y_base = 350

            for i in range(5):
                name, price, color = items[i]
                y = y_base + i * 170
                item_t = st_base - i * 1.8

                if item_t < 0:
                    # Not yet
                    draw.rounded_rectangle((80, y, W - 80, y + 130), radius=20, fill=(15, 25, 45))
                    dcenter(draw, "？？？", y + 35, font(48), fill=(40, 50, 70))
                else:
                    running_total += int(price.replace(",", ""))
                    p = ease_back(min(item_t / 0.3, 1.0))

                    # Card bg
                    draw.rounded_rectangle((80, y, W - 80, y + 130), radius=20, fill=(25, 45, 80))

                    # Item name
                    s = int(52 * p)
                    if s > 10:
                        draw.text((140, y + 15), name, font=font(max(s, 12)), fill=WHITE)

                    # Price
                    if item_t > 0.15:
                        pp = ease_out(min((item_t - 0.15) / 0.2, 1.0))
                        draw.text((W - 350, y + 20), f"{price}円", font=font(48), fill=color)

                    # Check mark
                    if item_t > 0.25:
                        draw.text((W - 170, y + 25), "OK", font=font(40), fill=NEON_GREEN)

            # Running total
            if running_total > 0:
                draw.rounded_rectangle((200, H - 320, W - 200, H - 230), radius=25, fill=ACCENT)
                dcenter(draw, f"合計 {running_total:,}円", H - 310, font(48), fill=WHITE)

                if running_total >= 3500:
                    dcenter(draw, "マジで全部揃う", H - 200, font(34, False), fill=NEON_GREEN)

        # CTA (10-13s... extended to 15)
        elif t < 12.0:
            st = t - 10.0
            dshadow(draw, "たった", H // 2 - 200, font(60, False), fill=LIGHT)
            scene_bigtext(draw, "5,000円", st, ACCENT, 120, H // 2 - 100)
            if st > 0.3:
                dshadow(draw, "で始められる", H // 2 + 80, font(60, False), fill=LIGHT)
            if st > 0.6:
                draw_sparkles(draw, t, 25)
        else:
            scene_cta(draw, t - 12.0)

        img = flash(img, t, flash_t)
        img = apply_shake(img, t, shake_t, power=22)
        img = watermark(img)
        return np.array(img)

    return make_frame, 15.0


# ============================================================
#  VIDEO 4: 釣れる時間帯（保存必須） (18s)
# ============================================================

def create_video_04():
    hours = [
        (4, 6, "朝マヅメ", "一番釣れる", GOLD, 1.0),
        (6, 9, "午前", "まだイケる", NEON_GREEN, 0.6),
        (9, 15, "日中", "厳しい...", (100, 100, 120), 0.2),
        (15, 17, "夕マヅメ", "ゴールデンタイム", GOLD, 0.95),
        (17, 20, "夜", "夜釣りチャンス", ACCENT, 0.7),
    ]
    bg = grad(W, H, DEEP, (5, 10, 30))
    flash_t = [0.0, 1.3]
    shake_t = [0.0]

    def make_frame(t):
        img = Image.fromarray(bg)
        draw = ImageDraw.Draw(img)

        # Hook
        if t < 1.3:
            scene_bigtext(draw, "この時間に\n行かないと損", t, WHITE, 78, 500)
            if t > 0.3:
                dshadow(draw, "保存必須", H // 2 + 130, font(70), fill=HOT_PINK)
        # Timeline (1.3-14s)
        elif t < 14.0:
            st = t - 1.3
            dcenter(draw, "釣れる時間帯マップ", 180, font(38, False), fill=LIGHT)

            # Timeline bar
            bar_x, bar_y = 150, 350
            bar_h = 1100
            draw.rounded_rectangle((bar_x - 3, bar_y, bar_x + 3, bar_y + bar_h), radius=3, fill=(40, 50, 70))

            for i, (start_h, end_h, label, desc, color, intensity) in enumerate(hours):
                reveal_delay = i * 2.0
                if st < reveal_delay:
                    continue
                local_t = st - reveal_delay
                p = ease_out(min(local_t / 0.5, 1.0))

                # Position on timeline
                y_start = bar_y + int(bar_h * (start_h - 4) / 16)
                y_end = bar_y + int(bar_h * (end_h - 4) / 16)
                y_mid = (y_start + y_end) // 2

                # Time range on left
                draw.text((40, y_mid - 15), f"{start_h}:00", font=font(24, False), fill=LIGHT)

                # Intensity bar
                bw = int(200 * intensity * p)
                draw.rounded_rectangle(
                    (bar_x + 20, y_start + 5, bar_x + 20 + bw, y_end - 5),
                    radius=10, fill=color
                )

                # Label
                xo = int(40 * (1 - p))
                draw.text((bar_x + 240 + xo, y_mid - 40), label, font=font(44), fill=WHITE)
                draw.text((bar_x + 240 + xo, y_mid + 15), desc, font=font(28, False), fill=color)

            # Best time callout
            if st > 4.0:
                cp = ease_back(min((st - 4.0) / 0.5, 1.0))
                draw.rounded_rectangle((180, H - 340, W - 180, H - 240), radius=25, fill=GOLD)
                dcenter(draw, "4:00-6:00 が最強", H - 330, font(42), fill=BLACK)

            dcenter(draw, "保存して次の釣行に使って", H - 200, font(28, False), fill=LIGHT)
        # CTA
        else:
            scene_cta(draw, t - 14.0)

        img = flash(img, t, flash_t)
        img = apply_shake(img, t, shake_t)
        img = watermark(img)
        return np.array(img)

    return make_frame, 18.0


# ============================================================
#  VIDEO 5: 冬釣りする奴は変態 (15s)
# ============================================================

def create_video_05():
    bg_cold = grad(W, H, (10, 15, 40), (5, 5, 25))
    bg_warm = grad(W, H, (40, 20, 10), (15, 10, 30))

    random.seed(55)
    snow = [(random.randint(0, W), random.randint(-H, H), random.uniform(2, 5), random.uniform(40, 100))
            for _ in range(70)]

    reveals = [
        "人がいない\n= 全部独り占め",
        "旬の魚\n= 最高にウマい",
        "防寒装備\n= むしろ快適",
    ]
    flash_t = [0.0, 1.0, 2.5, 4.7, 6.9, 9.1]
    shake_t = [0.0, 1.0, 2.5]

    def draw_snow(draw, t):
        for sx, sy, sr, sp in snow:
            sy2 = (sy + t * sp) % (H + 200) - 100
            sx2 = sx + int(15 * math.sin(t * 2 + sy * 0.01))
            if 0 <= sy2 <= H:
                g = int(180 + 75 * (0.5 + 0.5 * math.sin(t * 3 + sy)))
                draw.ellipse((sx2 - int(sr), int(sy2) - int(sr), sx2 + int(sr), int(sy2) + int(sr)),
                           fill=(g, g, g))

    def make_frame(t):
        # Cold phase (0-2.5s) then warm phase
        bg = bg_cold if t < 2.5 else bg_warm
        img = Image.fromarray(bg)
        draw = ImageDraw.Draw(img)
        draw_snow(draw, t)

        # Hook pt1 (0-1.0s)
        if t < 1.0:
            scene_bigtext(draw, "冬に釣り\n行くやつ", t, WHITE, 80, 500)
        # Hook pt2 (1.0-2.5s)
        elif t < 2.5:
            dshadow(draw, "冬に釣り", 500, font(80), fill=WHITE)
            dshadow(draw, "行くやつ", 600, font(80), fill=WHITE)
            st = t - 1.0
            p = ease_back(min(st / 0.3, 1.0))
            s = int(100 * p)
            if s > 10:
                dshadow(draw, "変態です", H // 2 + 50, font(max(s, 12)), fill=HOT_PINK)
        # Twist (2.5-3.2)
        elif t < 3.2:
            st = t - 2.5
            p = ease_out(min(st / 0.3, 1.0))
            dshadow(draw, "...でも", H // 2 - 50, font(90), fill=ACCENT)
        # Reveals (3.2-9.1s)
        elif t < 9.1:
            idx = min(int((t - 3.2) / 2.2), 2)
            st = (t - 3.2) - idx * 2.2

            dcenter(draw, f"理由 {idx + 1} / 3", 250, font(30, False), fill=LIGHT)
            scene_bigtext(draw, reveals[idx], st, WHITE, 68, 550)

            for i in range(3):
                cx = W // 2 + (i - 1) * 100
                cy = H - 320
                draw.ellipse((cx - 20, cy - 20, cx + 20, cy + 20),
                           fill=ACCENT if i <= idx else (30, 40, 55))
        # Punchline (9.1-12s)
        elif t < 12.0:
            st = t - 9.1
            scene_bigtext(draw, "つまり\n冬釣り最高", st, GOLD, 90, 500)
            if st > 0.5:
                draw_sparkles(draw, t, 35)
        else:
            scene_cta(draw, t - 12.0)

        img = flash(img, t, flash_t)
        img = apply_shake(img, t, shake_t)
        img = watermark(img)
        return np.array(img)

    return make_frame, 15.0


# ============================================================
#  VIDEO 6: 隣の人だけ爆釣してた理由 (18s)
# ============================================================

def create_video_06():
    secrets = [
        ("時合いを\n待ってた", "朝マヅメに集中"),
        ("タナが\n違ってた", "底から丁寧に探った"),
        ("コマセの\n撒き方が違う", "チビチビ少量ずつ"),
        ("仕掛けが\n1号細かった", "食い渋りに対応"),
        ("手返しが\n異常に速い", "1秒でも無駄にしない"),
    ]
    bg = grad(W, H, (10, 5, 25), (30, 10, 15))
    flash_t = [0.0, 1.5, 3.7, 5.9, 8.1, 10.3, 12.5]
    shake_t = [1.5, 3.7, 5.9, 8.1, 10.3]

    def make_frame(t):
        img = Image.fromarray(bg)
        draw = ImageDraw.Draw(img)

        # Hook (0-1.5s)
        if t < 1.5:
            scene_bigtext(draw, "なんで\nあいつだけ", t, WHITE, 80, 450)
            if t > 0.3:
                dshadow(draw, "釣れてんの？", H // 2 + 100, font(76), fill=RED)
        # Secrets (1.5-12.5s)
        elif t < 12.5:
            idx = min(int((t - 1.5) / 2.2), 4)
            st = (t - 1.5) - idx * 2.2

            # Secret number
            draw.rounded_rectangle((W // 2 - 100, 230, W // 2 + 100, 300), radius=25, fill=RED)
            dcenter(draw, f"理由 {idx + 1}", 238, font(38), fill=WHITE)

            # Secret text
            scene_bigtext(draw, secrets[idx][0], st, WHITE, 72, 500)

            # Explanation
            if st > 0.5:
                p = ease_out(min((st - 0.5) / 0.3, 1.0))
                dcenter(draw, secrets[idx][1], H // 2 + 120, font(38, False), fill=ACCENT)

            # Progress
            for i in range(5):
                cx = W // 2 + (i - 2) * 70
                cy = H - 310
                draw.ellipse((cx - 16, cy - 16, cx + 16, cy + 16),
                           fill=ACCENT if i <= idx else (30, 35, 50))

            dcenter(draw, "全部できてる人だけ右スワイプ", H - 250, font(26, False), fill=LIGHT)
        # Wrap (12.5-15s)
        elif t < 15.0:
            st = t - 12.5
            dshadow(draw, "5つ全部", H // 2 - 200, font(70, False), fill=LIGHT)
            scene_bigtext(draw, "やってみて", st, NEON_GREEN, 90, H // 2 - 80)
            if st > 0.5:
                draw_sparkles(draw, t, 20)
        else:
            scene_cta(draw, t - 15.0)

        img = flash(img, t, flash_t)
        img = apply_shake(img, t, shake_t)
        img = watermark(img)
        return np.array(img)

    return make_frame, 18.0


# ============================================================
#  VIDEO 7: 都道府県ランキング TOP5 (18s)
# ============================================================

def create_video_07():
    ranking = [
        ("5位", "千葉県", "68", (80, 130, 200)),
        ("4位", "神奈川県", "75", (60, 150, 180)),
        ("3位", "静岡県", "82", NEON_GREEN),
        ("2位", "北海道", "95", ACCENT),
        ("1位", "沖縄県", "108", GOLD),
    ]
    bg = grad(W, H, DEEP, (5, 10, 30))
    flash_t = [0.0, 1.3, 3.5, 5.7, 7.9, 10.1, 12.3]
    shake_t = [1.3, 3.5, 5.7, 7.9, 10.1, 12.3]

    def make_frame(t):
        img = Image.fromarray(bg)
        draw = ImageDraw.Draw(img)

        if t < 1.3:
            scene_bigtext(draw, "あなたの県は\n入ってる？", t, WHITE, 76, 500)
            if t > 0.3:
                dcenter(draw, "釣りスポット数 TOP5", H // 2 + 120, font(40, False), fill=ACCENT)
        elif t < 12.3:
            dcenter(draw, "釣りスポット数ランキング", 200, font(36, False), fill=LIGHT)

            idx = min(int((t - 1.3) / 2.2), 4)
            st_base = t - 1.3

            for i in range(5):
                rank, pref, count, color = ranking[i]
                y = 350 + i * 230
                item_t = st_base - i * 2.2

                if item_t < 0:
                    # Hidden
                    draw.rounded_rectangle((80, y, W - 80, y + 180), radius=20, fill=(15, 20, 35))
                    dcenter(draw, f"{rank} ???", y + 55, font(56), fill=(40, 50, 70))
                else:
                    p = ease_back(min(item_t / 0.35, 1.0))

                    # Card
                    draw.rounded_rectangle((80, y, W - 80, y + 180), radius=20, fill=(20, 35, 65))

                    # Rank
                    rs = int(60 * p)
                    if rs > 10:
                        draw.text((120, y + 20), rank, font=font(max(rs, 12)), fill=color)

                    # Prefecture
                    if item_t > 0.1:
                        draw.text((300, y + 25), pref, font=font(52), fill=WHITE)

                    # Count bar
                    if item_t > 0.2:
                        bp = ease_out(min((item_t - 0.2) / 0.5, 1.0))
                        bw = int(400 * (int(count) / 108) * bp)
                        draw.rounded_rectangle((300, y + 100, 300 + bw, y + 140), radius=8, fill=color)
                        if bp > 0.4:
                            draw.text((310 + bw, y + 95), f"{count}件", font=font(30, False), fill=LIGHT)

                    # Crown for #1
                    if i == 4 and item_t > 0.5:
                        draw_sparkles(draw, t, 30, seed=77)

        # Result (12.3-15s)
        elif t < 15.0:
            st = t - 12.3
            dshadow(draw, "1位", H // 2 - 250, font(80, False), fill=LIGHT)
            scene_bigtext(draw, "沖縄県", st, GOLD, 130, H // 2 - 130)
            if st > 0.3:
                dshadow(draw, "108スポット", H // 2 + 80, font(60), fill=ACCENT)
            if st > 0.5:
                draw_sparkles(draw, t, 40)
        else:
            scene_cta(draw, t - 15.0)

        img = flash(img, t, flash_t)
        img = apply_shake(img, t, shake_t)
        img = watermark(img)
        return np.array(img)

    return make_frame, 18.0


# ============================================================
#  VIDEO 8: 月別おすすめ魚 3秒チャレンジ (15s)
# ============================================================

def create_video_08():
    months = [
        ("1月", "ヒラメ"), ("2月", "メバル"), ("3月", "チヌ"),
        ("4月", "アジ"), ("5月", "キス"), ("6月", "イサキ"),
        ("7月", "タチウオ"), ("8月", "青物"), ("9月", "アオリイカ"),
        ("10月", "サワラ"), ("11月", "ヒラメ"), ("12月", "カレイ"),
    ]
    colors = [
        (100, 150, 220), (80, 130, 200), (130, 180, 160),
        (100, 200, 130), (160, 210, 80), (200, 200, 60),
        (220, 160, 40), (240, 130, 30), (200, 100, 50),
        (160, 100, 80), (120, 110, 140), (90, 130, 190),
    ]
    bg = grad(W, H, DEEP, (5, 10, 25))

    def make_frame(t):
        img = Image.fromarray(bg)
        draw = ImageDraw.Draw(img)

        # Hook (0-1.5s)
        if t < 1.5:
            scene_bigtext(draw, "全部言えたら\nガチ勢認定", t, WHITE, 78, 500)
            if t > 0.4:
                dshadow(draw, "月別おすすめ魚", H // 2 + 120, font(56), fill=ACCENT)
        # Rapid fire (1.5-10.5s = 12 months x 0.75s)
        elif t < 10.5:
            st = t - 1.5
            mi = min(int(st / 0.75), 11)
            local = st - mi * 0.75
            month, fish = months[mi]
            c = colors[mi]

            # Month counter
            dcenter(draw, f"{mi + 1} / 12", 220, font(30, False), fill=LIGHT)

            # Month name
            p = ease_back(min(local / 0.2, 1.0))
            ms = int(100 * p)
            if ms > 10:
                dshadow(draw, month, H // 2 - 250, font(max(ms, 12)), fill=c)

            # Fish name (BIG)
            if local > 0.1:
                fp = ease_elastic(min((local - 0.1) / 0.3, 1.0))
                fs = int(130 * fp)
                if fs > 10:
                    dshadow(draw, fish, H // 2 - 80, font(max(fs, 12)), fill=WHITE)

            # Speed indicator
            dcenter(draw, "0.75秒/月", H // 2 + 130, font(28, False), fill=ACCENT)

            # Progress bar
            prog = (mi + min(local / 0.75, 1.0)) / 12
            bw = int((W - 200) * prog)
            draw.rounded_rectangle((100, H - 340, W - 100, H - 320), radius=5, fill=(20, 30, 50))
            draw.rounded_rectangle((100, H - 340, 100 + bw, H - 320), radius=5, fill=ACCENT)

            dcenter(draw, "覚えてる？", H - 290, font(30, False), fill=LIGHT)

        # Challenge result (10.5-12.5)
        elif t < 12.5:
            st = t - 10.5
            scene_bigtext(draw, "何月まで\n覚えてた？", st, WHITE, 80, 500)
            if st > 0.5:
                dshadow(draw, "保存して復習しよう", H // 2 + 130, font(40, False), fill=NEON_GREEN)
        else:
            scene_cta(draw, t - 12.5)

        img = watermark(img)
        return np.array(img)

    return make_frame, 15.0


# ============================================================
#  VIDEO 9: 彼女を釣りに連れてく方法 (15s)
# ============================================================

def create_video_09():
    conditions = [
        ("トイレ完備", "これないと即帰宅"),
        ("安全柵あり", "落ちたら終わり"),
        ("駐車場あり", "荷物多いから必須"),
        ("初心者OK", "手ぶらで行ける所"),
    ]
    bg = grad(W, H, (15, 10, 35), (5, 20, 45))
    flash_t = [0.0, 1.3, 2.5, 4.3, 6.1, 7.9, 9.7]
    shake_t = [1.3, 2.5]

    def make_frame(t):
        img = Image.fromarray(bg)
        draw = ImageDraw.Draw(img)

        # Hook (0-1.3s)
        if t < 1.3:
            scene_bigtext(draw, "彼女\n「釣りとか無理」", t, WHITE, 72, 480)
        # Twist (1.3-2.5s)
        elif t < 2.5:
            dshadow(draw, "彼女", 480, font(72), fill=WHITE)
            dshadow(draw, "「釣りとか無理」", 570, font(72), fill=WHITE)
            st = t - 1.3
            p = ease_back(min(st / 0.3, 1.0))
            s = int(90 * p)
            if s > 10:
                dshadow(draw, "...でもね", H // 2 + 80, font(max(s, 12)), fill=ACCENT)
        # Conditions (2.5-9.7s = 4 x 1.8s)
        elif t < 9.7:
            idx = min(int((t - 2.5) / 1.8), 3)
            st = (t - 2.5) - idx * 1.8

            dcenter(draw, "こういう場所なら行ける", 250, font(36, False), fill=LIGHT)

            y_base = 400
            for i in range(4):
                y = y_base + i * 200
                name, reason = conditions[i]
                item_t = (t - 2.5) - i * 1.8

                if item_t < 0:
                    draw.rounded_rectangle((80, y, W - 80, y + 160), radius=20, fill=(15, 20, 40))
                    dcenter(draw, "？", y + 45, font(52), fill=(30, 40, 60))
                else:
                    p = ease_back(min(item_t / 0.3, 1.0))
                    draw.rounded_rectangle((80, y, W - 80, y + 160), radius=20, fill=(25, 50, 85))

                    # Check
                    cs = int(60 * p)
                    if cs > 5:
                        draw.text((130, y + 20), "OK", font=font(max(cs, 12)), fill=NEON_GREEN)

                    draw.text((250, y + 15), name, font=font(48), fill=WHITE)
                    if item_t > 0.2:
                        draw.text((250, y + 85), reason, font=font(26, False), fill=ACCENT)

        # Punchline (9.7-12.5)
        elif t < 12.5:
            st = t - 9.7
            scene_bigtext(draw, "こういう場所\nツリスポで検索", st, WHITE, 72, 500)
            if st > 0.5:
                dshadow(draw, "家族でもOK", H // 2 + 120, font(50), fill=NEON_GREEN)
        else:
            scene_cta(draw, t - 12.5)

        img = flash(img, t, flash_t)
        img = apply_shake(img, t, shake_t)
        img = watermark(img)
        return np.array(img)

    return make_frame, 15.0


# ============================================================
#  VIDEO 10: 98%の人が知らない機能 (15s)
# ============================================================

def create_video_10():
    features = [
        ("潮回り\n自動チェック", "大潮の日がわかる"),
        ("現在地から\n距離順ソート", "一番近い釣り場が秒でわかる"),
        ("混雑予想", "空いてる日を狙える"),
        ("月別おすすめ", "今釣れる魚がわかる"),
    ]
    bg = grad(W, H, (5, 5, 20), (15, 10, 40))
    flash_t = [0.0, 1.3, 3.3, 5.3, 7.3, 9.3]
    shake_t = [0.0, 1.3, 3.3, 5.3, 7.3]

    def make_frame(t):
        img = Image.fromarray(bg)
        draw = ImageDraw.Draw(img)

        # Hook
        if t < 1.3:
            scene_bigtext(draw, "98%の人が\n知らない", t, WHITE, 80, 450)
            if t > 0.3:
                dshadow(draw, "神機能", H // 2 + 80, font(100), fill=HOT_PINK)
        # Features (1.3-9.3s)
        elif t < 9.3:
            idx = min(int((t - 1.3) / 2.0), 3)
            st = (t - 1.3) - idx * 2.0

            draw.rounded_rectangle((W // 2 - 80, 230, W // 2 + 80, 290), radius=25, fill=HOT_PINK)
            dcenter(draw, f"{idx + 1} / 4", 240, font(32), fill=WHITE)

            # Feature text
            scene_bigtext(draw, features[idx][0], st, WHITE, 72, 500)

            if st > 0.4:
                p = ease_out(min((st - 0.4) / 0.3, 1.0))
                # Explanation card
                draw.rounded_rectangle((80, H // 2 + 60, W - 80, H // 2 + 160), radius=20, fill=(30, 20, 60))
                dcenter(draw, features[idx][1], H // 2 + 80, font(36, False), fill=ACCENT)

            # Progress
            for i in range(4):
                cx = W // 2 + (i - 1.5) * 80
                cy = H - 320
                draw.ellipse((cx - 18, cy - 18, cx + 18, cy + 18),
                           fill=NEON_GREEN if i <= idx else (25, 30, 50))

            dcenter(draw, "知ってた？コメントで教えて", H - 260, font(26, False), fill=LIGHT)
        # Wrap
        elif t < 12.0:
            st = t - 9.3
            dshadow(draw, "全部", H // 2 - 200, font(70, False), fill=LIGHT)
            scene_bigtext(draw, "無料", st, NEON_GREEN, 130, H // 2 - 100)
            if st > 0.3:
                dshadow(draw, "で使えます", H // 2 + 80, font(60, False), fill=LIGHT)
            if st > 0.6:
                draw_sparkles(draw, t, 30)
        else:
            scene_cta(draw, t - 12.0)

        img = flash(img, t, flash_t)
        img = apply_shake(img, t, shake_t)
        img = watermark(img)
        return np.array(img)

    return make_frame, 15.0


# ============================================================
#  CAPTIONS
# ============================================================

CAPTIONS = {
    "01_aruaru": {
        "text": "釣り人にしかわからない「あるある」5選\n\n最後まで共感したらフォローお願いします\n\nみんなのあるあるもコメントで教えて！",
        "hashtags": "#釣りあるある #釣り人 #共感 #釣り好き #あるある",
        "best_time": "金曜 20:00"
    },
    "02_fish_quiz": {
        "text": "釣り好きなら全問正解できるはず...？\n\n何問できた？コメントで教えて！\n\n全問正解の人はガチ勢認定",
        "hashtags": "#釣りクイズ #魚クイズ #釣り好き #メバル #カサゴ",
        "best_time": "土曜 18:00"
    },
    "03_5000yen": {
        "text": "え、5,000円で釣りフルセット揃うの!?\n\nロッド+リール+ライン+仕掛け+バケツ\nこれだけで海釣りデビューできます\n\n詳しくはプロフィールから",
        "hashtags": "#釣り初心者 #コスパ最強 #5000円 #釣りデビュー #サビキ",
        "best_time": "日曜 12:00"
    },
    "04_best_time": {
        "text": "この時間帯に行かないと損！保存必須\n\n朝マヅメ(4-6時)がゴールデンタイム\n夕マヅメも激アツ\n\n保存して次の釣行に使って！",
        "hashtags": "#朝マヅメ #夕マヅメ #時合い #釣り時間 #保存版",
        "best_time": "土曜 17:00"
    },
    "05_winter": {
        "text": "冬に釣り行くやつ、変態です\n\n...でも最高なんです\n\n人少ない+魚ウマい+防寒すれば快適\n冬釣りガイドはプロフィールから",
        "hashtags": "#冬釣り #変態 #メバリング #カサゴ #防寒",
        "best_time": "土曜 19:00"
    },
    "06_neighbor": {
        "text": "なんであいつだけ釣れてんの？\n\n5つの理由、全部やってみて\n\n①時合い ②タナ ③コマセ ④仕掛け ⑤手返し\n\n詳しくはプロフィールから",
        "hashtags": "#サビキ釣り #釣りコツ #爆釣 #アジ釣り #テクニック",
        "best_time": "金曜 19:00"
    },
    "07_ranking": {
        "text": "あなたの県は入ってる？\n釣りスポット数ランキングTOP5\n\n5位 千葉 4位 神奈川 3位 静岡 2位 北海道\n1位は...沖縄！\n\ntsurispot.comでチェック",
        "hashtags": "#釣りランキング #沖縄釣り #北海道釣り #都道府県 #TOP5",
        "best_time": "水曜 20:00"
    },
    "08_calendar": {
        "text": "全部言えたらガチ勢認定！月別おすすめ魚\n\n0.75秒で12ヶ月\n何月まで覚えてた？\n\n保存して復習しよう！",
        "hashtags": "#釣りカレンダー #旬の魚 #保存版 #ガチ勢 #月別",
        "best_time": "日曜 11:00"
    },
    "09_girlfriend": {
        "text": "彼女「釣りとか無理」\n\n...でもこういう場所なら行ける！\nトイレ完備+柵あり+駐車場+初心者OK\n\n家族にも使えるスポット検索はプロフィールから",
        "hashtags": "#デート釣り #家族釣り #初心者 #カップル #ファミリー",
        "best_time": "木曜 21:00"
    },
    "10_features": {
        "text": "98%の人が知らない神機能\n\n潮回り自動チェック / 距離順ソート / 混雑予想 / 月別おすすめ\n\n全部無料で使えます\ntsurispot.com",
        "hashtags": "#釣りアプリ #神機能 #無料 #便利 #ツリスポ",
        "best_time": "土曜 15:00"
    },
}


# ============================================================
#  MAIN
# ============================================================

def generate_all():
    videos = [
        ("01_aruaru", create_video_01),
        ("02_fish_quiz", create_video_02),
        ("03_5000yen", create_video_03),
        ("04_best_time", create_video_04),
        ("05_winter", create_video_05),
        ("06_neighbor", create_video_06),
        ("07_ranking", create_video_07),
        ("08_calendar", create_video_08),
        ("09_girlfriend", create_video_09),
        ("10_features", create_video_10),
    ]

    print(f"\n{'='*60}")
    print(f" TsuriSpot BUZZ Video Generator v2")
    print(f" {len(videos)} videos")
    print(f" Output: {OUTPUT_DIR}")
    print(f"{'='*60}\n")

    total_start = time.time()

    for i, (name, fn) in enumerate(videos):
        print(f"[{i+1}/{len(videos)}] {name}...")
        start = time.time()
        make_frame, dur = fn()
        clip = VideoClip(make_frame, duration=dur)
        path = os.path.join(OUTPUT_DIR, f"{name}.mp4")
        clip.write_videofile(path, fps=FPS, codec="libx264", preset="medium",
                           bitrate="5000k", audio=False, logger=None)
        clip.close()
        elapsed = time.time() - start
        print(f"  -> {dur:.0f}s video in {elapsed:.1f}s")

        if name in CAPTIONS:
            cap = CAPTIONS[name]
            cp = os.path.join(OUTPUT_DIR, f"{name}_caption.txt")
            with open(cp, "w", encoding="utf-8") as f:
                f.write(f"{cap['text']}\n\n{cap['hashtags']}\n\n{cap['best_time']}")
            print(f"  -> caption saved")

    total = time.time() - total_start
    print(f"\nAll done in {total:.0f}s")


if __name__ == "__main__":
    generate_all()
