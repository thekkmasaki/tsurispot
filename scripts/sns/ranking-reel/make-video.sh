#!/usr/bin/env bash
# ランキング画像(1080x1920 PNG) → リール動画(12秒 MP4, H.264/AAC)
#   画像全体を最初から最後まで静止で見せる（ズームはしない＝ユーザー指示 2026-11。拡大で端が切れて読みにくかった）
#   使い方: make-video.sh <post.png> <out.mp4> [bgm.mp3] [開始秒]
set -euo pipefail
IN="$1"; OUT="$2"; BGM="${3:-}"; OFFSET="${4:-0}"
FPS=30; DUR=12
if [ -n "$BGM" ] && [ -f "$BGM" ]; then
  AUDIO=(-stream_loop -1 -ss "$OFFSET" -i "$BGM"); AF="[1:a]afade=t=in:d=0.5,afade=t=out:st=$((DUR-1)):d=1,volume=0.6[a]"
else
  AUDIO=(-f lavfi -i "anullsrc=r=44100:cl=stereo"); AF="[1:a]anull[a]"
fi
ffmpeg -y -loglevel error -loop 1 -i "$IN" "${AUDIO[@]}" -t "$DUR" \
  -filter_complex "[0:v]scale=1080:1920,fps=$FPS,format=yuv420p[v];$AF" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 20 -profile:v high -c:a aac -b:a 128k -ar 44100 \
  -movflags +faststart -shortest "$OUT"
echo "OK $OUT"
