"use client";

import { useState } from "react";
import { CheckCircle2, Anchor } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface CheckinButtonProps {
  slug: string;
  className?: string;
}

export function CheckinButton({ slug, className }: CheckinButtonProps) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (status !== "authenticated") {
      window.location.href = "/login";
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotSlug: slug, date, memo }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          setOpen(false);
          setSaved(false);
          setMemo("");
        }, 1200);
      } else {
        setError(data.error || "保存に失敗しました");
      }
    } catch {
      setError("通信エラー");
    }
    setSaving(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100",
          className,
        )}
      >
        <Anchor className="h-4 w-4" />
        ここに行った
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
        <Anchor className="h-4 w-4" />
        釣行を記録（公開されません）
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">行った日</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">
          メモ（{memo.length}/200）
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="天気・釣れた魚・気づきなど"
          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      {saved && (
        <p className="text-xs text-emerald-600">✓ 釣行を記録しました</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {saving ? "保存中..." : "記録する"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="rounded-md border px-3 py-1.5 text-xs"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
