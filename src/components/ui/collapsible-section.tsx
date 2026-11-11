"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** 折りたたみ時に表示する補足テキスト */
  previewText?: string;
  /** モバイルのみ折りたたみ（デフォルト: false = 全デバイスで折りたたみ） */
  mobileOnly?: boolean;
  /** mobileOnly時、md以上でもタイトルを見出しとして表示する（子要素に独自のPC用見出しがある場合は false） */
  showTitleOnDesktop?: boolean;
}

export function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  previewText,
  mobileOnly = false,
  showTitleOnDesktop = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const button = (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted/80"
      aria-expanded={isOpen}
    >
      <span className="flex items-center gap-2 text-base font-bold">
        {icon}
        {title}
      </span>
      <span className="flex items-center gap-2">
        {!isOpen && previewText && (
          <span className="text-xs text-muted-foreground">{previewText}</span>
        )}
        <ChevronDown
          className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </span>
    </button>
  );

  const content = (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <div className="pt-3">{children}</div>
      </div>
    </div>
  );

  // モバイルのみ折りたたみ。以前は children をモバイル用・PC用で2回描画しており、
  // HTML上で本文・リンク・見出しが二重になっていた（FAQ12件表示等）。
  // children は1回だけ描画し、md以上では CSS で常に展開＋見出し表示にする。
  if (mobileOnly) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted/80 md:pointer-events-none md:border-0 md:bg-transparent md:px-0 md:py-0 md:hover:bg-transparent ${
            showTitleOnDesktop ? "" : "md:hidden"
          }`}
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2 text-base font-bold md:text-lg">
            {icon}
            {title}
          </span>
          <span className="flex items-center gap-2 md:hidden">
            {!isOpen && previewText && (
              <span className="text-xs text-muted-foreground">{previewText}</span>
            )}
            <ChevronDown
              className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out md:grid-rows-[1fr] ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-3">{children}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {button}
      {content}
    </>
  );
}
