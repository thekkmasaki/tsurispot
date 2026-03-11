"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, X, Camera, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopInfoData {
  businessHours: string;
  closedDays: string;
  phone: string;
  website: string;
  ownerMessage: string;
  services: string[];
}

const PRESET_SERVICES = [
  "活きエサ販売",
  "冷凍エサ販売",
  "レンタルロッド",
  "仕掛け販売",
  "氷販売",
  "釣果情報提供",
  "初心者アドバイス",
  "釣り場案内",
  "駐車場完備",
  "トイレあり",
  "配送対応",
  "修理・メンテナンス",
];

export function ShopInfoForm({ shopName }: { shopName?: string }) {
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");
  const token = searchParams.get("token");

  const [info, setInfo] = useState<ShopInfoData>({
    businessHours: "",
    closedDays: "",
    phone: "",
    website: "",
    ownerMessage: "",
    services: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newService, setNewService] = useState("");

  // 写真アップロード関連
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shop) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/shop-info?shop=${shop}`).then((r) => r.json()),
      fetch(`/api/shop-photos?shop=${shop}`).then((r) => r.json()),
    ])
      .then(([infoData, photoData]) => {
        if (infoData.info) {
          setInfo({
            businessHours: infoData.info.businessHours || "",
            closedDays: infoData.info.closedDays || "",
            phone: infoData.info.phone || "",
            website: infoData.info.website || "",
            ownerMessage: infoData.info.ownerMessage || "",
            services: infoData.info.services || [],
          });
        }
        if (photoData.photos) {
          setPhotos(photoData.photos);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [shop]);

  const updateField = useCallback((field: keyof ShopInfoData, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const addService = useCallback((name: string) => {
    setInfo((prev) => {
      if (prev.services.includes(name)) return prev;
      return { ...prev, services: [...prev.services, name] };
    });
    setSaved(false);
  }, []);

  const removeService = useCallback((name: string) => {
    setInfo((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== name),
    }));
    setSaved(false);
  }, []);

  const addCustomService = useCallback(() => {
    if (!newService.trim()) return;
    addService(newService.trim());
    setNewService("");
  }, [newService, addService]);

  const handlePhotoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !shop || !token) return;

      setUploading(true);
      setPhotoError("");

      const formData = new FormData();
      formData.append("shop", shop);
      formData.append("token", token);
      formData.append("file", file);

      try {
        const res = await fetch("/api/shop-photos", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.photos) {
          setPhotos(data.photos);
        } else {
          setPhotoError(data.error || "アップロードに失敗しました");
        }
      } catch {
        setPhotoError("通信エラーが発生しました");
      }
      setUploading(false);
      // input をリセット
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [shop, token]
  );

  const handlePhotoDelete = useCallback(
    async (url: string) => {
      if (!shop || !token) return;
      setPhotoError("");

      try {
        const res = await fetch("/api/shop-photos", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shop, token, url }),
        });
        const data = await res.json();
        if (res.ok && data.photos) {
          setPhotos(data.photos);
        } else {
          setPhotoError(data.error || "削除に失敗しました");
        }
      } catch {
        setPhotoError("通信エラーが発生しました");
      }
    },
    [shop, token]
  );

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/shop-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop, token, info }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const data = await res.json();
        setError(data.error || "更新に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました。電波の良い場所で再度お試しください。");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  const unusedPresets = PRESET_SERVICES.filter(
    (name) => !info.services.includes(name)
  );

  return (
    <div className="space-y-6">
      {/* 営業時間 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">営業時間</label>
        <input
          type="text"
          value={info.businessHours}
          onChange={(e) => updateField("businessHours", e.target.value)}
          placeholder="例: 5:00〜18:00"
          className="w-full text-sm border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800"
        />
      </div>

      {/* 定休日 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">定休日</label>
        <input
          type="text"
          value={info.closedDays}
          onChange={(e) => updateField("closedDays", e.target.value)}
          placeholder="例: 火曜日（祝日の場合は営業）"
          className="w-full text-sm border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800"
        />
      </div>

      {/* 電話番号 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">電話番号</label>
        <input
          type="tel"
          value={info.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="例: 078-123-4567"
          className="w-full text-sm border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800"
        />
      </div>

      {/* ウェブサイト */}
      <div className="space-y-2">
        <label className="text-sm font-medium">ウェブサイト</label>
        <input
          type="url"
          value={info.website}
          onChange={(e) => updateField("website", e.target.value)}
          placeholder="例: https://example.com"
          className="w-full text-sm border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800"
        />
      </div>

      {/* サービス（タグ入力） */}
      <div className="space-y-2">
        <label className="text-sm font-medium">サービス</label>

        {/* 選択済みサービス */}
        {info.services.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {info.services.map((service) => (
              <span
                key={service}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border bg-primary/5 border-primary/20"
              >
                {service}
                <button
                  type="button"
                  onClick={() => removeService(service)}
                  className="p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                  aria-label={`${service}を削除`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* プリセットから追加 */}
        {unusedPresets.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">タップで追加</p>
            <div className="flex flex-wrap gap-2">
              {unusedPresets.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addService(name)}
                  className="px-3 py-1.5 text-sm rounded-full border bg-white hover:bg-primary/5 hover:border-primary/30 transition-colors dark:bg-gray-800"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* カスタムサービス入力 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="その他のサービスを入力"
            className="flex-1 text-sm border rounded-lg px-3 py-2"
            onKeyDown={(e) => e.key === "Enter" && addCustomService()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addCustomService}
            disabled={!newService.trim()}
            className="px-4"
          >
            追加
          </Button>
        </div>
      </div>

      {/* 店舗写真（ベーシック以上） */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Camera className="w-4 h-4" />
          店舗写真
          <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded dark:bg-blue-950/30">ベーシック以上</span>
        </label>

        {/* アップロード済み写真 */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((url) => (
              <div key={url} className="space-y-1.5">
                <div className="aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={url}
                    alt="店舗写真"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handlePhotoDelete(url)}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  削除
                </button>
              </div>
            ))}
          </div>
        )}

        {/* アップロードボタン */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              写真を追加
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG・PNG・WebP、1枚5MBまで。ベーシック3枚、プロ20枚まで。
        </p>
        {photoError && (
          <p className="text-xs text-red-600">{photoError}</p>
        )}
      </div>

      {/* 店主からのメッセージ（プロのみ案内） */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          店主からのメッセージ
          <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded dark:bg-amber-950/30">プロプラン</span>
        </label>
        <textarea
          value={info.ownerMessage}
          onChange={(e) => updateField("ownerMessage", e.target.value)}
          placeholder="お客様へのメッセージを入力してください（プロプランの店舗ページに表示されます）"
          rows={3}
          className="w-full text-sm border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 resize-none"
        />
      </div>

      {/* 保存ボタン */}
      <div className="sticky bottom-4 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving || saved}
          size="lg"
          className={`w-full text-base font-bold py-6 rounded-xl shadow-lg transition-all ${
            saved ? "bg-green-500 hover:bg-green-600" : ""
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              保存中...
            </>
          ) : saved ? (
            "✓ 保存しました！"
          ) : (
            "店舗情報を保存する"
          )}
        </Button>
      </div>

      {/* 保存後リンク */}
      {saved && shop && (
        <a
          href={`/shops/${shop}`}
          className="block text-center rounded-xl border-2 border-green-300 bg-green-50 p-4 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
        >
          店舗ページで反映を確認する →
        </a>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
