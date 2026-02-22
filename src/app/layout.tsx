import type { Metadata } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { PWARegister } from "@/components/pwa-register";
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
    "釣り初心者",
    "今釣れる魚",
    "釣り場情報",
    "海釣り",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ツリスポ",
    url: "https://tsurispot.com",
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ツリスポ" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8121234270035600"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${notoSansJP.variable} ${inter.variable} font-[family-name:var(--font-noto-sans-jp)] antialiased`}
      >
        <GoogleAnalytics />
        <PWARegister />
        <Header />
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
