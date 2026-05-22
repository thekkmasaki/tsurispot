"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Ruler, Pencil, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const METHODS = ["サビキ", "投げ", "ルアー", "フカセ", "エギング", "ジギング", "穴釣り", "ウキ釣り", "その他"] as const;
const WEATHER_OPTIONS = ["晴れ", "曇り", "雨", "風強い"] as const;

export interface CatchReport {
  id: string;
  spotSlug: string;
  spotName: string;
  fishName: string;
  comment: string;
  date: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  weather?: string;
}

interface Props {
  report: CatchReport;
  onUpdate: (updated: CatchReport) => void;
  onDelete: (id: string) => void;
}

export function CatchReportCard({ report, onUpdate, onDelete }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [fishName, setFishName] = useState(report.fishName);
  const [sizeCm, setSizeCm] = useState(report.sizeCm?.toString() ?? "");
  const [method, setMethod] = useState(report.method ?? "");
  const [weather, setWeather] = useState(report.weather ?? "");
  const [comment, setComment] = useState(report.comment);

  const resetForm = () => {
    setFishName(report.fishName);
    setSizeCm(report.sizeCm?.toString() ?? "");
    setMethod(report.method ?? "");
    setWeather(report.weather ?? "");
    setComment(report.comment);
    setError("");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    const sizeNum = sizeCm.trim() === "" ? null : Number(sizeCm);
    if (sizeNum !== null && (isNaN(sizeNum) || sizeNum < 0 || sizeNum > 300)) {
      setError("サイズは0〜300cmで入力してください");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/catch-report-ugc/${encodeURIComponent(report.id)}?spotSlug=${encodeURIComponent(report.spotSlug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fishName,
            sizeCm: sizeNum,
            method: method || null,
            weather: weather || null,
            comment,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "更新に失敗しました");
        setSubmitting(false);
        return;
      }
      onUpdate(data.report);
      setEditOpen(false);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(
        `/api/catch-report-ugc/${encodeURIComponent(report.id)}?spotSlug=${encodeURIComponent(report.spotSlug)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "削除に失敗しました");
        setSubmitting(false);
        return;
      }
      onDelete(report.id);
      setDeleteOpen(false);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <Link href={`/spots/${report.spotSlug}`} className="block">
        <div className="flex gap-3">
          {report.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={report.photoUrl} alt={`${report.fishName}の釣果写真`} className="h-16 w-16 rounded-md object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <p className="pr-16 font-medium">{report.fishName}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {report.spotName}
              </span>
              <span className="flex items-center gap-0.5">
                <Calendar className="h-3 w-3" />
                {report.date}
              </span>
              {report.sizeCm && (
                <span className="flex items-center gap-0.5">
                  <Ruler className="h-3 w-3" />
                  {report.sizeCm}cm
                </span>
              )}
              {report.method && <span>{report.method}</span>}
              {report.weather && <span>{report.weather}</span>}
            </div>
            {report.comment && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{report.comment}</p>
            )}
          </div>
        </div>
      </Link>

      <div className="absolute right-2 top-2 flex gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resetForm();
            setEditOpen(true);
          }}
          className="rounded-full bg-background/80 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="編集"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setError("");
            setDeleteOpen(true);
          }}
          className="rounded-full bg-background/80 p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="削除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>釣果を編集</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 px-4 pb-6">
            <div>
              <label className="mb-1 block text-sm font-medium">魚名 *</label>
              <Input
                value={fishName}
                onChange={(e) => setFishName(e.target.value)}
                maxLength={30}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">サイズ (cm)</label>
              <Input
                type="number"
                value={sizeCm}
                onChange={(e) => setSizeCm(e.target.value)}
                placeholder="任意"
                min={0}
                max={300}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">釣法</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("")}
                  className={`rounded-full border px-3 py-1 text-xs ${method === "" ? "bg-primary text-primary-foreground" : "bg-background"}`}
                >
                  指定なし
                </button>
                {METHODS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`rounded-full border px-3 py-1 text-xs ${method === m ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">天候</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setWeather("")}
                  className={`rounded-full border px-3 py-1 text-xs ${weather === "" ? "bg-primary text-primary-foreground" : "bg-background"}`}
                >
                  指定なし
                </button>
                {WEATHER_OPTIONS.map((w) => (
                  <button
                    type="button"
                    key={w}
                    onClick={() => setWeather(w)}
                    className={`rounded-full border px-3 py-1 text-xs ${weather === w ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">コメント *</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={100}
                rows={3}
                className="w-full rounded-md border bg-background p-2 text-sm"
              />
              <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
                {comment.length}/100
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={submitting}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !fishName || !comment}
                className="flex-1"
              >
                {submitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={deleteOpen} onOpenChange={setDeleteOpen}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>釣果を削除</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4 px-4 pb-6">
            <p className="text-sm">この釣果を本当に削除しますか？削除すると元に戻せません。</p>
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-sm font-medium">{report.fishName}</p>
              <p className="text-xs text-muted-foreground">
                {report.spotName} / {report.date}
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={submitting}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
                disabled={submitting}
                variant="destructive"
                className="flex-1"
              >
                {submitting ? "削除中..." : "削除する"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
