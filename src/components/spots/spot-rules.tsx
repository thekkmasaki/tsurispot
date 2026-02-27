import { Check, X, AlertTriangle, Info, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpotRules, SPOT_TYPE_LABELS } from "@/types";

interface SpotRulesCardProps {
  rules?: SpotRules;
  spotType: string;
  spotName: string;
}

interface RuleItem {
  label: string;
  value: boolean | "partial";
  description: string;
}

function getDefaultRules(spotType: string): {
  items: RuleItem[];
  licenseRequired: boolean | "maybe";
} {
  switch (spotType) {
    case "port":
      return {
        items: [
          { label: "投げ釣り", value: "partial", description: "場所によって禁止されていることがあります" },
          { label: "ルアー釣り", value: true, description: "ルアーやワームを使った釣りができます" },
          { label: "コマセ（撒き餌）", value: "partial", description: "禁止されている漁港もあるため現地で確認してください" },
        ],
        licenseRequired: false,
      };
    case "beach":
      return {
        items: [
          { label: "投げ釣り", value: true, description: "振りかぶって遠くに投げる釣り方ができます" },
          { label: "ルアー釣り", value: true, description: "ルアーやワームを使った釣りができます" },
          { label: "コマセ（撒き餌）", value: true, description: "撒き餌を使った釣りができます" },
        ],
        licenseRequired: false,
      };
    case "rocky":
      return {
        items: [
          { label: "投げ釣り", value: true, description: "振りかぶって遠くに投げる釣り方ができます" },
          { label: "ルアー釣り", value: true, description: "ルアーやワームを使った釣りができます" },
          { label: "コマセ（撒き餌）", value: true, description: "撒き餌を使った釣りができます" },
        ],
        licenseRequired: false,
      };
    case "river":
      return {
        items: [
          { label: "投げ釣り", value: true, description: "振りかぶって遠くに投げる釣り方ができます" },
          { label: "ルアー釣り", value: true, description: "ルアーやワームを使った釣りができます" },
          { label: "コマセ（撒き餌）", value: false, description: "河川ではコマセが禁止されている場所が多いです" },
        ],
        licenseRequired: "maybe",
      };
    case "pier":
      return {
        items: [
          { label: "投げ釣り", value: false, description: "桟橋では投げ釣り禁止のことが多いです" },
          { label: "ルアー釣り", value: "partial", description: "軽めのルアーのみ許可されていることがあります" },
          { label: "コマセ（撒き餌）", value: false, description: "桟橋ではコマセ禁止のことが多いです" },
        ],
        licenseRequired: false,
      };
    case "breakwater":
      return {
        items: [
          { label: "投げ釣り", value: "partial", description: "場所によって禁止されていることがあります" },
          { label: "ルアー釣り", value: true, description: "ルアーやワームを使った釣りができます" },
          { label: "コマセ（撒き餌）", value: "partial", description: "禁止されている堤防もあるため現地で確認してください" },
        ],
        licenseRequired: false,
      };
    default:
      return {
        items: [
          { label: "投げ釣り", value: "partial", description: "現地の案内をご確認ください" },
          { label: "ルアー釣り", value: "partial", description: "現地の案内をご確認ください" },
          { label: "コマセ（撒き餌）", value: "partial", description: "現地の案内をご確認ください" },
        ],
        licenseRequired: false,
      };
  }
}

function RuleIcon({ value }: { value: boolean | "partial" }) {
  if (value === true) {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-green-100 text-green-600">
        <Check className="size-4" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-red-100 text-red-600">
        <X className="size-4" />
      </span>
    );
  }
  return (
    <span className="flex size-6 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
      <AlertTriangle className="size-3.5" />
    </span>
  );
}

function statusLabel(value: boolean | "partial"): string {
  if (value === true) return "OK";
  if (value === false) return "NG";
  return "場所による";
}

export function SpotRulesCard({ rules, spotType, spotName }: SpotRulesCardProps) {
  const isDefault = !rules;
  const spotTypeLabel = SPOT_TYPE_LABELS[spotType as keyof typeof SPOT_TYPE_LABELS] || spotType;

  let ruleItems: RuleItem[];
  let showLicenseWarning: boolean;
  let licenseLabel: string;

  if (rules) {
    ruleItems = [
      {
        label: "投げ釣り",
        value: rules.castingAllowed,
        description: rules.castingAllowed
          ? "振りかぶって遠くに投げる釣り方ができます"
          : "このスポットでは投げ釣りが禁止されています",
      },
      {
        label: "ルアー釣り",
        value: rules.lureAllowed,
        description: rules.lureAllowed
          ? "ルアーやワームを使った釣りができます"
          : "このスポットではルアー釣りが禁止されています",
      },
      {
        label: "コマセ（撒き餌）",
        value: rules.chumAllowed,
        description: rules.chumAllowed
          ? "撒き餌を使った釣りができます"
          : "このスポットではコマセ（撒き餌）が禁止されています",
      },
    ];
    showLicenseWarning = rules.fishingLicenseRequired;
    licenseLabel = rules.fishingLicenseRequired
      ? "遊漁券が必要です"
      : "遊漁券は不要です";
  } else {
    const defaults = getDefaultRules(spotType);
    ruleItems = defaults.items;
    showLicenseWarning = defaults.licenseRequired === true || defaults.licenseRequired === "maybe";
    licenseLabel =
      defaults.licenseRequired === true
        ? "遊漁券が必要な場合があります"
        : defaults.licenseRequired === "maybe"
          ? "遊漁券が必要な場合があります（漁協に確認）"
          : "遊漁券は通常不要です";
  }

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="size-5 text-blue-600" />
          <h3 className="text-base font-bold sm:text-lg">
            {spotName}の釣りルール・禁止事項
          </h3>
        </div>

        {isDefault && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              ※ 一般的な{spotTypeLabel}のルールです。現地の案内をご確認ください。
            </p>
          </div>
        )}

        {/* 遊漁券警告 */}
        {showLicenseWarning && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-bold">{licenseLabel}</p>
              <p className="mt-1 text-xs">
                遊漁券は近くの釣具店やコンビニで購入できることが多いです。事前に確認しましょう。
              </p>
            </div>
          </div>
        )}

        {/* 主要ルール */}
        <div className="space-y-3">
          {ruleItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <RuleIcon value={item.value} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      item.value === true
                        ? "border-green-200 bg-green-50 text-green-700"
                        : item.value === false
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-yellow-200 bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {statusLabel(item.value)}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 追加ルール（rulesがある場合のみ） */}
        {rules && (
          <div className="mt-4 space-y-2">
            {rules.maxRods != null && (
              <div className="flex items-start gap-2 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
                <p>
                  <span className="font-medium">竿の本数制限:</span> 最大{rules.maxRods}本まで
                </p>
              </div>
            )}
            {rules.minKeepSize && (
              <div className="flex items-start gap-2 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
                <p>
                  <span className="font-medium">持ち帰りサイズ制限:</span> {rules.minKeepSize}
                </p>
              </div>
            )}
            {rules.restrictedAreas && rules.restrictedAreas.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <div>
                  <p className="font-medium">立入禁止エリア:</p>
                  <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                    {rules.restrictedAreas.map((area, i) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {rules.otherRules && rules.otherRules.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
                <div>
                  <p className="font-medium">その他のルール:</p>
                  <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                    {rules.otherRules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 遊漁券が不要の場合の表示（rulesがある場合のみ） */}
        {rules && !rules.fishingLicenseRequired && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            <Check className="mt-0.5 size-4 shrink-0" />
            <p>遊漁券は不要です。無料で釣りを楽しめます。</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
