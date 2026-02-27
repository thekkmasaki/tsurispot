import type { Metadata } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { PWARegister } from "@/components/pwa-register";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ScrollToTop } from "@/components/scroll-to-top";
import { CompareBar } from "@/components/spots/compare-bar";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tsurispot.com"),
  title: {
    default: "ツリスポ - 釣りスポット総合情報サイト",
    template: "%s | ツリスポ",
  },
  description:
    "地図で直感的に釣りスポットを探せる総合情報サイト。今の時期に何が釣れるか、ベストな時間帯、おすすめの仕掛けまで、釣りに必要な情報をすべて掲載。",
  keywords: [
    "釣りスポット",
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
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ツリスポ",
    url: "https://tsurispot.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "ツリスポ - 釣りスポット総合情報サイト",
    description: "近くの釣り場を地図で簡単検索。全国1000箇所以上の釣りスポットから、今の時期に釣れる魚・仕掛け情報まで網羅。",
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
        {/* Bing Webmaster Tools 認証用（登録後に値を設定してコメント解除）
        <meta name="msvalidate.01" content="BING_VERIFICATION_CODE" /> */}
        {/* Yandex Webmaster 認証用（登録後に値を設定してコメント解除）
        <meta name="yandex-verification" content="YANDEX_VERIFICATION_CODE" /> */}
        {/*
          検索エンジン登録手順（ユーザー作業）:
          1. Bing Webmaster Tools: https://www.bing.com/webmasters/ でサイト追加
             → 認証コードを msvalidate.01 メタタグに設定
          2. Yandex Webmaster: https://webmaster.yandex.com/ でサイト追加
             → 認証コードを yandex-verification メタタグに設定
          3. デプロイ後 curl https://tsurispot.com/api/ping-search-engines を実行
        */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ツリスポ" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className={`${notoSansJP.variable} ${inter.variable} font-[family-name:var(--font-noto-sans-jp)] antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ツリスポ",
              alternateName: ["TsuriSpot", "つりすぽ"],
              url: "https://tsurispot.com",
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
              name: "ツリスポ",
              alternateName: "TsuriSpot",
              url: "https://tsurispot.com",
              logo: "https://tsurispot.com/logo.svg",
              description:
                "全国1000箇所以上の釣りスポットを掲載する総合情報サイト。地図で直感的に釣り場を探せ、今の時期に釣れる魚やおすすめの仕掛け情報を提供。",
              foundingDate: "2025",
              founder: {
                "@type": "Person",
                name: "正木 家康",
                jobTitle: "編集長",
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
                "全国1000箇所以上の釣りスポットを地図で検索できる無料Webアプリ。今釣れる魚、仕掛け情報、初心者ガイドも充実。",
            }),
          }}
        />
        <GoogleAnalytics />
        <PWARegister />
        <Header />
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
        <CompareBar />
        <ScrollToTop />
        <CookieBanner />
      </body>
    </html>
  );
}
