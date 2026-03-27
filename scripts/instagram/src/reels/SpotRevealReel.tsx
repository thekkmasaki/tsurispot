import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

type FishInfo = {
  name: string;
  size: string;
  status: string;
};

type Photos = {
  main: string;
  fish: string;
  silhouette: string;
};

type SpotRevealProps = {
  spotName: string;
  area: string;
  hook: string;
  catchCopy: string;
  fish: FishInfo[];
  photos: Photos;
  bgmUrl: string;
};

// ==============================
// Scene 1: フック（黒背景 + 魚写真チラ見せ）
// ==============================
const HookScene: React.FC<{ text: string; fishPhoto: string }> = ({
  text,
  fishPhoto,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0.6,
    to: 1,
    config: { damping: 10, mass: 0.8 },
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 背景に魚の写真がうっすら
  const bgOpacity = interpolate(frame, [0, 60], [0, 0.15], {
    extrapolateRight: "clamp",
  });
  const bgZoom = interpolate(frame, [0, 120], [1.2, 1.4], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 背景に魚写真がうっすら */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Img
          src={fishPhoto}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: bgOpacity,
            transform: `scale(${bgZoom})`,
            filter: "saturate(0.5) contrast(1.3)",
          }}
        />
      </div>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: opacity * fadeOut,
        }}
      >
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            fontFamily: "'Noto Sans JP', sans-serif",
            color: "#fff",
            textAlign: "center",
            transform: `scale(${scale})`,
            lineHeight: 1.3,
            padding: "0 80px",
            textShadow: "0 4px 40px rgba(0,0,0,0.8)",
            letterSpacing: -2,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ==============================
// Scene 2: 写真ズームイン + スポット名
// ==============================
const RevealScene: React.FC<{
  photoUrl: string;
  spotName: string;
  area: string;
  catchCopy: string;
}> = ({ photoUrl, spotName, area, catchCopy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, 150], [1.05, 1.3], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // フェードイン
  const sceneOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleY = spring({
    frame: frame - 25,
    fps,
    from: 100,
    to: 0,
    config: { damping: 12 },
  });
  const titleOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateRight: "clamp",
  });

  const copyOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateRight: "clamp",
  });
  const copyY = spring({
    frame: frame - 55,
    fps,
    from: 50,
    to: 0,
    config: { damping: 14 },
  });

  const areaOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Img
          src={photoUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom})`,
            filter: "saturate(1.3) contrast(1.08)",
          }}
        />
      </div>

      {/* シネマティックオーバーレイ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg,
            rgba(0,0,0,0.25) 0%,
            rgba(0,0,0,0) 25%,
            rgba(0,0,0,0) 40%,
            rgba(0,0,0,0.5) 60%,
            rgba(0,0,0,0.92) 100%
          )`,
        }}
      />

      {/* ビネット */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* テキスト */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 72,
          right: 72,
          zIndex: 2,
        }}
      >
        <div
          style={{
            opacity: areaOpacity,
            display: "inline-block",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "'Noto Sans JP', sans-serif",
            padding: "12px 28px",
            borderRadius: 100,
            marginBottom: 28,
            color: "#fff",
          }}
        >
          📍 {area}
        </div>

        <div
          style={{
            fontSize: 86,
            fontWeight: 900,
            fontFamily: "'Noto Sans JP', sans-serif",
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: 20,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
            textShadow: "0 4px 30px rgba(0,0,0,0.8)",
            letterSpacing: -2,
          }}
        >
          {spotName}
        </div>

        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            fontFamily: "'Noto Sans JP', sans-serif",
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.4,
            transform: `translateY(${copyY}px)`,
            opacity: copyOpacity,
            textShadow: "0 2px 15px rgba(0,0,0,0.6)",
          }}
        >
          {catchCopy}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==============================
// Scene 3: 釣れる魚リスト
// ==============================
const FishListScene: React.FC<{
  fish: FishInfo[];
  fishPhoto: string;
}> = ({ fish, fishPhoto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, 120], [1.1, 1.25], {
    extrapolateRight: "clamp",
  });

  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* 魚の水中写真背景 */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Img
          src={fishPhoto}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom})`,
            filter: "saturate(1.1) contrast(1.1) brightness(0.5)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
        }}
      />

      {/* タイトル */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 72,
          right: 72,
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            fontFamily: "'Noto Sans JP', sans-serif",
            color: "#4ade80",
            opacity: interpolate(frame, [0, 15], [0, 1], {
              extrapolateRight: "clamp",
            }),
            textShadow: "0 0 40px rgba(74,222,128,0.3)",
          }}
        >
          今月釣れる魚
        </div>
      </div>

      {/* 魚カード */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: 72,
          right: 72,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {fish.map((f, i) => {
          const delay = i * 18;
          const cardOpacity = interpolate(
            frame,
            [12 + delay, 30 + delay],
            [0, 1],
            { extrapolateRight: "clamp" }
          );
          const cardX = spring({
            frame: frame - 12 - delay,
            fps,
            from: 80,
            to: 0,
            config: { damping: 12 },
          });

          const statusColors: Record<
            string,
            { bg: string; text: string; border: string }
          > = {
            激アツ: {
              bg: "rgba(239,68,68,0.3)",
              text: "#fca5a5",
              border: "rgba(239,68,68,0.5)",
            },
            最盛期: {
              bg: "rgba(74,222,128,0.25)",
              text: "#4ade80",
              border: "rgba(74,222,128,0.4)",
            },
            ラスト: {
              bg: "rgba(251,191,36,0.25)",
              text: "#fbbf24",
              border: "rgba(251,191,36,0.4)",
            },
          };
          const sc = statusColors[f.status] || statusColors["最盛期"];

          return (
            <div
              key={f.name}
              style={{
                opacity: cardOpacity,
                transform: `translateX(${cardX}px)`,
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 24,
                padding: "36px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    color: "#fff",
                  }}
                >
                  {f.name}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: 6,
                  }}
                >
                  {f.size}
                </div>
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  padding: "12px 28px",
                  borderRadius: 14,
                  background: sc.bg,
                  color: sc.text,
                  border: `1px solid ${sc.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                {f.status === "激アツ" ? "🔥 " : ""}
                {f.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* ブランド */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 72,
          right: 72,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(frame, [60, 80], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            background: "#0ea5e9",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 900,
            fontFamily: "'Noto Sans JP', sans-serif",
            color: "#fff",
          }}
        >
          釣
        </div>
        <div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              fontFamily: "'Noto Sans JP', sans-serif",
              color: "#fff",
            }}
          >
            ツリスポ
          </div>
          <div
            style={{
              fontSize: 20,
              fontFamily: "'Noto Sans JP', sans-serif",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            tsurispot.com
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==============================
// Scene 4: CTA
// ==============================
const CTAScene: React.FC<{ silhouettePhoto: string }> = ({
  silhouettePhoto,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 12 },
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const arrowX = interpolate(frame % 30, [0, 15, 30], [0, 14, 0]);

  return (
    <AbsoluteFill>
      {/* シルエット写真背景 */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Img
          src={silhouettePhoto}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.3) contrast(1.1) brightness(0.35)",
            transform: "scale(1.15)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity,
        }}
      >
        <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
          <div
            style={{
              width: 88,
              height: 88,
              background: "#0ea5e9",
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 900,
              fontFamily: "'Noto Sans JP', sans-serif",
              color: "#fff",
              margin: "0 auto 36px",
              boxShadow: "0 0 40px rgba(14,165,233,0.4)",
            }}
          >
            釣
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              fontFamily: "'Noto Sans JP', sans-serif",
              color: "#fff",
              marginBottom: 12,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            ツリスポ
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: "'Noto Sans JP', sans-serif",
              color: "rgba(255,255,255,0.5)",
              marginBottom: 56,
            }}
          >
            tsurispot.com
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              fontFamily: "'Noto Sans JP', sans-serif",
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
            }}
          >
            詳しくはプロフィールから
            <span
              style={{
                transform: `translateX(${arrowX}px)`,
                display: "inline-block",
              }}
            >
              →
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ==============================
// メイン
// ==============================
export const SpotRevealReel: React.FC<SpotRevealProps> = ({
  spotName,
  area,
  hook,
  catchCopy,
  fish,
  photos,
  bgmUrl,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* BGM */}
      <Audio src={staticFile("bgm-cinematic.mp3")} volume={0.7} />

      {/* Scene 1: フック (0〜4秒) */}
      <Sequence from={0} durationInFrames={120}>
        <HookScene text={hook} fishPhoto={photos.fish} />
      </Sequence>

      {/* Scene 2: 写真リビール (4〜9秒) */}
      <Sequence from={120} durationInFrames={150}>
        <RevealScene
          photoUrl={photos.main}
          spotName={spotName}
          area={area}
          catchCopy={catchCopy}
        />
      </Sequence>

      {/* Scene 3: 魚リスト (9〜13秒) */}
      <Sequence from={270} durationInFrames={120}>
        <FishListScene fish={fish} fishPhoto={photos.fish} />
      </Sequence>

      {/* Scene 4: CTA (13〜15秒) */}
      <Sequence from={390} durationInFrames={60}>
        <CTAScene silhouettePhoto={photos.silhouette} />
      </Sequence>
    </AbsoluteFill>
  );
};
