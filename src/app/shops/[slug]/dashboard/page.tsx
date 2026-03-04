import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "店舗管理画面",
  description: "釣具店のエサ在庫情報を管理するダッシュボード",
  robots: { index: false },
};

export default function ShopDashboardPage() {
  return <DashboardClient />;
}
