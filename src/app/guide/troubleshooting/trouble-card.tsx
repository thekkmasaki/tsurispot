"use client";

import { useState } from "react";
import {
  ChevronDown,
  CheckCircle,
  Lightbulb,
  Fish,
  Waves,
  Anchor,
  AlertTriangle,
  CloudLightning,
  ShieldAlert,
  Wind,
  Target,
  Settings,
  Snowflake,
  CircleDot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface TroubleTip {
  title: string;
  description: string;
}

export interface TroubleSection {
  id: string;
  iconName: string;
  title: string;
  subtitle: string;
  badge: { label: string; color: string };
  tips: TroubleTip[];
  preventionTips?: string[];
  proTip?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  fish: <Fish className="size-6 text-blue-600" />,
  waves: <Waves className="size-6 text-cyan-600" />,
  anchor: <Anchor className="size-6 text-stone-600" />,
  "alert-triangle": <AlertTriangle className="size-6 text-orange-600" />,
  "cloud-lightning": <CloudLightning className="size-6 text-purple-600" />,
  "shield-alert": <ShieldAlert className="size-6 text-rose-600" />,
  wind: <Wind className="size-6 text-teal-600" />,
  target: <Target className="size-6 text-emerald-600" />,
  settings: <Settings className="size-6 text-gray-600" />,
  snowflake: <Snowflake className="size-6 text-sky-600" />,
  "circle-dot": <CircleDot className="size-6 text-indigo-600" />,
};

export function TroubleCard({ section }: { section: TroubleSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const icon = iconMap[section.iconName] ?? null;

  return (
    <Card
      className="overflow-hidden transition-shadow hover:shadow-md"
      id={section.id}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-6"
        aria-expanded={isOpen}
        aria-controls={`content-${section.id}`}
      >
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold sm:text-xl">
              {section.title}
            </h2>
            <Badge
              className={`text-[10px] sm:text-xs ${section.badge.color}`}
            >
              {section.badge.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {section.subtitle}
          </p>
        </div>
        <ChevronDown
          className={`mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={`content-${section.id}`}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <CardContent className="border-t pt-5">
            <div className="space-y-4">
              {section.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border/60 bg-muted/30 p-4"
                >
                  <div className="mb-2 flex items-start gap-2">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-600" />
                    <h3 className="font-bold leading-snug">
                      {tip.title}
                    </h3>
                  </div>
                  <p className="pl-6 text-sm leading-relaxed text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>

            {section.preventionTips && section.preventionTips.length > 0 && (
              <div className="mt-5 rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 dark:bg-blue-950/30">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  予防のコツ
                </p>
                <ul className="space-y-1">
                  {section.preventionTips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-200"
                    >
                      <span className="mt-1 shrink-0 text-blue-500">&#9679;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.proTip && (
              <div className="mt-5 flex gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30">
                <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    編集長のワンポイント
                  </p>
                  <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                    {section.proTip}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
