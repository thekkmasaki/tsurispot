import type { Metadata } from "next";
import { ContactClient } from "./contact-client";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "ツリスポへのご意見・ご要望・スポット情報の修正依頼はこちらから。釣具店の掲載相談も受け付けています。",
};

export default function ContactPage() {
  return <ContactClient />;
}
