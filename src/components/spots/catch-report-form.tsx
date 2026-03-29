"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, CheckCircle, AlertCircle, Camera, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getTitle, getNextTier } from "@/lib/titles";

// そのスポットで釣れる魚名 + 汎用的な人気魚種
const COMMON_FISH = ["アジ", "サバ", "イワシ", "メバル", "カサゴ", "シーバス", "クロダイ", "アオリイカ"];

const METHODS = ["サビキ", "投げ", "ルアー", "フカセ", "エギング", "ジギング", "穴釣り", "ウキ釣り", "その他"];
const WEATHER_OPTIONS = [
  { value: "晴れ", label: "晴れ", icon: "☀️" },
  { value: "曇り", label: "曇り", icon: "☁️" },
  { value: "雨", label: "雨", icon: "🌧️" },
  { value: "風強い", label: "風強い", icon: "💨" },
];

/** クライアント側で画像をリサイズ・JPEG圧縮してからアップロード */
function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = URL.createObjectURL(file);
  });
}

interface CatchReportFormProps {
  spotSlug: string;
  spotName: string;
  catchableFishNames?: string[];
}

export function CatchReportForm({ spotSlug, spotName, catchableFishNames = [] }: CatchReportFormProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.tsuriId;
  const fishInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");

  // 認証時はニックネームを自動セット
  useEffect(() => {
    if (session?.user?.nickname && !userName) {
      setUserName(session.user.nickname);
    }
  }, [session?.user?.nickname]); // eslint-disable-line react-hooks/exhaustive-deps
  const [fishName, setFishName] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [comment, setComment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [sizeCm, setSizeCm] = useState("");
  const [method, setMethod] = useState("");
  const [weather, setWeather] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [rankUpInfo, setRankUpInfo] = useState<{
    isRankUp: boolean;
    newTitle?: { label: string; emoji: string; className: string };
    nextTier?: { label: string; emoji: string; remaining: number } | null;
  } | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setErrorMessage("");
    setStatus("idle");

    try {
      // クライアント側で自動圧縮（iPhone写真10MB超対策）
      const compressed = await compressImage(file);

      // プレビュー表示
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(compressed);

      // アップロード
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch("/api/catch-photo", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPhotoUrl(data.url);
      } else {
        setErrorMessage(data.error || "写真のアップロードに失敗しました");
        setStatus("error");
        setPhotoPreview("");
      }
    } catch {
      setErrorMessage("写真のアップロードに失敗しました");
      setStatus("error");
      setPhotoPreview("");
    } finally {
      setPhotoUploading(false);
    }
  };

  const removePhoto = () => {
    setPhotoUrl("");
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // クライアント側バリデーション
    if (!userName.trim()) {
      setErrorMessage("ニックネームを入力してください");
      setStatus("error");
      return;
    }
    if (!fishName.trim()) {
      setErrorMessage("釣った魚を入力してください");
      setStatus("error");
      return;
    }
    if (!comment.trim()) {
      setErrorMessage("ひとことを入力してください");
      setStatus("error");
      return;
    }
    if (comment.length > 100) {
      setErrorMessage("ひとことは100文字以内で入力してください");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const body: Record<string, unknown> = {
        spotSlug,
        spotName,
        fishName: fishName.trim(),
        userName: userName.trim(),
        comment: comment.trim(),
        date,
      };
      if (photoUrl) body.photoUrl = photoUrl;
      if (sizeCm) body.sizeCm = Number(sizeCm);
      if (method) body.method = method;
      if (weather) body.weather = weather;

      const res = await fetch("/api/catch-report-ugc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        // ランクアップ判定
        if (data.newReportCount != null) {
          const prevTitle = getTitle(data.newReportCount - 1);
          const newTitle = getTitle(data.newReportCount);
          const ranked = prevTitle.label !== newTitle.label;
          setRankUpInfo({
            isRankUp: ranked,
            newTitle: ranked ? newTitle : undefined,
            nextTier: getNextTier(data.newReportCount),
          });
        } else {
          setRankUpInfo(null);
        }
        setStatus("success");
        // フォームリセット
        setUserName("");
        setFishName("");
        setComment("");
        setPhotoUrl("");
        setPhotoPreview("");
        setSizeCm("");
        setMethod("");
        setWeather("");
      } else {
        setErrorMessage(data.error || "送信に失敗しました");
        setStatus("error");
      }
    } catch {
      setErrorMessage("ネットワークエラーが発生しました。もう一度お試しください。");
      setStatus("error");
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="mt-3 gap-2"
      >
        <Send className="size-4" />
        釣果を報告する
      </Button>
    );
  }

  if (status === "success") {
    // ランクアップ演出
    if (rankUpInfo?.isRankUp && rankUpInfo.newTitle) {
      const { newTitle } = rankUpInfo;
      return (
        <Card className="relative mt-3 overflow-hidden border-amber-300 bg-gradient-to-b from-amber-50 to-white py-4">
          <style>{`
            @keyframes rankup-badge {
              0% { transform: scale(0) rotate(-10deg); opacity: 0; }
              60% { transform: scale(1.2) rotate(3deg); opacity: 1; }
              80% { transform: scale(0.95) rotate(-1deg); }
              100% { transform: scale(1) rotate(0deg); }
            }
            @keyframes rankup-glow {
              0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
              50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.2); }
            }
            @keyframes confetti-fall {
              0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
            }
            .rankup-badge { animation: rankup-badge 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            .rankup-glow { animation: rankup-glow 2s ease-in-out infinite; }
            .confetti { position: absolute; width: 8px; height: 8px; border-radius: 2px; animation: confetti-fall 1.5s ease-in forwards; }
          `}</style>
          {/* 紙吹雪 */}
          <div aria-hidden="true">
            <div className="confetti" style={{ left: "10%", top: 0, background: "#f59e0b", animationDelay: "0s" }} />
            <div className="confetti" style={{ left: "25%", top: 0, background: "#ec4899", animationDelay: "0.2s" }} />
            <div className="confetti" style={{ left: "45%", top: 0, background: "#8b5cf6", animationDelay: "0.4s" }} />
            <div className="confetti" style={{ left: "65%", top: 0, background: "#10b981", animationDelay: "0.1s" }} />
            <div className="confetti" style={{ left: "80%", top: 0, background: "#3b82f6", animationDelay: "0.3s" }} />
            <div className="confetti" style={{ left: "90%", top: 0, background: "#f43f5e", animationDelay: "0.5s" }} />
          </div>
          <CardContent className="relative z-10 px-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5 text-amber-600">
                <Trophy className="size-5" />
                <p className="text-sm font-bold tracking-wide">ランクアップ！</p>
              </div>
              <div className="rankup-badge rankup-glow mt-3 rounded-full px-5 py-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-base ${newTitle.className}`}>
                  {newTitle.emoji} {newTitle.label}
                </span>
              </div>
              <p className="mt-3 text-sm text-amber-800">
                おめでとうございます！称号が上がりました！
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ページを再読み込みすると釣果が表示されます。
              </p>
              <Button
                onClick={() => {
                  setStatus("idle");
                  setIsOpen(false);
                  setRankUpInfo(null);
                }}
                variant="ghost"
                size="sm"
                className="mt-3 text-amber-700 hover:text-amber-800"
              >
                閉じる
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // 通常の成功画面（ランクアップなし）
    return (
      <Card className="mt-3 border-emerald-200 bg-emerald-50/50 py-4">
        <CardContent className="px-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">
                投稿ありがとうございます！
              </p>
              {rankUpInfo?.nextTier ? (
                <p className="mt-1 text-sm text-emerald-700">
                  次の「{rankUpInfo.nextTier.emoji} {rankUpInfo.nextTier.label}」まであと{rankUpInfo.nextTier.remaining}件！
                </p>
              ) : rankUpInfo && !rankUpInfo.nextTier ? (
                <p className="mt-1 text-sm text-emerald-700">
                  最高ランクに到達しています！
                </p>
              ) : (
                <p className="mt-1 text-sm text-emerald-700">
                  ページを再読み込みすると表示されます。
                </p>
              )}
              <Button
                onClick={() => {
                  setStatus("idle");
                  setIsOpen(false);
                  setRankUpInfo(null);
                }}
                variant="ghost"
                size="sm"
                className="mt-2 text-emerald-700 hover:text-emerald-800"
              >
                閉じる
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-3 py-4">
      <CardContent className="px-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="cr-username" className="mb-1 block text-sm font-medium">
              ニックネーム <span className="text-destructive">*</span>
            </label>
            <Input
              id="cr-username"
              type="text"
              placeholder="例: 釣りキチ太郎"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={20}
              required
              readOnly={isLoggedIn}
              className={isLoggedIn ? "bg-muted" : ""}
            />
          </div>

          <div>
            <label htmlFor="cr-fishname" className="mb-1 block text-sm font-medium">
              釣った魚 <span className="text-destructive">*</span>
            </label>
            {(() => {
              // スポットの魚を優先、足りなければ汎用魚種で補完（重複排除）
              const seen = new Set<string>();
              const buttons: string[] = [];
              for (const name of [...catchableFishNames, ...COMMON_FISH]) {
                if (!seen.has(name) && buttons.length < 8) {
                  seen.add(name);
                  buttons.push(name);
                }
              }
              // 現在選択中の魚名を配列で管理
              const isBouzu = fishName === "ボウズ";
              const selected = fishName ? fishName.split("、").map(s => s.trim()).filter(Boolean) : [];
              const selectedSet = new Set(selected);
              const toggle = (name: string) => {
                if (name === "ボウズ") {
                  setFishName(isBouzu ? "" : "ボウズ");
                  return;
                }
                // ボウズ選択中に魚を選んだらボウズ解除
                const base = selected.filter(s => s !== "ボウズ" && s !== name);
                if (selectedSet.has(name)) {
                  setFishName(base.join("、"));
                } else {
                  setFishName([...base, name].join("、"));
                }
              };
              return buttons.length > 0 ? (
                <div className="mb-1.5 flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => toggle("ボウズ")}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                      isBouzu
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-muted-foreground/20 text-muted-foreground hover:border-amber-300 hover:bg-amber-50/50"
                    }`}
                  >
                    ボウズ
                  </button>
                  {buttons.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggle(name)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        selectedSet.has(name) && !isBouzu
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-muted-foreground/20 text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setTimeout(() => fishInputRef.current?.focus(), 0);
                    }}
                    className="rounded-full border border-muted-foreground/20 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
                  >
                    その他
                  </button>
                </div>
              ) : null;
            })()}
            <Input
              ref={fishInputRef}
              id="cr-fishname"
              type="text"
              placeholder="例: アジ、サバ"
              value={fishName}
              onChange={(e) => setFishName(e.target.value)}
              maxLength={30}
              required
            />
          </div>

          <div>
            <label htmlFor="cr-date" className="mb-1 block text-sm font-medium">
              釣った日 <span className="text-destructive">*</span>
            </label>
            <Input
              id="cr-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* 写真アップロード */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              写真（任意）
            </label>
            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="プレビュー"
                  className="h-24 w-24 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-white shadow-sm"
                >
                  <X className="size-3.5" />
                </button>
                {photoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                    <span className="text-xs text-white">アップロード中...</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50/30"
              >
                <Camera className="size-6" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* サイズ入力（ボウズ時は非表示） */}
          {fishName !== "ボウズ" && (
            <div>
              <label htmlFor="cr-size" className="mb-1 block text-sm font-medium">
                サイズ（任意）
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="cr-size"
                  type="number"
                  placeholder="例: 25"
                  value={sizeCm}
                  onChange={(e) => setSizeCm(e.target.value)}
                  min={1}
                  max={300}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </div>
          )}

          {/* 釣法セレクト */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              釣法（任意）
            </label>
            <div className="flex flex-wrap gap-1">
              {METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(method === m ? "" : m)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    method === m
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-muted-foreground/20 text-muted-foreground hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 天候セレクト */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              天候（任意）
            </label>
            <div className="flex flex-wrap gap-1">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => setWeather(weather === w.value ? "" : w.value)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    weather === w.value
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-muted-foreground/20 text-muted-foreground hover:border-amber-300 hover:bg-amber-50/50"
                  }`}
                >
                  {w.icon} {w.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="cr-comment" className="mb-1 block text-sm font-medium">
              ひとこと <span className="text-destructive">*</span>
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {comment.length}/100
              </span>
            </label>
            <textarea
              id="cr-comment"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="例: 朝マヅメにサビキで20匹釣れました！"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {status === "error" && errorMessage && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              disabled={status === "submitting" || photoUploading}
              className="gap-2"
            >
              <Send className="size-4" />
              {status === "submitting" ? "送信中..." : "釣果を投稿する"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setStatus("idle");
                setErrorMessage("");
              }}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
