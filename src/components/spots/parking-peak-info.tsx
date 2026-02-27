import { Car, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ParkingPeakInfo } from "@/types";

interface ParkingPeakCardProps {
  parkingPeakInfo?: ParkingPeakInfo;
  hasParking: boolean;
  parkingDetail?: string;
}

export function ParkingPeakCard({
  parkingPeakInfo,
  hasParking,
  parkingDetail,
}: ParkingPeakCardProps) {
  if (!hasParking) return null;

  const peakStart = parkingPeakInfo?.peakStartTime ?? "休日8:00頃";
  const recommended = parkingPeakInfo?.recommendedArrival ?? "早めの到着がおすすめ";
  const alternate = parkingPeakInfo?.alternateParking;
  const isDefault = !parkingPeakInfo;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Car className="size-4 text-blue-600" />
        <h4 className="text-sm font-semibold">駐車場の混雑目安</h4>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">混み始め:</span>
          <span className="font-medium">{peakStart}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-green-300 bg-green-50 text-green-700 hover:bg-green-50">
            おすすめ
          </Badge>
          <span className="font-medium">{recommended}</span>
        </div>
        {alternate && (
          <div className="flex items-start gap-2">
            <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
            <span className="text-muted-foreground">満車時:</span>
            <span className="text-sm">{alternate}</span>
          </div>
        )}
      </div>

      {isDefault && (
        <p className="text-xs text-muted-foreground italic">
          ※ 一般的な目安です。現地の状況によって異なります。
        </p>
      )}
    </div>
  );
}
