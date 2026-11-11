/**
 * ツリスポ公式マスコット「さかなっち」（オリジナルSVG・画像ファイルなし）
 *
 * - 特定の魚種ではない丸い小魚。色は海の青1色に固定（魚種名の文脈と混ざらないように）。
 * - Server Component からそのまま使える（イベントハンドラ無し）。
 * - 動きは transform/opacity のみ（CLS 0）。prefers-reduced-motion は globals.css の包括ルールで停止。
 *
 * motion:
 *   "swim"  … ゆらゆら泳ぐ（空の状態・404 など待機表示）
 *   "jump"  … ピチッと跳ねる1回（親で key を変えるか、.sakanacchi-jump を付け直して再生）
 *   "none"  … 静止
 */
type Props = {
  size?: number;
  motion?: "swim" | "jump" | "none";
  /** ハートを出す（喜び表現: 投稿完了・行きたい 等） */
  happy?: boolean;
  className?: string;
  /** 意味のある画像として読ませたい場合のみ指定。未指定なら装飾扱い(aria-hidden) */
  title?: string;
};

export function Sakanacchi({ size = 64, motion = "swim", happy = false, className, title }: Props) {
  const bodyClass =
    motion === "swim" ? "sakanacchi-swim" : motion === "jump" ? "sakanacchi-jump" : undefined;
  return (
    <svg
      viewBox="0 0 140 120"
      width={size}
      height={(size * 120) / 140}
      className={className}
      style={{ overflow: "visible" }}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {happy && (
        <path
          className="sakanacchi-heart"
          d="M108 18 c4-8 16-4 12 4 l-12 12 l-12-12 c-4-8 8-12 12-4z"
          fill="oklch(63.7% 0.237 25.331)"
        />
      )}
      <g className={bodyClass}>
        <path d="M100 60 L132 36 Q 126 60 132 84 Z" fill="oklch(71% 0.12 242)" />
        <ellipse cx="66" cy="60" rx="46" ry="38" fill="oklch(71% 0.12 242)" />
        <path d="M30 70 Q 66 102 104 68 Q 66 84 30 70Z" fill="oklch(95% 0.03 230)" />
        <path d="M60 24 Q 72 8 86 26" fill="oklch(71% 0.12 242)" />
        <ellipse className="sakanacchi-eye" cx="48" cy="54" rx="6" ry="7.5" fill="#1f2a33" />
        <circle cx="50" cy="51" r="2.2" fill="#fff" />
        <ellipse cx="40" cy="70" rx="6" ry="3.5" fill="#f6a6a0" opacity="0.8" />
        <path d="M24 62 Q 28 66 24 70" fill="none" stroke="#1f2a33" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M76 52 Q 84 60 76 68" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </g>
    </svg>
  );
}
