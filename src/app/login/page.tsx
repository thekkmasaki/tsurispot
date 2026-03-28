"use client";

import { signIn } from "next-auth/react";
import { Fish } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* ロゴ */}
        <div className="text-center">
          <div className="mx-auto flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-mid to-ocean-deep text-white">
              <Fish className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="bg-gradient-to-r from-ocean-deep to-ocean-mid bg-clip-text text-lg font-bold text-transparent font-[family-name:var(--font-zen-maru)]">ツリスポ</span>
          </div>
          <h1 className="mt-3 text-xl font-bold">ログイン</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            お気に入りや釣果をクラウドに保存
          </p>
        </div>

        {/* LINEログイン — 一時メンテナンス中 */}
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-dashed border-muted px-4 py-4 text-center">
            <p className="text-sm font-bold text-muted-foreground">現在メンテナンス中です</p>
            <p className="mt-1 text-xs text-muted-foreground">ログイン機能は一時的にご利用いただけません</p>
          </div>
        </div>

        {/* 注意書き */}
        <div className="space-y-2 text-center text-xs text-muted-foreground">
          <p>ログインしなくても全機能を利用できます</p>
          <p>
            ログインすると、お気に入りや釣果データを
            <br />
            別の端末でも引き継げるようになります
          </p>
          <p>
            ログインにより
            <Link href="/privacy" className="underline hover:text-foreground">
              プライバシーポリシー
            </Link>
            に同意したものとみなします
          </p>
        </div>
      </div>
    </div>
  );
}
