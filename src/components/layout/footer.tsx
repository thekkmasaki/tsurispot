import Link from "next/link";
import { Fish } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      {/* Desktop footer - full version */}
      <div className="mx-auto hidden max-w-7xl px-4 py-8 md:block">
        <div className="grid grid-cols-5 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Fish className="h-4 w-4" />
              </div>
              <span className="font-bold">ツリスポ</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              みんなが使いやすい
              <br />
              釣りスポット総合情報サイト
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">釣りスポット</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/spots" className="hover:text-foreground">スポット一覧</Link></li>
              <li><Link href="/area" className="hover:text-foreground">エリアで探す</Link></li>
              <li><Link href="/map" className="hover:text-foreground">地図で探す</Link></li>
              <li><Link href="/catchable-now" className="hover:text-foreground">今釣れる魚</Link></li>
              <li><Link href="/shops" className="hover:text-foreground">釣具店を探す</Link></li>
              <li><Link href="/spots/submit" className="hover:text-foreground">スポットを投稿</Link></li>
              <li><Link href="/favorites" className="hover:text-foreground">お気に入り</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">釣りを学ぶ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/guide" className="hover:text-foreground">釣りの始め方</Link></li>
              <li><Link href="/fish" className="hover:text-foreground">魚種図鑑</Link></li>
              <li><Link href="/glossary" className="hover:text-foreground">釣り用語集</Link></li>
              <li><Link href="/methods" className="hover:text-foreground">釣り方から探す</Link></li>
              <li><Link href="/seasonal" className="hover:text-foreground">季節別ガイド</Link></li>
              <li><Link href="/fishing-calendar" className="hover:text-foreground">釣りカレンダー</Link></li>
              <li><Link href="/beginner-checklist" className="hover:text-foreground">持ち物チェックリスト</Link></li>
              <li><Link href="/fishing-rules" className="hover:text-foreground">ルールとマナー</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">サポート</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/safety" className="hover:text-foreground">安全ガイド</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">よくある質問</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">お問い合わせ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">サイト情報</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">ツリスポについて</Link></li>
              <li><Link href="/partner" className="hover:text-foreground">事業者様向け（掲載案内）</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">プライバシーポリシー</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">利用規約</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 ツリスポ All rights reserved.</p>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed">
            ※ 当サイトはアフィリエイトプログラムに参加しています。商品リンクからの購入で当サイトに報酬が支払われることがあります。
          </p>
        </div>
      </div>

      {/* Mobile footer - compact version with essential links */}
      <div className="px-4 pb-24 pt-6 md:hidden">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">ツリスポについて</Link>
          <Link href="/partner" className="hover:text-foreground">事業者様向け</Link>
          <Link href="/privacy" className="hover:text-foreground">プライバシーポリシー</Link>
          <Link href="/terms" className="hover:text-foreground">利用規約</Link>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          &copy; 2026 ツリスポ
        </p>
        <p className="mx-auto mt-2 max-w-xs text-center text-[10px] leading-relaxed text-muted-foreground/70">
          ※ 当サイトはアフィリエイトプログラムに参加しています。商品リンクからの購入で当サイトに報酬が支払われることがあります。
        </p>
      </div>
    </footer>
  );
}
