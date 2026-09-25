#!/usr/bin/env bash
# ランキング画像(1080x1920 PNG) → リール動画(12秒 MP4, H.264/AAC)
#   冒頭2秒はタイトルを1.08倍で見せ、そこから8秒かけて全体へ引く（残りは静止＝読ませる時間）
#   使い方: make-video.sh <post.png> <out.mp4> [bgm.mp3]
set -euo pipefail
IN="$1"; OUT="$2"; BGM="${3:-}"
FPS=30; DUR=12
Z="if(lte(on,60),1.08,max(1.0,1.08-(on-60)*0.00034))"
if [ -n "$BGM" ] && [ -f "$BGM" ]; then
  AUDIO=(-stream_loop -1 -i "$BGM"); AF="[1:a]afade=t=in:d=0.5,afade=t=out:st=$((DUR-1)):d=1,volume=0.6[a]"
else
  AUDIO=(-f lavfi -i "anullsrc=r=44100:cl=stereo"); AF="[1:a]anull[a]"
fi
ffmpeg -y -loglevel error -loop 1 -i "$IN" "${AUDIO[@]}" -t "$DUR" \
  -filter_complex "[0:v]scale=2160:3840,zoompan=z='$Z':x='iw/2-(iw/zoom/2)':y='0':d=$((FPS*DUR)):s=1080x1920:fps=$FPS,format=yuv420p[v];$AF" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 20 -profile:v high -c:a aac -b:a 128k -ar 44100 \
  -movflags +faststart -shortest "$OUT"
echo "OK $OUT"
