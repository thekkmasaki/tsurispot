import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export interface PseoLink {
  href: string;
  label: string;
  sublabel?: string;
}

/**
 * pSEOテンプレ間を相互リンクする汎用セクション。
 * authority・ロングテール流入・クロール深度の底上げが目的。
 * links が空なら何も描画しない（リンク切れ・空セクションを防ぐ）。
 */
export function RelatedPseoLinks({
  title,
  links,
}: {
  title: string;
  links: PseoLink[];
}) {
  if (!links || links.length === 0) return null;
  return (
    <section className="mb-8 sm:mb-10">
      <h2 className="mb-3 text-base font-bold sm:text-lg">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-3 sm:p-4">
                <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                  {l.label}
                </h3>
                {l.sublabel && (
                  <p className="mt-1 text-xs text-muted-foreground">{l.sublabel}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
