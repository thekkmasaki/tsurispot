"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Consent Mode v2: 広告系はデフォルト拒否（バナー同意で granted に更新）。
          // analytics_storage だけは granted で開始する — 日本のアクセス解析(Cookie)は
          // 事前同意が必須ではなく、default:denied にすると未同意の大多数が
          // クッキーレス計測へ落ち、GA4 のアクティブユーザーが構造的に過少計測される
          // （#86 でこれが原因の見かけ上のトラフィック急減が発生したため granted に修正）。
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted',
            wait_for_update: 500,
          });
          // 同意済みの再訪ユーザーはバナー再表示を待たず即 granted に更新する。
          try {
            if (localStorage.getItem('tsurispot-cookie-consent') === 'accepted') {
              gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'granted',
              });
            }
          } catch (e) {}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
