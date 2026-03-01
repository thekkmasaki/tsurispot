import { Award } from "lucide-react";
import Link from "next/link";

interface UmigyoBadgeProps {
  isModelDistrict: boolean;
  portName: string;
}

export function UmigyoBadge({ isModelDistrict, portName }: UmigyoBadgeProps) {
  return (
    <Link
      href="/umigyo"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        isModelDistrict
          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
      }`}
    >
      <Award className="size-3.5" />
      {isModelDistrict ? "海業振興モデル地区" : "海業推進地区"}
    </Link>
  );
}
