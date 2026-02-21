import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return [];
}

export default async function ShopDetailPage({ params }: { params: Params }) {
  notFound();
}
