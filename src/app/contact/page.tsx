import type { Metadata } from "next";
import { ContactClient } from "./contact-client";

export const metadata: Metadata = {
  title: "お問い合わせ",
};

export default function ContactPage() {
  return <ContactClient />;
}
