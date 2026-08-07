"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import nextDynamic from "next/dynamic";
import { Camera, Fish, Loader2, LogIn, Map, MapPin, Search, Send, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { compressImage } from "@/lib/image-compress";
import type { PickedSpot } from "./post-spot-map-picker";

const MAX_TEXT_LENGTH = 200;

// 地図（Leaflet + 全スポット座標184KB）は「地図から選ぶ」を開いた時にだけ読み込む
const PostSpotMapPicker = nextDynamic(
  () => import("./post-spot-map-picker").then((m) => m.PostSpotMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full animate-pulse rounded-xl bg-muted sm:h-80" />
    ),
  }
);

interface SpotHit {
  type: string;
  name: string;
  slug: string; // "/spots/{slug}"
  sub?: string;
}

/**
 * Twitter型のつぶやきコンポーザー（/post）。本文のみ必須・200字。
 * 写真📷・場所📍・釣果情報🐟は任意添付。ログイン必須（API側でも強制）。
 */
export function TweetComposer() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  // 場所添付
  const [spot, setSpot] = useState<PickedSpot | null>(null);
  const [spotPanelOpen, setSpotPanelOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SpotHit[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 釣果情報添付
  const [fishPanelOpen, setFishPanelOpen] = useState(false);
  const [fishName, setFishName] = useState("");
  const [sizeCm, setSizeCm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // スポット検索（SpotPickerComposer と同じデバウンス検索）
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    if (!q || !spotPanelOpen) {
      setHits([]);
      return;
    }
    timerRef.current = setTimeout(() => {
      setSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((items: SpotHit[]) => {
          setHits((items || []).filter((i) => i.type === "spot").slice(0, 6));
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, spotPanelOpen]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setErrorMessage("");
    try {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(compressed);
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch("/api/catch-photo", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPhotoUrl(data.url);
      } else {
        setErrorMessage(data.error || "写真のアップロードに失敗しました");
        setPhotoPreview("");
      }
    } catch {
      setErrorMessage("写真のアップロードに失敗しました");
      setPhotoPreview("");
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX_TEXT_LENGTH || submitting || photoUploading) return;
    setSubmitting(true);
    setErrorMessage("");
    try {
      const size = sizeCm !== "" ? Number(sizeCm) : undefined;
      const res = await fetch("/api/posts/tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          photoUrl: photoUrl || undefined,
          spotSlug: spot?.slug || undefined,
          spotName: spot?.name || undefined,
          fishName: fishName.trim() || undefined,
          sizeCm: Number.isFinite(size) ? size : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        toast.success("投稿しました！");
        router.push("/timeline");
      } else {
        setErrorMessage(data.error || "投稿に失敗しました");
      }
    } catch {
      setErrorMessage("ネットワークエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  // 未ログイン: ログイン導線（つぶやきはログイン必須）
  if (authStatus === "unauthenticated") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-4 py-8 text-center">
          <p className="text-sm font-semibold">投稿にはログインが必要です</p>
          <p className="text-xs text-muted-foreground">
            ログインすると、いま釣れてる情報や釣行のつぶやきをタイムラインに投稿できます。
          </p>
          <Link
            prefetch={false}
            href="/login?callbackUrl=%2Fpost"
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-700 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-800"
          >
            <LogIn className="size-4" aria-hidden="true" />
            ログインして投稿する
          </Link>
        </CardContent>
      </Card>
    );
  }

  const remaining = MAX_TEXT_LENGTH - text.length;
  const canSubmit =
    authStatus === "authenticated" &&
    text.trim().length > 0 &&
    remaining >= 0 &&
    !submitting &&
    !photoUploading;

  return (
    <Card>
      <CardContent className="px-4 py-4">
        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-sky-700 text-sm text-white">
            {(session?.user?.nickname || "🎣").slice(0, 1)}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="いま釣れてる？ 釣行の様子をつぶやこう"
            aria-label="投稿本文"
            rows={4}
            maxLength={MAX_TEXT_LENGTH + 50}
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* 添付チップ（場所・写真プレビュー・釣果情報） */}
        {spot && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
            <MapPin className="size-3" aria-hidden="true" />
            {spot.name}
            <button type="button" aria-label="場所を外す" onClick={() => setSpot(null)}>
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        )}
        {photoPreview && (
          <div className="relative mt-2 inline-block">
            <NextImage
              src={photoPreview}
              alt="添付写真プレビュー"
              width={96}
              height={96}
              className="size-24 rounded-xl border object-cover"
              unoptimized
            />
            {photoUploading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                <Loader2 className="size-5 animate-spin text-white" aria-hidden="true" />
              </span>
            )}
            <button
              type="button"
              aria-label="写真を外す"
              onClick={() => {
                setPhotoUrl("");
                setPhotoPreview("");
              }}
              className="absolute -right-2 -top-2 rounded-full bg-slate-700 p-1 text-white"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* 場所選択パネル */}
        {spotPanelOpen && !spot && (
          <div className="mt-3 rounded-xl border p-3">
            <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="スポット名・地名で検索"
                aria-label="スポット検索"
                maxLength={50}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowMap((v) => !v)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-sky-800 hover:bg-sky-50"
              >
                <Map className="size-3" aria-hidden="true" />
                地図
              </button>
            </div>
            {searching && (
              <p className="mt-2 text-center text-xs text-muted-foreground">検索中...</p>
            )}
            {hits.length > 0 && (
              <ul className="mt-2 divide-y rounded-lg border">
                {hits.map((h) => (
                  <li key={h.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setSpot({ slug: h.slug.replace(/^\/spots\//, ""), name: h.name });
                        setSpotPanelOpen(false);
                        setShowMap(false);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                    >
                      <MapPin className="size-3.5 shrink-0 text-sky-700" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{h.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showMap && (
              <div className="mt-2">
                <PostSpotMapPicker
                  onSelect={(picked) => {
                    setSpot(picked);
                    setSpotPanelOpen(false);
                    setShowMap(false);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 釣果情報パネル */}
        {fishPanelOpen && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border p-3">
            <input
              type="text"
              value={fishName}
              onChange={(e) => setFishName(e.target.value)}
              placeholder="魚種（例: アジ）"
              aria-label="魚種"
              maxLength={30}
              className="w-36 rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none"
            />
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <input
                type="number"
                value={sizeCm}
                onChange={(e) => setSizeCm(e.target.value)}
                placeholder="サイズ"
                aria-label="サイズ（cm）"
                min={0}
                max={300}
                className="w-20 rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none"
              />
              cm
            </span>
          </div>
        )}

        {errorMessage && (
          <p className="mt-2 text-xs text-red-500" role="alert">
            {errorMessage}
          </p>
        )}

        {/* ツールバー */}
        <div className="mt-3 flex items-center gap-1 border-t pt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
            aria-label="写真を選択"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoUploading}
            aria-label="写真を付ける"
            className="rounded-full p-2 text-sky-700 transition-colors hover:bg-sky-50"
          >
            <Camera className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setSpotPanelOpen((v) => !v)}
            aria-label="場所を付ける"
            aria-expanded={spotPanelOpen}
            className="rounded-full p-2 text-sky-700 transition-colors hover:bg-sky-50"
          >
            <MapPin className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setFishPanelOpen((v) => !v)}
            aria-label="釣果情報を付ける"
            aria-expanded={fishPanelOpen}
            className="rounded-full p-2 text-sky-700 transition-colors hover:bg-sky-50"
          >
            <Fish className="size-5" aria-hidden="true" />
          </button>
          <span
            className={`ml-auto mr-3 text-xs tabular-nums ${remaining < 0 ? "font-bold text-red-500" : "text-muted-foreground"}`}
          >
            {text.length} / {MAX_TEXT_LENGTH}
          </span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-700 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-800 disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            投稿する
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          場所・写真・釣果（魚種/サイズ）は付けても付けなくてもOK。
        </p>
      </CardContent>
    </Card>
  );
}
