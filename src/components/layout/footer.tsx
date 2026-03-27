import Link from "next/link";
import { Fish } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative">
      {/* SVG波ボーダー */}
      <div className="relative -mb-px">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" className="fill-[oklch(0.20_0.08_230)]" />
        </svg>
      </div>
      <div className="bg-gradient-to-b from-[oklch(0.20_0.08_230)] to-[oklch(0.15_0.06_235)]">
      {/* Desktop footer - full version */}
      <div className="mx-auto hidden max-w-7xl px-4 py-8 md:block">
        <div className="grid grid-cols-5 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                <Fish className="h-4 w-4 text-sea-foam" aria-hidden="true" />
              </div>
              <span className="font-bold text-white font-[family-name:var(--font-zen-maru)]">ツリスポ</span>
            </Link>
            <p className="mt-2 text-sm text-blue-100/70">
              みんなが使いやすい
              <br />
              釣りスポット総合情報サイト
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="https://www.instagram.com/tsurispotjapan/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="公式Instagram"
                className="inline-flex items-center gap-2 text-sm text-blue-100/70 hover:text-white transition-colors"
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
              <a
                href="https://x.com/tsurispot_jp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="公式X（Twitter）"
                className="inline-flex items-center gap-2 text-sm text-blue-100/70 hover:text-white transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @tsurispot_jp
              </a>
              {process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL && (
                <a
                  href={process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LINE公式アカウント友だち追加"
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-sm"
                  style={{ backgroundColor: "#06c755" }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  友だち追加
                </a>
              )}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-sea-foam">釣りスポットを探す</h3>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li><Link href="/spots" className="hover:text-white">全国の釣りスポット一覧</Link></li>
              <li><Link href="/fishing-spots/near-me" className="hover:text-white">近くの釣り場を探す</Link></li>
              <li><Link href="/ranking" className="hover:text-white">釣りスポット人気ランキング</Link></li>
              <li><Link href="/fishing-spots/breakwater-beginner" className="hover:text-white">堤防釣り初心者おすすめ</Link></li>
              <li><Link href="/fishing-spots/best-saltwater" className="hover:text-white">海釣りおすすめスポット</Link></li>
              <li><Link href="/fishing-spots/river-beginner" className="hover:text-white">川釣り初心者おすすめ</Link></li>
              <li><Link href="/area" className="hover:text-white">エリアで探す</Link></li>
              <li><Link href="/map" className="hover:text-white">地図で探す</Link></li>
              <li><Link href="/catchable-now" className="hover:text-white">今釣れる魚</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-sea-foam">釣りを学ぶ</h3>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li><Link href="/blog" className="hover:text-white">コラム</Link></li>
              <li><Link href="/quiz" className="hover:text-white">釣りクイズ</Link></li>
              <li><Link href="/bouzu-checker" className="hover:text-white">ボウズ確率チェッカー</Link></li>
              <li><Link href="/guide" className="hover:text-white">釣りの始め方</Link></li>
              <li><Link href="/fish" className="hover:text-white">魚種図鑑</Link></li>
              <li><Link href="/glossary" className="hover:text-white">釣り用語集</Link></li>
              <li><Link href="/methods" className="hover:text-white">釣り方から探す</Link></li>
              <li><Link href="/monthly" className="hover:text-white">月別釣りガイド</Link></li>
              <li><Link href="/seasonal" className="hover:text-white">季節別ガイド</Link></li>
              <li><Link href="/fishing-calendar" className="hover:text-white">釣りカレンダー</Link></li>
              <li><Link href="/beginner-checklist" className="hover:text-white">持ち物チェックリスト</Link></li>
              <li><Link href="/fishing-rules" className="hover:text-white">ルールとマナー</Link></li>
              <li><Link href="/instructor-exam" className="hover:text-white">釣りインストラクター試験対策</Link></li>
              <li><Link href="/gear" className="hover:text-white">編集長厳選の釣り道具</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-sea-foam">サポート</h3>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li><Link href="/safety" className="hover:text-white">安全ガイド</Link></li>
              <li><Link href="/faq" className="hover:text-white">よくある質問</Link></li>
              <li><Link href="/contact" className="hover:text-white">お問い合わせ</Link></li>
              <li><Link href="/partner" className="hover:text-white font-medium text-sea-foam">釣具店・遊漁船の方へ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-sea-foam">サイト情報</h3>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li><Link href="/about" className="hover:text-white">ツリスポについて</Link></li>
              <li><Link href="/partner" className="hover:text-white">事業者様向け（掲載案内）</Link></li>
              <li><Link href="/privacy" className="hover:text-white">プライバシーポリシー</Link></li>
              <li><Link href="/terms" className="hover:text-white">利用規約</Link></li>
              <li><Link href="/legal" className="hover:text-white">特定商取引法に基づく表記</Link></li>
            </ul>
          </div>
        </div>
        {/* 人気魚種リンク */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <h3 className="mb-3 text-sm font-semibold text-sea-foam">人気の釣りターゲット</h3>
          <div className="flex flex-wrap gap-2 text-xs text-blue-100/60">
            <Link href="/fish/aji" className="hover:text-white">アジの釣り方</Link>
            <span>·</span>
            <Link href="/fish/saba" className="hover:text-white">サバの釣り方</Link>
            <span>·</span>
            <Link href="/fish/kasago" className="hover:text-white">カサゴの釣り方</Link>
            <span>·</span>
            <Link href="/fish/iwashi" className="hover:text-white">イワシの釣り方</Link>
            <span>·</span>
            <Link href="/fish/kisu" className="hover:text-white">キスの釣り方</Link>
            <span>·</span>
            <Link href="/fish/suzuki" className="hover:text-white">スズキの釣り方</Link>
            <span>·</span>
            <Link href="/fish/kurodai" className="hover:text-white">クロダイの釣り方</Link>
            <span>·</span>
            <Link href="/fish/aori-ika" className="hover:text-white">アオリイカの釣り方</Link>
            <span>·</span>
            <Link href="/fish/mebaru" className="hover:text-white">メバルの釣り方</Link>
            <span>·</span>
            <Link href="/fish/karei" className="hover:text-white">カレイの釣り方</Link>
            <span>·</span>
            <Link href="/fish" className="hover:text-foreground font-medium">魚種図鑑一覧 →</Link>
          </div>
        </div>

        {/* 釣り方ガイドリンク */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <h3 className="mb-3 text-sm font-semibold text-sea-foam">釣り方ガイド</h3>
          <div className="flex flex-wrap gap-2 text-xs text-blue-100/60">
            <Link href="/methods/sabiki" className="hover:text-white">サビキ釣り</Link>
            <span>·</span>
            <Link href="/methods/choi-nage" className="hover:text-white">ちょい投げ</Link>
            <span>·</span>
            <Link href="/methods/uki-zuri" className="hover:text-white">ウキ釣り</Link>
            <span>·</span>
            <Link href="/methods/ajing" className="hover:text-white">アジング</Link>
            <span>·</span>
            <Link href="/methods/eging" className="hover:text-white">エギング</Link>
            <span>·</span>
            <Link href="/methods/mebaring" className="hover:text-white">メバリング</Link>
            <span>·</span>
            <Link href="/methods/shore-jigging" className="hover:text-white">ショアジギング</Link>
            <span>·</span>
            <Link href="/methods/ana-zuri" className="hover:text-white">穴釣り</Link>
            <span>·</span>
            <Link href="/methods" className="hover:text-foreground font-medium">釣り方一覧 →</Link>
          </div>
        </div>

        {/* 人気都道府県リンク */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <h3 className="mb-3 text-sm font-semibold text-sea-foam">人気エリアの釣りスポット</h3>
          <div className="flex flex-wrap gap-2 text-xs text-blue-100/60">
            <Link href="/prefecture/hokkaido" className="hover:text-white">北海道の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/tokyo" className="hover:text-white">東京の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/kanagawa" className="hover:text-white">神奈川の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/chiba" className="hover:text-white">千葉の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/shizuoka" className="hover:text-white">静岡の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/aichi" className="hover:text-white">愛知の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/osaka" className="hover:text-white">大阪の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/hyogo" className="hover:text-white">兵庫の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/hiroshima" className="hover:text-white">広島の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/fukuoka" className="hover:text-white">福岡の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture/okinawa" className="hover:text-white">沖縄の釣り場</Link>
            <span>·</span>
            <Link href="/prefecture" className="hover:text-foreground font-medium">全都道府県一覧 →</Link>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-blue-100/60">
          <p>&copy; 2025-2026 ツリスポ All rights reserved.</p>
          <p className="mt-1 text-xs">
            創設者・編集長: 正木 家康｜運営開始: 2025年｜掲載スポット: 2,100箇所以上｜特許出願中（特願2026-042836）
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed">
            当サイトはAmazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
          </p>
          <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-blue-100/50">
            また、楽天アフィリエイトにも参加しています。商品リンクからの購入で当サイトに報酬が支払われることがありますが、ユーザーに追加費用は発生しません。
          </p>
        </div>
      </div>

      {/* Mobile footer - compact version with essential links */}
      <div className="px-4 pb-24 pt-6 md:hidden">
        <div className="mb-4 flex justify-center gap-4">
          <a
            href="https://www.instagram.com/tsurispotjapan/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="公式Instagram"
            className="inline-flex items-center gap-2 text-sm text-blue-100/70 hover:text-white transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            Instagram
          </a>
          <a
            href="https://x.com/tsurispot_jp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="公式X（Twitter）"
            className="inline-flex items-center gap-2 text-sm text-blue-100/70 hover:text-white transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X
          </a>
          {process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL && (
            <a
              href={process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LINE友だち追加"
              className="inline-flex items-center gap-2 rounded-lg bg-[#06c755] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#05b04c] transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              友だち追加
            </a>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs text-blue-100/60 mb-3">
          <Link href="/fishing-spots/near-me" className="hover:text-white font-medium">近くの釣り場</Link>
          <Link href="/fishing-spots/breakwater-beginner" className="hover:text-white">堤防釣り初心者</Link>
          <Link href="/fishing-spots/best-saltwater" className="hover:text-white">海釣りおすすめ</Link>
          <Link href="/ranking" className="hover:text-white">人気ランキング</Link>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-blue-100/60">
          <Link href="/blog" className="hover:text-white">コラム</Link>
          <Link href="/about" className="hover:text-white">ツリスポについて</Link>
          <Link href="/partner" className="hover:text-white">事業者様向け</Link>
          <Link href="/privacy" className="hover:text-white">プライバシーポリシー</Link>
          <Link href="/terms" className="hover:text-white">利用規約</Link>
          <Link href="/legal" className="hover:text-white">特商法表記</Link>
        </div>
        <p className="mt-3 text-center text-xs text-blue-100/60">
          &copy; 2025-2026 ツリスポ
        </p>
        <p className="mt-1 text-center text-[10px] text-blue-100/50">
          創設者: 正木 家康｜特許出願中
        </p>
        <p className="mx-auto mt-2 max-w-xs text-center text-[11px] leading-relaxed text-blue-100/50">
          Amazonアソシエイト・プログラム参加者｜楽天アフィリエイト参加
        </p>
      </div>
      </div>
    </footer>
  );
}
