import { GearGuide as GearGuideType, DIFFICULTY_LABELS } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const difficultyColors = {
  beginner: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  intermediate: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  advanced: "bg-red-100 text-red-700 hover:bg-red-100",
};

function GearRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="w-5 text-center text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm font-semibold">{value}</dd>
      </div>
    </div>
  );
}

export function GearGuideCard({ guide }: { guide: GearGuideType }) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="border-b bg-muted/50 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold sm:text-base">
            {guide.method}
            <span className="ml-1 text-xs font-normal text-muted-foreground sm:ml-1.5 sm:text-sm">
              （{guide.targetFish}狙い）
            </span>
          </h4>
          <Badge className={cn("shrink-0 text-xs", difficultyColors[guide.difficulty])}>
            {DIFFICULTY_LABELS[guide.difficulty]}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3 sm:p-4">
        <dl className="divide-y">
          <GearRow icon="🎣" label="竿（ロッド）" value={guide.rod} />
          <GearRow icon="🔄" label="リール" value={guide.reel} />
          <GearRow icon="🧵" label="糸（ライン）" value={guide.line} />
          <GearRow icon="🪝" label="仕掛け・針" value={guide.hook} />
        </dl>

        {guide.otherItems.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              その他必要なもの
            </p>
            <div className="flex flex-wrap gap-1.5">
              {guide.otherItems.map((item) => (
                <Badge key={item} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {guide.tip && (
          <div className="mt-3 rounded-lg bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-800">
              💡 初心者向けコツ
            </p>
            <p className="mt-1 text-sm text-amber-700">{guide.tip}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GearGuideList({ guides }: { guides?: GearGuideType[] }) {
  if (!guides || guides.length === 0) return null;

  return (
    <div className="space-y-4">
      {guides.map((guide, index) => (
        <GearGuideCard key={`${guide.targetFish}-${guide.method}-${index}`} guide={guide} />
      ))}
    </div>
  );
}
