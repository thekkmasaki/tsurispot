import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

const safetyConfig = {
  safe: {
    icon: ShieldCheck,
    label: "安全",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    textClass: "text-emerald-800",
    badgeClass: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    iconClass: "text-emerald-600",
  },
  caution: {
    icon: AlertTriangle,
    label: "注意が必要",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    textClass: "text-amber-800",
    badgeClass: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    iconClass: "text-amber-600",
  },
  danger: {
    icon: ShieldAlert,
    label: "危険箇所あり",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    textClass: "text-red-800",
    badgeClass: "bg-red-100 text-red-700 hover:bg-red-100",
    iconClass: "text-red-600",
  },
};

export function SafetyWarning({
  level,
  notes,
  isKuchikomi,
}: {
  level?: "safe" | "caution" | "danger";
  notes?: string[];
  isKuchikomi?: boolean;
}) {
  if (!level && !isKuchikomi) return null;

  const config = safetyConfig[level ?? "safe"];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "overflow-hidden border py-0",
        config.borderClass,
        config.bgClass
      )}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon className={cn("size-5", config.iconClass)} />
          <Badge className={cn("text-xs", config.badgeClass)}>
            {config.label}
          </Badge>
          {isKuchikomi && (
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-xs text-blue-700"
            >
              口コミスポット
            </Badge>
          )}
        </div>

        {notes && notes.length > 0 && (
          <ul className="space-y-1.5">
            {notes.map((note, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 text-sm leading-relaxed",
                  config.textClass
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {level === "danger" ? "⚠️" : level === "caution" ? "⚡" : "✓"}
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}

        {(level === "caution" || level === "danger") && (
          <p
            className={cn(
              "mt-3 rounded-md bg-white/60 p-2 text-xs font-medium",
              config.textClass
            )}
          >
            ※
            安全を第一に考え、天候や潮の状況を必ず確認してから釣行してください。ライフジャケットの着用を強くおすすめします。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
