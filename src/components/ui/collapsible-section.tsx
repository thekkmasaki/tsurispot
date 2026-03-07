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
}

export function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  previewText,
  mobileOnly = false,
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

  if (mobileOnly) {
    return (
      <>
        <div className="md:hidden">
          {button}
          {content}
        </div>
        <div className="hidden md:block">{children}</div>
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
