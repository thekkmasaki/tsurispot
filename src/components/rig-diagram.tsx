"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

type RigType = "sabiki" | "choinage" | "float" | "anazuri";

interface RigPart {
  label: string;
  detail?: string;
  color: "line" | "rig" | "bait" | "weight" | "rod" | "connector";
  children?: RigPart[];
  indent?: boolean;
}

const colorMap = {
  rod: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600",
  line: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700",
  connector: "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-700",
  rig: "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-200 dark:border-green-700",
  bait: "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-700",
  weight: "bg-gray-100 text-gray-700 border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-500",
};

const dotColorMap = {
  rod: "bg-slate-400",
  line: "bg-blue-400",
  connector: "bg-purple-400",
  rig: "bg-green-500",
  bait: "bg-orange-400",
  weight: "bg-gray-500",
};

const rigData: Record<RigType, { title: string; description: string; parts: RigPart[] }> = {
  sabiki: {
    title: "サビキ仕掛け",
    description: "コマセで魚を寄せて複数の針で釣る、初心者に最もおすすめの仕掛け",
    parts: [
      { label: "竿先", color: "rod" },
      { label: "道糸", detail: "ナイロン3号", color: "line" },
      { label: "サルカン", detail: "道糸と仕掛けの接続", color: "connector" },
      {
        label: "サビキ仕掛け",
        detail: "5~7号",
        color: "rig",
        children: [
          { label: "枝ス+針", detail: "x6本（疑似餌付き）", color: "rig" },
        ],
      },
      {
        label: "コマセカゴ",
        detail: "下カゴ式",
        color: "rig",
        children: [
          { label: "アミエビ", detail: "7~8分目まで詰める", color: "bait" },
        ],
      },
      { label: "オモリ", detail: "6~8号", color: "weight" },
    ],
  },
  choinage: {
    title: "ちょい投げ仕掛け",
    description: "テンビンオモリで砂底のキスやハゼを狙う、手軽な投げ仕掛け",
    parts: [
      { label: "竿先", color: "rod" },
      { label: "道糸", detail: "ナイロン3号", color: "line" },
      {
        label: "テンビン",
        detail: "L型 / ジェット天秤",
        color: "connector",
        children: [
          { label: "オモリ", detail: "5~10号", color: "weight" },
        ],
      },
      { label: "ハリス", detail: "フロロ1~1.5号 / 50cm", color: "line" },
      {
        label: "針",
        detail: "キス針7号",
        color: "rig",
        children: [
          { label: "エサ", detail: "イソメ（2~3cm）", color: "bait" },
        ],
      },
    ],
  },
  float: {
    title: "ウキ仕掛け",
    description: "ウキの動きでアタリを取る、チヌ・グレ・メバルを狙う伝統的な仕掛け",
    parts: [
      { label: "竿先", color: "rod" },
      { label: "道糸", detail: "ナイロン2~3号", color: "line" },
      { label: "ウキ止め", detail: "タナ調整用", color: "connector" },
      { label: "シモリ玉", detail: "ウキのストッパー", color: "connector" },
      { label: "ウキ", detail: "棒ウキ or 円錐ウキ", color: "rig" },
      { label: "からまん棒", detail: "糸絡み防止", color: "connector" },
      { label: "ガン玉", detail: "B~3B", color: "weight" },
      { label: "サルカン", detail: "道糸とハリスの接続", color: "connector" },
      { label: "ハリス", detail: "1~1.5号 / 1~1.5m", color: "line" },
      {
        label: "針",
        detail: "チヌ2号 or グレ5号",
        color: "rig",
        children: [
          { label: "エサ", detail: "オキアミ", color: "bait" },
        ],
      },
    ],
  },
  anazuri: {
    title: "穴釣り仕掛け（ブラクリ）",
    description: "テトラの隙間でカサゴ・メバルを狙う、最もシンプルな仕掛け",
    parts: [
      { label: "竿先", detail: "短竿 1~1.5m", color: "rod" },
      { label: "道糸", detail: "ナイロン3~4号", color: "line" },
      {
        label: "ブラクリ仕掛け",
        detail: "2~3号",
        color: "rig",
        children: [
          { label: "オモリ", detail: "赤色（丸型）", color: "weight" },
          {
            label: "針",
            color: "rig",
            children: [
              { label: "エサ", detail: "イソメ・サバ切り身", color: "bait" },
            ],
          },
        ],
      },
    ],
  },
};

function RigPartNode({
  part,
  isLast,
  depth = 0,
}: {
  part: RigPart;
  isLast: boolean;
  depth?: number;
}) {
  const hasChildren = part.children && part.children.length > 0;

  return (
    <div className={depth > 0 ? "ml-4 sm:ml-6" : ""}>
      <div className="flex items-stretch gap-0">
        {/* Vertical line connector */}
        <div className="flex w-5 shrink-0 flex-col items-center sm:w-6">
          {/* Top half of vertical line */}
          <div className="w-px flex-1 bg-border" />
          {/* Dot */}
          <div
            className={`size-2.5 shrink-0 rounded-full ${dotColorMap[part.color]}`}
          />
          {/* Bottom half of vertical line */}
          {isLast && !hasChildren ? (
            <div className="flex-1" />
          ) : (
            <div className="w-px flex-1 bg-border" />
          )}
        </div>

        {/* Part badge */}
        <div className="flex flex-1 items-center py-1.5">
          <div
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs sm:text-sm ${colorMap[part.color]}`}
          >
            <span className="font-medium">{part.label}</span>
            {part.detail && (
              <span className="opacity-75">({part.detail})</span>
            )}
          </div>
        </div>
      </div>

      {/* Child parts */}
      {hasChildren &&
        part.children!.map((child, idx) => (
          <RigPartNode
            key={`${child.label}-${idx}`}
            part={child}
            isLast={isLast && idx === part.children!.length - 1}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

export function RigDiagram({ type }: { type: RigType }) {
  const [isOpen, setIsOpen] = useState(true);
  const rig = rigData[type];

  return (
    <Card className="my-4 overflow-hidden border-2 border-primary/20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 sm:px-6"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎣</span>
          <div>
            <p className="text-sm font-bold sm:text-base">{rig.title}</p>
            <p className="text-xs text-muted-foreground">{rig.description}</p>
          </div>
        </div>
        <ChevronDown
          className={`size-5 shrink-0 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <CardContent className="border-t px-4 pb-5 pt-4 sm:px-6">
          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1 text-[10px]">
              <span className="size-2 rounded-full bg-blue-400" />
              道糸・ハリス
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <span className="size-2 rounded-full bg-green-500" />
              仕掛け・針
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <span className="size-2 rounded-full bg-orange-400" />
              エサ
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <span className="size-2 rounded-full bg-gray-500" />
              オモリ
            </Badge>
          </div>

          {/* Rig parts */}
          <div>
            {rig.parts.map((part, idx) => (
              <RigPartNode
                key={`${part.label}-${idx}`}
                part={part}
                isLast={idx === rig.parts.length - 1}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
