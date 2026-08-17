"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, CheckCircle, AlertCircle, Camera, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getTitle, getNextTier } from "@/lib/titles";
import { compressImage } from "@/lib/image-compress";
import { generateAnonNickname, loadAnonNickname, saveAnonNickname } from "@/lib/anon-nickname";
import { trackPostSubmit } from "@/lib/analytics";
import { addCaughtFish } from "@/hooks/use-fishdex";
import { recordAction } from "@/hooks/use-activity";
import { CatchReportResult } from "@/components/spots/catch-report-result";
import type { PostCatchResult } from "@/lib/catch-result";

// そのスポットで釣れる魚名 + 汎用的な人気魚種
const COMMON_FISH = ["アジ", "サバ", "イワシ", "メバル", "カサゴ", "シーバス", "クロダイ", "アオリイカ"];

// ひとこと定型チップ。NGワード判定が substring 一致のため、
// 「クソデカい」等のスラングに誤反応しない語彙のみを採用する
const COMMENT_CHIPS = ["入れ食いだった！", "ぽつぽつ釣れた", "渋かった…", "ボウズ回避！", "サイズは小さめ", "群れが回ってきた"];

const METHODS = ["サビキ", "投げ", "ルアー", "フカセ", "エギング", "ジギング", "穴釣り", "ウキ釣り", "その他"];
const WEATHER_OPTIONS = [
  { value: "晴れ", label: "晴れ", icon: "☀️" },
  { value: "曇り", label: "曇り", icon: "☁️" },
  { value: "雨", label: "雨", icon: "🌧️" },
  { value: "風強い", label: "風強い", icon: "💨" },
];

interface CatchReportFormProps {
  spotSlug: string;
  spotName: string;
  catchableFishNames?: string[];
}

// 端末ローカルの「今日」を YYYY-MM-DD で返す。
// toISOString() はUTC日付になるため、JSTの0時〜9時に max がローカルの今日より
// 過去になり、ネイティブ検証で送信不能になる（初期値とmaxは必ず同じ基準で生成する）
function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CatchReportForm({ spotSlug, spotName, catchableFishNames = [] }: CatchReportFormProps) {
  const { data: session, status: authStatus, update } = useSession();
  const router = useRouter();
  const fishInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileNickname, setProfileNickname] = useState<string>("");

  // ログインユーザーのニックネームを auto-fill
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const nickname = session?.user?.nickname || "";
    if (!nickname) return;
    setProfileNickname(nickname);
    setUserName((prev) => (prev ? prev : nickname));
  }, [authStatus, session?.user?.nickname]);

  // 匿名ユーザーには「釣り人{4桁}」を自動候補として prefill（1回だけ。
  // ユーザーが空欄に消した後に勝手に再充填しないよう ref で制御）
  const anonPrefilled = useRef(false);
  useEffect(() => {
    if (authStatus !== "unauthenticated" || anonPrefilled.current) return;
    anonPrefilled.current = true;
    const name = loadAnonNickname() || generateAnonNickname();
    saveAnonNickname(name);
    setUserName((prev) => (prev ? prev : name));
  }, [authStatus]);

  const rerollNickname = () => {
    const name = generateAnonNickname();
    setUserName(name);
    saveAnonNickname(name);
  };

  const [fishName, setFishName] = useState("");
  const [date, setDate] = useState(() => formatLocalDate(new Date()));
  const [comment, setComment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [sizeCm, setSizeCm] = useState("");
  const [method, setMethod] = useState("");
  const [weather, setWeather] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  // 投稿リザルト画面の材料（フォームリセット前に確保する）
  const [resultData, setResultData] = useState<{
    postId?: string;
    result?: PostCatchResult;
    fishName: string;
    date: string;
    anonSaved: boolean;
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
        date,
      };
      const commentText = comment.trim();
      if (commentText) body.comment = commentText;
      if (photoUrl) body.photoUrl = photoUrl;
      if (sizeCm) body.sizeCm = Number(sizeCm);
      if (method) body.method = method;
      if (weather) body.weather = weather;
      const tags = tagsInput
        .split(/[,、\s]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5);
      if (tags.length > 0) body.tags = tags;

      const res = await fetch("/api/catch-report-ugc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        // 手入力した匿名ニックネームも次回のために保存する
        if (!session?.user) saveAnonNickname(userName.trim());
        trackPostSubmit({
          spotSlug,
          loggedIn: !!session?.user,
          hasComment: !!commentText,
          hasPhoto: !!photoUrl,
        });

        let anonSaved = false;
        if (session?.user) {
          // フォーム上部の称号カウンタはJWTキャッシュ依存で投稿しても動かなかったバグの修正:
          // update() でトークンを再発行し reportCount を即フレッシュ化する（auth.ts の update トリガー）
          update().catch(() => {});
        } else {
          // 匿名は端末図鑑に実保存（ログイン時に union merge で引き継がれる）+ 活動記録
          const slugs = Array.isArray(data.fishSlugs)
            ? (data.fishSlugs as unknown[]).filter((s): s is string => typeof s === "string")
            : [];
          anonSaved = addCaughtFish(slugs).length > 0;
          recordAction();
        }
        setResultData({
          postId: typeof data.id === "string" ? data.id : undefined,
          result: data.result as PostCatchResult | undefined,
          fishName: fishName.trim(),
          date,
          anonSaved,
        });
        setStatus("success");
        // フォームリセット (ニックネームは保持)
        setUserName(profileNickname || userName.trim());
        setFishName("");
        setComment("");
        setPhotoUrl("");
        setPhotoPreview("");
        setSizeCm("");
        setMethod("");
        setWeather("");
        setTagsInput("");
        // 自動公開UGCを一覧へ即反映（CatchReportList を initialReports 直結に変更済み）。
        router.refresh();
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
      <div className="mt-3 flex flex-col items-start gap-1.5">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="gap-2"
        >
          <Send className="size-4" />
          {session?.user ? "釣果を報告する" : "釣果を報告する (ログイン不要)"}
        </Button>
        {!session?.user && (
          <p className="text-xs text-muted-foreground">
            <Link prefetch={false} href="/login" className="underline hover:text-foreground">
              ログイン
            </Link>
            するとマイページに記録され、 連続釣行ストリーク等の機能も使えます
          </p>
        )}
      </div>
    );
  }

  if (status === "success" && resultData) {
    return (
      <CatchReportResult
        spotSlug={spotSlug}
        spotName={spotName}
        fishName={resultData.fishName}
        date={resultData.date}
        postId={resultData.postId}
        result={resultData.result}
        anonSaved={resultData.anonSaved}
        isLoggedIn={!!session?.user}
        onClose={() => {
          setStatus("idle");
          setIsOpen(false);
          setResultData(null);
        }}
        onPostAnother={() => {
          setStatus("idle");
          setResultData(null);
        }}
      />
    );
  }

  // 縮退フォールバック（リザルト材料が取れなかったときの従来表示）
  if (status === "success") {
    return (
      <Card className="mt-3 border-emerald-200 bg-emerald-50/50 py-4">
        <CardContent className="px-4">
          <div className="flex items-start gap-3" role="status">
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
            <div>
              <p className="font-medium text-emerald-800">
                投稿ありがとうございます！
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                投稿が一覧に反映されました。
                {!session?.user && (
                  <>
                    <br />
                    ※マイページに記録するには
                    <Link prefetch={false} href="/login" className="ml-1 underline">
                      ログイン
                    </Link>
                    が必要です。
                  </>
                )}
              </p>
              <Button
                onClick={() => {
                  setStatus("idle");
                  setIsOpen(false);
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
        {/* UX-9: 初投稿者向けヘルプ link (Nielsen H10) */}
        <div className="mb-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          初めての投稿ですか？
          <Link prefetch={false} href="/guide/beginner" className="ml-1 font-medium text-primary underline">
            初心者向けガイドを見る
          </Link>
          <span className="ml-1">で書き方のコツを確認できます</span>
        </div>

        {/* PR-INV-2: 称号 progress (ログイン user のみ表示) */}
        {(() => {
          const reportCount = session?.user?.reportCount;
          if (typeof reportCount !== "number") return null;
          const currentTitle = getTitle(reportCount);
          const next = getNextTier(reportCount);
          if (!next) {
            return (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
                <Trophy className="size-3.5 text-amber-600" />
                <span className="text-amber-900">最高称号 {currentTitle.emoji} {currentTitle.label} 達成中! 投稿し続けて記録更新を</span>
              </div>
            );
          }
          return (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
              <Trophy className="size-3.5 text-amber-600" />
              <span className="text-amber-900">
                現在 {currentTitle.emoji} {currentTitle.label} ({reportCount}件)
                — あと <strong>{next.remaining}件</strong> で {next.emoji} {next.label}
              </span>
            </div>
          );
        })()}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="cr-username" className="mb-1 block text-sm font-medium">
              ニックネーム{" "}
              {session?.user ? (
                <span className="text-destructive">*</span>
              ) : (
                <span className="text-xs font-normal text-muted-foreground">自動でOK・そのまま投稿できます</span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="cr-username"
                type="text"
                placeholder="例: 釣りキチ太郎"
                value={userName}
                onChange={(e) => { setUserName(e.target.value); if (status === "error") setStatus("idle"); }}
                maxLength={20}
                required
              />
              {!session?.user && (
                <button
                  type="button"
                  onClick={rerollNickname}
                  title="別の名前にする"
                  aria-label="ニックネームを引き直す"
                  className="flex size-9 shrink-0 items-center justify-center rounded-md border border-input text-lg transition-colors hover:bg-muted"
                >
                  🎲
                </button>
              )}
            </div>
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
              const selected = fishName ? fishName.split("、").map(s => s.trim()).filter(Boolean) : [];
              const selectedSet = new Set(selected);
              const toggle = (name: string) => {
                if (selectedSet.has(name)) {
                  setFishName(selected.filter(s => s !== name).join("、"));
                } else {
                  setFishName([...selected, name].join("、"));
                }
              };
              return buttons.length > 0 ? (
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {buttons.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggle(name)}
                      aria-pressed={selectedSet.has(name)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        selectedSet.has(name)
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
              onChange={(e) => { setFishName(e.target.value); if (status === "error") setStatus("idle"); }}
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
              max={formatLocalDate(new Date())}
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
                <NextImage
                  src={photoPreview}
                  alt="プレビュー"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg border object-cover"
                  unoptimized
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

          {/* サイズ入力 */}
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
                  aria-pressed={method === m}
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
                  aria-pressed={weather === w.value}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    weather === w.value
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-muted-foreground/20 text-muted-foreground hover:border-amber-300 hover:bg-amber-50/50"
                  }`}
                >
                  <span aria-hidden="true">{w.icon}</span> {w.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="cr-comment" className="mb-1 block text-sm font-medium">
              ひとこと（任意）
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {comment.length}/100
              </span>
            </label>
            <div className="mb-1.5 flex flex-wrap gap-1">
              {COMMENT_CHIPS.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => {
                    setComment((prev) => {
                      const base = prev.trim();
                      if (!base) return text;
                      const joined = `${base} ${text}`;
                      return joined.length <= 100 ? joined : prev;
                    });
                    if (status === "error") setStatus("idle");
                  }}
                  className="rounded-full border border-muted-foreground/20 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  {text}
                </button>
              ))}
            </div>
            <textarea
              id="cr-comment"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="タップで入力できます（書かなくてもOK）"
              value={comment}
              onChange={(e) => { setComment(e.target.value); if (status === "error") setStatus("idle"); }}
              maxLength={100}
            />
          </div>

          {/* タグ（任意・最大5個） */}
          <div>
            <label htmlFor="cr-tags" className="mb-1 block text-sm font-medium">
              タグ（任意）
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                カンマ・スペース区切りで5個まで（例: アジング 夜釣り）
              </span>
            </label>
            <input
              id="cr-tags"
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
              placeholder="#サビキ #朝マヅメ"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              maxLength={120}
            />
          </div>

          {status === "error" && errorMessage && (
            <div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              disabled={status === "submitting" || photoUploading}
              className="gap-2"
            >
              <Send className="size-4" aria-hidden="true" />
              {photoUploading ? "写真をアップロード中..." : status === "submitting" ? "送信中..." : "釣果を投稿する"}
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
