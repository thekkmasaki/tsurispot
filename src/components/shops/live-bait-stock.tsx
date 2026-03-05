"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BaitStockEntry {
  name: string;
  available: boolean;
  status?: "available" | "low" | "out";
  price?: string;
  updatedAt: string;
}

interface LiveBaitStockProps {
  shopSlug: string;
  fallbackStock: BaitStockEntry[];
}

export function LiveBaitStock({ shopSlug, fallbackStock }: LiveBaitStockProps) {
  const [stock, setStock] = useState<BaitStockEntry[]>(fallbackStock);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetch(`/api/bait-stock?shop=${shopSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stock && data.stock.length > 0) {
          setStock(data.stock);
          setIsLive(true);
        }
      })
      .catch(() => {});
  }, [shopSlug]);

  if (stock.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          エサ在庫状況
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <RefreshCw className="w-3 h-3" />
              リアルタイム
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stock.map((bait) => (
            <div
              key={bait.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                {bait.status === "low" ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                ) : bait.available ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span>{bait.name}</span>
                {bait.status === "low" && (
                  <span className="text-xs text-yellow-600 font-medium">残りわずか</span>
                )}
              </div>
              <div className="text-right text-muted-foreground">
                {bait.price && <span>{bait.price}</span>}
                {bait.updatedAt && (
                  <span className="ml-2 text-xs">
                    ({bait.updatedAt}更新)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
