import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Maru_Gothic } from "next/font/google";
import Script from "next/script";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { PWARegister } from "@/components/pwa-register";
import { Providers } from "@/components/providers";
import dynamic from "next/dynamic";
import { SPOT_COUNT_FORMATTED } from "@/lib/data/spot-count";

const PWAInstallHint = dynamic(() => import("@/components/pwa-install-hint").then(m => ({ default: m.PWAInstallHint })));
const CookieBanner = dynamic(() => import("@/components/layout/cookie-banner").then(m => ({ default: m.CookieBanner })));
const BackToTop = dynamic(() => import("@/components/ui/back-to-top").then(m => ({ default: m.BackToTop })));
const CompareBar = dynamic(() => import("@/components/spots/compare-bar").then(m => ({ default: m.CompareBar })));
const PreFooterAd = dynamic(() => import("@/components/ads/ad-unit").then(m => ({ default: m.PreFooterAd })));
// ATF広告はCLS悪化・順位下落の原因のため削除 (2026-04-25)
// const HeaderBannerAd = dynamic(() => import("@/components/ads/ad-unit").then(m => ({ default: m.HeaderBannerAd })));
// const MobileHeaderBannerAd = dynamic(() => import("@/components/ads/ad-unit").then(m => ({ default: m.MobileHeaderBannerAd })));
const SmartMobileStickyAd = dynamic(() => import("@/components/layout/smart-mobile-ad").then(m => ({ default: m.SmartMobileStickyAd })));
const SideRailAds = dynamic(() => import("@/components/ads/ad-unit").then(m => ({ default: m.SideRailAds })));
import "./globals.css";

const SPOT_COUNT = SPOT_COUNT_FORMATTED;

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
});

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
  preload: true,
});


export const metadata: Metadata = {
  metadataBase: new URL("https://tsurispot.com"),
  title: {
    default: "ツリスポ（つりすぽ）- 近くの釣りスポット検索",
    template: "%s | ツリスポ（つりすぽ）",
  },
  description:
    "全国 2,100 件超の釣り場を地図で直感的に探せる総合情報サイト「つりすぽ (ツリスポ)」。 潮汐・水温・風速・波浪の予報、 今釣れる魚種、 釣り場ごとの混雑予想・航空写真・口コミ・釣果報告まで、 初心者の釣行計画に必要な情報をすべて無料で掲載しています。",
  keywords: [
    "ツリスポ",
    "つりすぽ",
    "釣りスポット",
    "近く 釣りスポット",
    "釣りスポット 近く",
    "釣り場",
    "近くの釣り場",
    "近く 釣り場所",
    "釣り場 近く",
    "釣り初心者",
    "今釣れる魚",
    "釣り場情報",
    "海釣り",
    "川釣り",
    "釣り場 おすすめ",
    "穴場 釣りスポット",
    "釣りスポット おすすめ",
    "堤防釣り スポット",
    "堤防釣り 場所",
    "海釣り スポット",
    "川釣り スポット",
    "釣り場 穴場",
    "海釣り 初心者",
    "潮見表",
    "潮汐 釣り",
    "水温 釣り",
    "風速 釣り",
    "釣り 天気",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ツリスポ",
    url: "https://tsurispot.com",
  },
  twitter: {
    card: "summary_large_image",
    site: "@tsurispot_jp",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://tsurispot.com",
  },
  classification: "fishing, outdoor recreation, Japan travel",
  other: {
    "ai-content-declaration": "human-created",
    "supported-models": "GPTBot, ClaudeBot, PerplexityBot, Google-Extended",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0369a1" />
        {/* Preconnect: 外部ドメインへの接続を事前確立してCWV改善 */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://images.microcms-assets.io" />
        {/* Bing Webmaster Tools: .env.local に NEXT_PUBLIC_BING_VERIFICATION を設定 */}
        {process.env.NEXT_PUBLIC_BING_VERIFICATION && (
          <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION} />
        )}
        {/* Yandex Webmaster: .env.local に NEXT_PUBLIC_YANDEX_VERIFICATION を設定 */}
        {process.env.NEXT_PUBLIC_YANDEX_VERIFICATION && (
          <meta name="yandex-verification" content={process.env.NEXT_PUBLIC_YANDEX_VERIFICATION} />
        )}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="application-name" content="ツリスポ" />
        <meta name="apple-mobile-web-app-title" content="ツリスポ" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* AI/LLM向けサイト情報ドキュメント */}
        <link rel="help" type="text/markdown" href="/llms.txt" title="LLM Information" />
        <link rel="author" type="text/plain" href="/humans.txt" />
      </head>
      <body
        className={`${notoSansJP.variable} ${zenMaruGothic.variable} font-[family-name:var(--font-noto-sans-jp)] antialiased`}
      >
        {/* WebSite schema: サイト名をGoogleに正しく認識させるため独立したscriptタグ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://tsurispot.com/#website",
              name: "ツリスポ",
              alternateName: ["TsuriSpot", "つりすぽ", "釣りスポット"],
              url: "https://tsurispot.com",
              inLanguage: "ja",
              publisher: {
                "@id": "https://tsurispot.com/#organization",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://tsurispot.com/spots?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://tsurispot.com/#organization",
              name: "ツリスポ",
              alternateName: "TsuriSpot",
              url: "https://tsurispot.com",
              logo: "https://tsurispot.com/logo.svg",
              description:
                `全国${SPOT_COUNT}箇所以上の釣りスポットを掲載する総合情報サイト。地図で直感的に釣り場を探せ、今の時期に釣れる魚やおすすめの仕掛け情報を提供。`,
              foundingDate: "2025",
              founder: {
                "@type": "Person",
                name: "正木 家康",
                jobTitle: "創設者・編集長",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "fishingspotjapan@gmail.com",
                url: "https://tsurispot.com/contact",
                availableLanguage: "Japanese",
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "JP",
              },
              sameAs: [
                "https://www.instagram.com/tsurispotjapan/",
                "https://x.com/tsurispot_jp",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "ツリスポ",
              url: "https://tsurispot.com",
              applicationCategory: "TravelApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
              },
              description:
                `全国${SPOT_COUNT}箇所以上の釣りスポットを地図で検索できる無料Webアプリ。今釣れる魚、仕掛け情報、初心者ガイドも充実。`,
            }),
          }}
        />
        <GoogleAnalytics />
        {/* AdSense: lazyOnload で初回ロードのレンダリングブロックを回避（CLS/LCP優先） */}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
        <Providers>
          {/* Phase 6 audit: skip link (a11y、 keyboard 利用者がナビをスキップしてメインへ) */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-lg focus:ring-2 focus:ring-primary"
          >
            メインコンテンツへスキップ
          </a>
          <PWARegister />
          <SideRailAds />
          <Header />
          <main id="main-content" className="min-h-screen pb-24 md:pb-0">{children}</main>
          <PreFooterAd />
          <Footer />
          <MobileNav />
          <SmartMobileStickyAd />
          <PWAInstallHint />
          <CompareBar />
          <BackToTop />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
