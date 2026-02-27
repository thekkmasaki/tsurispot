import { Baby, Shield, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FamilyInfo } from "@/types";

interface FamilyInfoCardProps {
  familyInfo?: FamilyInfo;
  spotType: string;
  hasToilet: boolean;
  hasParking: boolean;
  difficulty: string;
}

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
      ○
    </Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
      ×
    </Badge>
  );
}

function getDefaultMessage(spotType: string, difficulty: string): string {
  if (spotType === "rocky") {
    return "磯は足場が不安定なため、小さなお子様には不向きです。ライフジャケットの着用を必ずお願いします。";
  }
  if (
    (spotType === "pier" || spotType === "breakwater") &&
    difficulty === "beginner"
  ) {
    return "堤防・桟橋は柵がある場所が多く、比較的安全にファミリーフィッシングを楽しめます。";
  }
  if (difficulty === "beginner") {
    return "初心者向けの釣り場のため、比較的ファミリーフレンドリーなスポットです。";
  }
  if (difficulty === "advanced") {
    return "上級者向けの釣り場のため、小さなお子様連れにはおすすめしません。";
  }
  return "お子様連れの場合は、足場の安全性を事前にご確認ください。";
}

export function FamilyInfoCard({
  familyInfo,
  spotType,
  hasToilet,
  hasParking,
  difficulty,
}: FamilyInfoCardProps) {
  if (familyInfo) {
    const items = [
      { label: "ベビーカー", value: familyInfo.strollerAccessible },
      { label: "柵・手すり", value: familyInfo.hasRailing },
      { label: "子どもの遊び場", value: familyInfo.hasPlayArea },
      { label: "おむつ替え", value: familyInfo.hasBabyChanging },
      { label: "授乳スペース", value: familyInfo.hasNursing },
    ];

    return (
      <Card className="py-4">
        <CardContent className="px-4 space-y-4">
          <div className="flex items-center gap-2">
            <Baby className="size-5 text-pink-500" />
            <h3 className="text-base font-semibold">ファミリー向け情報</h3>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <YesNo value={item.value} />
              </div>
            ))}
            {familyInfo.parkingToSpotDistance && (
              <div className="flex items-center justify-between col-span-2">
                <span className="text-muted-foreground">駐車場→釣り場</span>
                <span className="font-medium text-sm">
                  {familyInfo.parkingToSpotDistance}
                </span>
              </div>
            )}
          </div>

          {familyInfo.familyNotes && (
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              <Info className="size-4 shrink-0 mt-0.5" />
              <p>{familyInfo.familyNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // familyInfo がない場合のデフォルト表示
  const message = getDefaultMessage(spotType, difficulty);

  return (
    <Card className="py-4">
      <CardContent className="px-4 space-y-3">
        <div className="flex items-center gap-2">
          <Baby className="size-5 text-pink-500" />
          <h3 className="text-base font-semibold">ファミリー向け情報</h3>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Shield className="size-4 shrink-0 mt-0.5" />
          <p>{message}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {hasToilet && (
            <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700 hover:bg-green-50">
              トイレあり
            </Badge>
          )}
          {hasParking && (
            <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700 hover:bg-green-50">
              駐車場あり
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground italic">
          ※ 一般的な情報です。現地でご確認ください。
        </p>
      </CardContent>
    </Card>
  );
}
