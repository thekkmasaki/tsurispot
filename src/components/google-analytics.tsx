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
          // Consent Mode v2（地域別 default）。AdSense は lazyOnload で後から読み込まれるため、
          // この default が確実に先行する。
          // EEA/UK/CH（GDPR圏）は全拒否を起点にし、同意で update する（法令順守）。
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH'],
            wait_for_update: 500,
          });
          // それ以外の地域（PVの大半を占める日本など、Cookie解析に事前同意が不要な地域）は
          // analytics_storage を granted で開始し、同意前の GA4 過少計測（アクティブユーザー急減）を解消する。
          // 広告系(ad_storage/ad_user_data/ad_personalization)は方針どおり同意制を維持し denied 起点のまま。
          // region 指定の default は非region default より優先されるため、EEA は上の全拒否が効く。
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted',
          });
          // 再訪ユーザーの明示選択を常に復元する（地域別 default に依存せず確実に honor する）。
          try {
            var tsConsent = localStorage.getItem('tsurispot-cookie-consent');
            if (tsConsent === 'accepted') {
              gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                analytics_storage: 'granted',
              });
            } else if (tsConsent === 'denied') {
              gtag('consent', 'update', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
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
