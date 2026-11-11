import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * WANTED の見出し帯（写真を暗く敷いて白文字）。サウナイキタイの「WANTED 未入力施設の情報募集中」型。
 * 背景は編集部撮影の磯の写真（人物は小さく顔の判別不可）。
 */
export function WantedHero({
  title,
  lead,
  note,
  children,
  as: Tag = "p",
  className,
}: {
  title: string;
  lead: string;
  note?: React.ReactNode;
  children?: React.ReactNode;
  as?: "h1" | "h2" | "p";
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gray-900 text-white", className)}>
      <Image
        src="/images/hero/rocky-coast.jpg"
        alt=""
        fill
        sizes="(min-width: 1152px) 1152px, 100vw"
        className="pointer-events-none select-none object-cover opacity-45"
      />
      <div className="relative flex flex-col items-center px-5 py-10 text-center sm:py-14">
        <Tag className="font-display text-5xl font-black tracking-wide sm:text-7xl">{title}</Tag>
        <p className="mt-3 text-base font-bold sm:text-xl">{lead}</p>
        {note && <div className="mt-3 text-sm font-bold sm:text-base">{note}</div>}
        {children}
      </div>
    </div>
  );
}
