"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import {
  validateSpotLocation,
  type LocationValidation,
} from "@/lib/validate-spot-location";

const spotTypes = Object.entries(SPOT_TYPE_LABELS) as [string, string][];
const difficulties = Object.entries(DIFFICULTY_LABELS) as [string, string][];

const facilities = [
  { key: "parking", label: "駐車場" },
  { key: "toilet", label: "トイレ" },
  { key: "convenienceStore", label: "コンビニ近く" },
  { key: "fishingShop", label: "釣具店近く" },
  { key: "rentalRod", label: "レンタル竿" },
];

interface FormData {
  spotName: string;
  prefecture: string;
  areaName: string;
  latitude: string;
  longitude: string;
  spotType: string;
  difficulty: string;
  description: string;
  accessInfo: string;
  catchableFish: string;
  facilities: string[];
  isFree: boolean;
  feeDetail: string;
  submitterName: string;
  submitterEmail: string;
  googleMapsUrl: string;
  additionalNotes: string;
}

const initialFormData: FormData = {
  spotName: "",
  prefecture: "",
  areaName: "",
  latitude: "",
  longitude: "",
  spotType: "",
  difficulty: "",
  description: "",
  accessInfo: "",
  catchableFish: "",
  facilities: [],
  isFree: false,
  feeDetail: "",
  submitterName: "",
  submitterEmail: "",
  googleMapsUrl: "",
  additionalNotes: "",
};

// 座標がおおよそ日本国内かチェック
function isValidJapanCoordinates(lat: number, lng: number): boolean {
  return lat >= 24 && lat <= 46 && lng >= 122 && lng <= 154;
}

// Google Maps URLから座標を抽出
function extractCoordsFromGoogleMapsUrl(
  url: string
): { lat: number; lng: number } | null {
  // @lat,lng パターン
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }
  // q=lat,lng パターン
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }
  // place/lat,lng パターン
  const placeMatch = url.match(/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (placeMatch) {
    return { lat: parseFloat(placeMatch[1]), lng: parseFloat(placeMatch[2]) };
  }
  return null;
}

type SubmitStatus = "idle" | "validating" | "submitting" | "success" | "error";
type LocationStatus = "idle" | "checking" | "valid" | "warning" | "invalid";

export default function SpotSubmitPage() {
  const [form, setForm] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationResult, setLocationResult] = useState<LocationValidation | null>(null);

  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const toggleFacility = (key: string) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(key)
        ? prev.facilities.filter((f) => f !== key)
        : [...prev.facilities, key],
    }));
  };

  // 座標検証を実行
  const verifyLocation = useCallback(async (lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) return;

    setLocationStatus("checking");
    setLocationResult(null);

    try {
      const result = await validateSpotLocation(latNum, lngNum);
      setLocationResult(result);

      if (!result.isValid) {
        setLocationStatus("invalid");
      } else if (result.warnings.length > 0 || !result.isNearWater) {
        setLocationStatus("warning");
      } else {
        setLocationStatus("valid");
      }
    } catch {
      setLocationStatus("idle");
    }
  }, []);

  // Google Maps URLから座標を自動取得 + 自動検証
  const handleGoogleMapsUrlChange = (url: string) => {
    updateField("googleMapsUrl", url);
    const coords = extractCoordsFromGoogleMapsUrl(url);
    if (coords) {
      updateField("latitude", coords.lat.toString());
      updateField("longitude", coords.lng.toString());
      // 自動で座標検証を実行
      verifyLocation(coords.lat.toString(), coords.lng.toString());
    }
  };

  const validate = (): string[] => {
    const errs: string[] = [];

    if (!form.spotName.trim()) errs.push("スポット名を入力してください");
    if (!form.prefecture.trim()) errs.push("都道府県を入力してください");
    if (!form.spotType) errs.push("釣り場タイプを選択してください");
    if (!form.submitterEmail.trim())
      errs.push("メールアドレスを入力してください");

    // 座標チェック
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (form.latitude && form.longitude) {
      if (isNaN(lat) || isNaN(lng)) {
        errs.push("座標の形式が正しくありません");
      } else if (!isValidJapanCoordinates(lat, lng)) {
        errs.push("座標が日本国内ではありません。正しい座標を入力してください");
      }
    }

    // メールアドレス形式チェック
    if (form.submitterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitterEmail)) {
      errs.push("メールアドレスの形式が正しくありません");
    }

    // 座標が入力されている場合、検証済みかチェック
    if (form.latitude && form.longitude && locationStatus === "invalid") {
      errs.push("座標の検証に失敗しました。正しい座標を入力してください");
    }

    return errs;
  };

  const buildEmailContent = () => {
    const subject = `[ツリスポ] 新スポット投稿: ${form.spotName}`;
    const bodyLines = [
      `スポット名: ${form.spotName}`,
      `都道府県: ${form.prefecture}`,
      form.areaName ? `エリア: ${form.areaName}` : "",
      form.latitude ? `座標: ${form.latitude}, ${form.longitude}` : "",
      form.googleMapsUrl ? `Google Maps: ${form.googleMapsUrl}` : "",
      `タイプ: ${form.spotType}`,
      form.difficulty ? `難易度: ${form.difficulty}` : "",
      `無料: ${form.isFree ? "はい" : "いいえ"}`,
      form.feeDetail ? `料金: ${form.feeDetail}` : "",
      `設備: ${form.facilities.join(", ") || "なし"}`,
      form.catchableFish ? `釣れる魚: ${form.catchableFish}` : "",
      form.description ? `\n説明:\n${form.description}` : "",
      form.accessInfo ? `\nアクセス:\n${form.accessInfo}` : "",
      form.additionalNotes ? `\n補足:\n${form.additionalNotes}` : "",
      `\n投稿者: ${form.submitterName || "匿名"}`,
      `メール: ${form.submitterEmail}`,
    ]
      .filter(Boolean)
      .join("\n");
    return { subject, body: bodyLines };
  };

  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmailContent = () => {
    const { subject, body } = buildEmailContent();
    navigator.clipboard.writeText(`件名: ${subject}\n\n${body}`);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("validating");

    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setStatus("idle");
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    const { subject, body } = buildEmailContent();
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=fishingspotjapan@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const mailtoUrl = `mailto:fishingspotjapan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return (
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Send className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">あと1ステップで完了です！</h1>
          <p className="mt-3 text-muted-foreground">
            以下のボタンからメールを送信してください。
            <br />
            スタッフが内容を確認し、問題なければサイトに掲載します。
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <a
            href={gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full min-h-[52px] items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-red-700"
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
            Gmailで送信する
          </a>
          <a
            href={mailtoUrl}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Send className="size-4" />
            その他のメールアプリで送信する
          </a>
        </div>

        <div className="mt-6 rounded-xl border border-dashed p-4">
          <p className="mb-3 text-center text-sm text-muted-foreground">
            メールが送信できない場合は、以下の内容をコピーして
            <br />
            <code className="rounded bg-muted px-2 py-0.5 text-xs font-medium">fishingspotjapan@gmail.com</code>
            に直接お送りください
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyEmailContent}
            className="mx-auto flex min-h-[36px] gap-1.5"
          >
            {emailCopied ? (
              <>
                <CheckCircle2 className="size-4 text-green-600" />
                コピーしました！
              </>
            ) : (
              <>
                <MapPin className="size-4" />
                投稿内容をコピーする
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/spots">スポット一覧に戻る</Link>
          </Button>
          <Button
            onClick={() => {
              setForm(initialFormData);
              setStatus("idle");
              setEmailCopied(false);
            }}
          >
            別のスポットを投稿する
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* パンくず */}
      <div className="mb-6">
        <Link
          href="/spots"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
        >
          <ChevronLeft className="mr-1 size-4" />
          スポット一覧に戻る
        </Link>
      </div>

      {/* ヘッダー */}
      <div className="mb-8 text-center sm:mb-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
          釣りスポットを投稿する
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
          あなたのお気に入りの釣り場を教えてください。
          <br />
          スタッフが内容を確認後、サイトに掲載します。
        </p>
      </div>

      {/* 注意事項 */}
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">投稿時の注意事項</p>
            <ul className="mt-1 space-y-0.5 text-xs">
              <li>・正確な情報をご提供ください。虚偽の情報は掲載されません。</li>
              <li>・私有地や立入禁止区域は投稿できません。</li>
              <li>
                ・漁業権が設定されている場所は、その旨を記載してください。
              </li>
              <li>
                ・投稿内容はスタッフが確認後、必要に応じて編集の上掲載します。
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
            以下の項目を修正してください：
          </p>
          <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
            {errors.map((err, i) => (
              <li key={i}>・{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <h2 className="text-base font-bold">基本情報</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                スポット名 <span className="text-xs text-red-500">*必須</span>
              </label>
              <Input
                placeholder="例：大磯港"
                value={form.spotName}
                onChange={(e) => updateField("spotName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  都道府県{" "}
                  <span className="text-xs text-red-500">*必須</span>
                </label>
                <Input
                  placeholder="例：神奈川県"
                  value={form.prefecture}
                  onChange={(e) => updateField("prefecture", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  エリア名
                </label>
                <Input
                  placeholder="例：湘南"
                  value={form.areaName}
                  onChange={(e) => updateField("areaName", e.target.value)}
                />
              </div>
            </div>

            {/* 釣り場タイプ */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                釣り場タイプ{" "}
                <span className="text-xs text-red-500">*必須</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {spotTypes.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField("spotType", key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                      form.spotType === key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 難易度 */}
            <div>
              <label className="mb-2 block text-sm font-medium">難易度</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField("difficulty", key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                      form.difficulty === key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 場所 */}
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <h2 className="text-base font-bold">場所</h2>
            <p className="text-xs text-muted-foreground">
              Google MapsのURLを貼り付けると、座標が自動で入力されます。
            </p>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Google Maps URL
              </label>
              <Input
                placeholder="https://maps.google.com/..."
                value={form.googleMapsUrl}
                onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Google Mapsで釣り場を開き、URLをコピーして貼り付けてください
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  緯度
                </label>
                <Input
                  placeholder="例：35.3052"
                  value={form.latitude}
                  onChange={(e) => updateField("latitude", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  経度
                </label>
                <Input
                  placeholder="例：139.3123"
                  value={form.longitude}
                  onChange={(e) => updateField("longitude", e.target.value)}
                />
              </div>
            </div>

            {form.latitude && form.longitude && (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-lg border">
                  <iframe
                    src={`https://maps.google.com/maps?q=${form.latitude},${form.longitude}&z=15&output=embed&t=k`}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="位置確認"
                  />
                </div>

                {/* 座標検証ボタン */}
                {locationStatus === "idle" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => verifyLocation(form.latitude, form.longitude)}
                    className="min-h-[36px] gap-1.5"
                  >
                    <ShieldCheck className="size-4" />
                    この場所を検証する
                  </Button>
                )}

                {/* 検証中 */}
                {locationStatus === "checking" && (
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    場所を検証中...
                  </div>
                )}

                {/* 検証結果: 有効 */}
                {locationStatus === "valid" && locationResult && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          釣りスポットとして適切な場所です
                        </p>
                        <p className="mt-0.5 text-xs text-green-700 dark:text-green-300">
                          {locationResult.placeName && `場所: ${locationResult.placeName}`}
                        </p>
                        {locationResult.isNearWater && (
                          <p className="text-xs text-green-600">水辺の近くであることを確認しました</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 検証結果: 警告 */}
                {locationStatus === "warning" && locationResult && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          確認が必要です
                        </p>
                        {locationResult.warnings.map((w, i) => (
                          <p key={i} className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                            {w}
                          </p>
                        ))}
                        <p className="mt-1 text-[10px] text-amber-600">
                          座標が正しければ、そのまま投稿できます。スタッフが確認します。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 検証結果: 無効 */}
                {locationStatus === "invalid" && locationResult && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                    <div className="flex items-start gap-2">
                      <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          この場所は登録できません
                        </p>
                        {locationResult.warnings.map((w, i) => (
                          <p key={i} className="mt-0.5 text-xs text-red-700 dark:text-red-300">
                            {w}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                アクセス方法
              </label>
              <textarea
                placeholder="例：JR大磯駅から徒歩15分。駐車場あり（有料500円/日）"
                value={form.accessInfo}
                onChange={(e) => updateField("accessInfo", e.target.value)}
                rows={2}
                className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* 釣り情報 */}
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <h2 className="text-base font-bold">釣り情報</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                釣れる魚
              </label>
              <Input
                placeholder="例：アジ、サバ、イワシ、クロダイ"
                value={form.catchableFish}
                onChange={(e) => updateField("catchableFish", e.target.value)}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                カンマ区切りで複数入力できます
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                スポットの説明
              </label>
              <textarea
                placeholder="例：堤防の先端がポイント。足場がよく、ファミリーでも安心して楽しめます。"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] placeholder:text-muted-foreground"
              />
            </div>

            {/* 料金 */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateField("isFree", !form.isFree)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                  form.isFree
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-border hover:border-orange-300"
                }`}
              >
                無料
              </button>
              {!form.isFree && (
                <Input
                  placeholder="料金詳細（例：大人1,000円/日）"
                  value={form.feeDetail}
                  onChange={(e) => updateField("feeDetail", e.target.value)}
                  className="flex-1"
                />
              )}
            </div>

            {/* 設備 */}
            <div>
              <label className="mb-2 block text-sm font-medium">設備</label>
              <div className="flex flex-wrap gap-2">
                {facilities.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => toggleFacility(f.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${
                      form.facilities.includes(f.key)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 投稿者情報 */}
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <h2 className="text-base font-bold">投稿者情報</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                お名前（ニックネーム可）
              </label>
              <Input
                placeholder="つりたろう"
                value={form.submitterName}
                onChange={(e) => updateField("submitterName", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                メールアドレス{" "}
                <span className="text-xs text-red-500">*必須</span>
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={form.submitterEmail}
                onChange={(e) => updateField("submitterEmail", e.target.value)}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                掲載完了時にお知らせします。第三者には公開されません。
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                補足・備考
              </label>
              <textarea
                placeholder="その他お伝えしたいことがあればご記入ください"
                value={form.additionalNotes}
                onChange={(e) => updateField("additionalNotes", e.target.value)}
                rows={3}
                className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting" || status === "validating"}
          className="w-full min-h-[52px] gap-2 text-base"
        >
          {status === "submitting" || status === "validating" ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Send className="size-5" />
              スポットを投稿する
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          投稿内容はスタッフが確認後、1〜3営業日以内に掲載されます。
          <br />
          <Link href="/terms" className="underline hover:text-foreground">
            利用規約
          </Link>
          に同意の上、投稿してください。
        </p>
      </form>
    </main>
  );
}
