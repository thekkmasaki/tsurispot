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
            <div className="mt-4">
              <a
                href="https://www.instagram.com/tsurispotjapan/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="公式Instagram"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                @tsurispotjapan
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">釣りスポットを探す</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/spots" className="hover:text-foreground">全国の釣りスポット一覧</Link></li>
              <li><Link href="/fishing-spots/near-me" className="hover:text-foreground">近くの釣り場を探す</Link></li>
              <li><Link href="/ranking" className="hover:text-foreground">釣りスポット人気ランキング</Link></li>
              <li><Link href="/fishing-spots/breakwater-beginner" className="hover:text-foreground">堤防釣り初心者おすすめ</Link></li>
              <li><Link href="/fishing-spots/best-saltwater" className="hover:text-foreground">海釣りおすすめスポット</Link></li>
              <li><Link href="/fishing-spots/river-beginner" className="hover:text-foreground">川釣り初心者おすすめ</Link></li>
              <li><Link href="/area" className="hover:text-foreground">エリアで探す</Link></li>
              <li><Link href="/map" className="hover:text-foreground">地図で探す</Link></li>
              <li><Link href="/catchable-now" className="hover:text-foreground">今釣れる魚</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">釣りを学ぶ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-foreground">コラム</Link></li>
              <li><Link href="/quiz" className="hover:text-foreground">釣りスタイル診断</Link></li>
              <li><Link href="/bouzu-checker" className="hover:text-foreground">ボウズ確率チェッカー</Link></li>
              <li><Link href="/guide" className="hover:text-foreground">釣りの始め方</Link></li>
              <li><Link href="/fish" className="hover:text-foreground">魚種図鑑</Link></li>
              <li><Link href="/glossary" className="hover:text-foreground">釣り用語集</Link></li>
              <li><Link href="/methods" className="hover:text-foreground">釣り方から探す</Link></li>
              <li><Link href="/monthly" className="hover:text-foreground">月別釣りガイド</Link></li>
              <li><Link href="/seasonal" className="hover:text-foreground">季節別ガイド</Link></li>
              <li><Link href="/fishing-calendar" className="hover:text-foreground">釣りカレンダー</Link></li>
              <li><Link href="/beginner-checklist" className="hover:text-foreground">持ち物チェックリスト</Link></li>
              <li><Link href="/fishing-rules" className="hover:text-foreground">ルールとマナー</Link></li>
              <li><Link href="/gear" className="hover:text-foreground">おすすめ釣り道具</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">サポート</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/safety" className="hover:text-foreground">安全ガイド</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">よくある質問</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">お問い合わせ</Link></li>
              <li><Link href="/partner" className="hover:text-foreground font-medium text-blue-600 dark:text-blue-400">釣具店・遊漁船の方へ</Link></li>
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
        {/* 人気都道府県リンク */}
        <div className="mt-6 border-t border-border/40 pt-6">
          <h3 className="mb-3 text-sm font-semibold">人気エリアの釣りスポット</h3>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Link href="/prefecture/hokkaido" className="hover:text-foreground">北海道の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/tokyo" className="hover:text-foreground">東京の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/kanagawa" className="hover:text-foreground">神奈川の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/chiba" className="hover:text-foreground">千葉の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/shizuoka" className="hover:text-foreground">静岡の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/aichi" className="hover:text-foreground">愛知の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/osaka" className="hover:text-foreground">大阪の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/hyogo" className="hover:text-foreground">兵庫の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/hiroshima" className="hover:text-foreground">広島の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/fukuoka" className="hover:text-foreground">福岡の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/okinawa" className="hover:text-foreground">沖縄の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture" className="hover:text-foreground font-medium">全都道府県一覧 →</Link>
          </div>
        </div>

        <div className="mt-6 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 ツリスポ All rights reserved.</p>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed">
            ※ 当サイトはアフィリエイトプログラムに参加しています。商品リンクからの購入で当サイトに報酬が支払われることがあります。
          </p>
        </div>
      </div>

      {/* Mobile footer - compact version with essential links */}
      <div className="px-4 pb-24 pt-6 md:hidden">
        <div className="mb-4 flex justify-center">
          <a
            href="https://www.instagram.com/tsurispotjapan/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="公式Instagram"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            @tsurispotjapan
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground mb-3">
          <Link href="/fishing-spots/near-me" className="hover:text-foreground font-medium">近くの釣り場</Link>
          <Link href="/fishing-spots/breakwater-beginner" className="hover:text-foreground">堤防釣り初心者</Link>
          <Link href="/fishing-spots/best-saltwater" className="hover:text-foreground">海釣りおすすめ</Link>
          <Link href="/ranking" className="hover:text-foreground">人気ランキング</Link>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground">コラム</Link>
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
