import { Car, MapPin, Clock, Info, ExternalLink, CircleParking } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ParkingGuide, AlternateParking } from "@/types";

interface ParkingGuideCardProps {
  parkingGuide?: ParkingGuide;
  hasParking: boolean;
  parkingDetail?: string;
  spotName: string;
  spotLatitude: number;
  spotLongitude: number;
}

/** parkingDetailテキストから料金種別を推論 */
function inferFee(parkingDetail?: string): "free" | "paid" | "conditional" {
  if (!parkingDetail) return "free";
  const text = parkingDetail.toLowerCase();
  if (/無料/.test(text)) return "free";
  if (/有料|円/.test(text)) return "paid";
  if (/夏季|期間|時期|シーズン/.test(text)) return "conditional";
  return "free";
}

/** parkingDetailテキストから台数を推論 */
function inferCapacity(parkingDetail?: string): number | undefined {
  if (!parkingDetail) return undefined;
  const match = parkingDetail.match(/(\d+)\s*台/);
  return match ? parseInt(match[1], 10) : undefined;
}

/** parkingDetailテキストから駐車場名を抽出（「○○駐車場」パターン） */
function inferParkingName(parkingDetail?: string): string | undefined {
  if (!parkingDetail) return undefined;
  const match = parkingDetail.match(/([^\s（(、,]+駐車場)/);
  return match ? match[1] : undefined;
}

const FEE_CONFIG = {
  free: { label: "無料", className: "border-green-300 bg-green-50 text-green-700" },
  paid: { label: "有料", className: "border-orange-300 bg-orange-50 text-orange-700" },
  conditional: { label: "条件付き", className: "border-yellow-300 bg-yellow-50 text-yellow-700" },
} as const;

function GoogleMapsLink({ latitude, longitude, label }: { latitude: number; longitude: number; label: string }) {
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
    >
      <MapPin className="size-3.5" />
      {label}
      <ExternalLink className="size-3" />
    </a>
  );
}

function AlternateParkingItem({ alt }: { alt: AlternateParking }) {
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="font-medium">{alt.name}</span>
      {alt.distance && <span className="text-muted-foreground">（{alt.distance}）</span>}
      {alt.fee && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{alt.fee}</Badge>}
      {alt.latitude && alt.longitude && (
        <GoogleMapsLink latitude={alt.latitude} longitude={alt.longitude} label="地図" />
      )}
    </li>
  );
}

export function ParkingGuideCard({
  parkingGuide,
  hasParking,
  parkingDetail,
  spotName,
  spotLatitude,
  spotLongitude,
}: ParkingGuideCardProps) {
  // 駐車場なしの場合
  if (!hasParking) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CircleParking className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">駐車場ガイド</h4>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-sm text-orange-800">{spotName}には専用駐車場がありません。</p>
          <a
            href={`https://www.google.com/maps/search/駐車場/@${spotLatitude},${spotLongitude},15z`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-700"
          >
            <MapPin className="size-3.5" />
            周辺のコインパーキングを検索
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    );
  }

  // parkingGuideがある場合はリッチ表示、なければparkingDetailから推論
  const fee = parkingGuide?.fee ?? inferFee(parkingDetail);
  const feeDetail = parkingGuide?.feeDetail ?? (fee === "paid" && parkingDetail ? parkingDetail : undefined);
  const capacity = parkingGuide?.capacity ?? inferCapacity(parkingDetail);
  const feeConfig = FEE_CONFIG[fee];
  const parkingName = parkingGuide?.parkingName ?? inferParkingName(parkingDetail);
  const isInferred = !parkingGuide;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CircleParking className="size-4 text-blue-600" />
        <h4 className="text-sm font-semibold">駐車場ガイド</h4>
      </div>

      {/* 料金・台数 */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={`text-xs ${feeConfig.className}`}>
          <Car className="size-3 mr-1" />
          {feeConfig.label}
        </Badge>
        {capacity && (
          <Badge variant="outline" className="text-xs">
            約{capacity}台
          </Badge>
        )}
        {parkingGuide?.parkingName && (
          <span className="text-sm font-medium">{parkingGuide.parkingName}</span>
        )}
      </div>

      {/* 詳細情報 */}
      <div className="space-y-2 text-sm">
        {feeDetail && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">料金:</span>
            <span>{feeDetail}</span>
          </div>
        )}
        {parkingGuide?.locationNote && (
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">場所:</span>
            <span>{parkingGuide.locationNote}</span>
          </div>
        )}
        {parkingGuide?.walkToSpot && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">釣り場まで:</span>
            <span>{parkingGuide.walkToSpot}</span>
          </div>
        )}
        {parkingGuide?.peakTime && (
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">混み始め:</span>
            <span>{parkingGuide.peakTime}</span>
          </div>
        )}

        {/* 駐車場の地図リンク */}
        <div className="flex flex-wrap gap-2">
          {parkingGuide?.parkingLatitude && parkingGuide?.parkingLongitude ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${parkingGuide.parkingLatitude},${parkingGuide.parkingLongitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <MapPin className="size-3.5" />
              駐車場の場所を地図で確認
              <ExternalLink className="size-3" />
            </a>
          ) : parkingName ? (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parkingName)}&center=${spotLatitude},${spotLongitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <MapPin className="size-3.5" />
              {parkingName}を地図で確認
              <ExternalLink className="size-3" />
            </a>
          ) : (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('駐車場')}&center=${spotLatitude},${spotLongitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <MapPin className="size-3.5" />
              周辺に駐車場を地図で確認
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>

      {/* 注意事項 */}
      {parkingGuide?.notes && parkingGuide.notes.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-2">
          <ul className="space-y-1">
            {parkingGuide.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-amber-800">
                <Info className="size-3 shrink-0 mt-0.5" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 代替駐車場 */}
      {parkingGuide?.alternate && parkingGuide.alternate.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">満車時の代替駐車場:</p>
          <ul className="space-y-1.5 pl-1">
            {parkingGuide.alternate.map((alt, i) => (
              <AlternateParkingItem key={i} alt={alt} />
            ))}
          </ul>
        </div>
      )}

      {/* 推論ベースの場合の注記 */}
      {isInferred && (
        <p className="text-xs text-muted-foreground italic">
          ※ {parkingDetail || "駐車場あり"}。詳細は現地でご確認ください。
        </p>
      )}
    </div>
  );
}

/** 設備バッジ用：駐車場のリッチテキストを生成 */
export function getParkingBadgeText(
  hasParking: boolean,
  parkingDetail?: string,
  parkingGuide?: ParkingGuide,
): string {
  if (!hasParking) return "";
  const parts: string[] = ["駐車場"];
  const fee = parkingGuide?.fee ?? inferFee(parkingDetail);
  const capacity = parkingGuide?.capacity ?? inferCapacity(parkingDetail);
  const details: string[] = [];
  if (fee === "free") details.push("無料");
  else if (fee === "paid") details.push("有料");
  if (capacity) details.push(`${capacity}台`);
  if (details.length > 0) parts.push(`（${details.join("・")}）`);
  return parts.join("");
}

/** JSON-LD amenityFeature用：駐車場descriptionを生成 */
export function getParkingAmenityDescription(
  hasParking: boolean,
  parkingDetail?: string,
  parkingGuide?: ParkingGuide,
): string {
  if (!hasParking) return "駐車場なし";
  const fee = parkingGuide?.fee ?? inferFee(parkingDetail);
  const feeLabel = fee === "free" ? "無料" : fee === "paid" ? "有料" : "条件付き無料";
  const capacity = parkingGuide?.capacity ?? inferCapacity(parkingDetail);
  const parts = [feeLabel];
  if (parkingGuide?.feeDetail) parts.push(parkingGuide.feeDetail);
  if (capacity) parts.push(`約${capacity}台`);
  if (parkingGuide?.parkingName) parts.push(parkingGuide.parkingName);
  return parts.join("、");
}

/** FAQ回答用：駐車場の詳細テキストを生成 */
export function getParkingFaqAnswer(
  spotName: string,
  hasParking: boolean,
  parkingDetail?: string,
  parkingGuide?: ParkingGuide,
): string {
  if (!hasParking) {
    return `${spotName}には専用駐車場はありません。周辺のコインパーキング等をご利用ください。`;
  }
  const fee = parkingGuide?.fee ?? inferFee(parkingDetail);
  const feeLabel = fee === "free" ? "無料" : fee === "paid" ? "有料" : "条件付き無料";
  const capacity = parkingGuide?.capacity ?? inferCapacity(parkingDetail);
  const parts = [`はい、${spotName}には${feeLabel}の駐車場があります。`];
  if (parkingGuide?.feeDetail) parts.push(`料金は${parkingGuide.feeDetail}です。`);
  if (capacity) parts.push(`駐車可能台数は約${capacity}台です。`);
  if (parkingGuide?.walkToSpot) parts.push(`釣り場まで${parkingGuide.walkToSpot}です。`);
  if (parkingGuide?.notes && parkingGuide.notes.length > 0) parts.push(parkingGuide.notes.join("。") + "。");
  if (!parkingGuide && parkingDetail) parts.push(parkingDetail);
  return parts.join("");
}
