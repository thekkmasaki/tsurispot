"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Globe,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ShopInfoLiveProps {
  shopSlug: string;
  address: string;
  phone: string;
  businessHours: string;
  closedDays: string;
  website?: string;
  parkingDetail?: string;
  hasParking?: boolean;
  services: string[];
  isPro: boolean;
  ownerMessage?: string;
}

interface ShopInfoOverride {
  businessHours?: string;
  closedDays?: string;
  phone?: string;
  website?: string;
  ownerMessage?: string;
  services?: string[];
  updatedAt?: string;
}

export function ShopInfoLive({
  shopSlug,
  address,
  phone: staticPhone,
  businessHours: staticHours,
  closedDays: staticClosedDays,
  website: staticWebsite,
  parkingDetail,
  hasParking,
  services: staticServices,
  isPro,
  ownerMessage: staticOwnerMessage,
}: ShopInfoLiveProps) {
  const [override, setOverride] = useState<ShopInfoOverride | null>(null);

  useEffect(() => {
    fetch(`/api/shop-info?shop=${shopSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.info) {
          setOverride(data.info);
        }
      })
      .catch(() => {});
  }, [shopSlug]);

  // Redisデータがあればそちらを優先、なければ静的データ
  const phone = override?.phone || staticPhone;
  const businessHours = override?.businessHours || staticHours;
  const closedDays = override?.closedDays || staticClosedDays;
  const website = override?.website || staticWebsite;
  const services = override?.services && override.services.length > 0
    ? override.services
    : staticServices;
  const ownerMessage = override?.ownerMessage || staticOwnerMessage;

  return (
    <>
      {/* 店主からのメッセージ（プロ限定） */}
      {isPro && ownerMessage && (
        <Card className="mb-6 border-amber-200 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg">💬</span>
              店主からのメッセージ
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">プロ限定</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{ownerMessage}</p>
            {override?.updatedAt && (
              <p className="text-[11px] text-muted-foreground mt-2">最終更新: {override.updatedAt}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 基本情報カード */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            基本情報
            {override?.updatedAt && (
              <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                (オーナー更新: {override.updatedAt})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">{address}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="text-sm">
              <div>営業時間: {businessHours}</div>
              <div className="text-muted-foreground">
                定休日: {closedDays}
              </div>
            </div>
          </div>
          {website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                公式サイト
              </a>
            </div>
          )}
          {parkingDetail && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-muted-foreground flex-shrink-0 text-xs">P</span>
              <span className="text-sm">{parkingDetail}</span>
            </div>
          )}
          {hasParking && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">駐車場あり</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* サービスカード（オーナーがRedisにservicesを保存済みの場合のみ） */}
      {override?.services && override.services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">サービス</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {service}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
