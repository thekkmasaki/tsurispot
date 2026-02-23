import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "釣りのコツ・テクニック｜ツリスポ",
  description: "釣りの上達に役立つコツやテクニックを紹介。初心者から中級者まで使える実践的なアドバイスが満載。",
  alternates: {
    canonical: "https://tsurispot.com/guide",
  },
};

export default function FishingTipsPage() {
  redirect("/guide");
}
