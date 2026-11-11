import { Sakanacchi } from "@/components/fun/sakanacchi";
import { cn } from "@/lib/utils";

/**
 * 海の青の帯 + ひとことセリフ + 水面から顔を出す さかなっち2匹。
 * ページ上部の「この画面で何ができるか」を、可愛げのある一言で伝える装飾帯。
 *
 * - Server Component。SVGのみで画像ファイルなし。高さ固定なので CLS 0。
 * - セリフは本文ではなく装飾的な補足（h1・本文の前後関係は変えない）。
 * - 動きは さかなっち の swim（transform のみ）。reduced-motion で停止。
 */
export function MascotBand({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-28 overflow-hidden rounded-2xl bg-blue-700 px-5 pt-4 sm:h-32 sm:px-8 sm:pt-5",
        className
      )}
    >
      <p className="relative z-10 text-sm font-bold leading-snug text-white sm:text-lg">{message}</p>
      {/* 水面から顔を出す2匹（下半分は帯の外で隠れる） */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 flex translate-y-[38%] items-end justify-center gap-3 sm:gap-6"
      >
        <Sakanacchi size={84} className="-scale-x-100" />
        <Sakanacchi size={68} className="[&_g]:[animation-delay:-1.1s]" />
      </div>
      {/* 水面 */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 16"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-4 w-full"
      >
        <path d="M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 T250 6 T300 6 T350 6 T400 6 V16 H0Z" fill="rgb(255 255 255 / 0.18)" />
      </svg>
    </div>
  );
}
