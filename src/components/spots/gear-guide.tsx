import { ExternalLink } from "lucide-react";
import { GearGuide as GearGuideType, DIFFICULTY_LABELS } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// 装備項目に対応するアフィリエイトリンクのマッチング
const GEAR_AFFILIATE_LINKS: { pattern: RegExp; url: string; label: string }[] = [
  { pattern: /PE/i, url: "https://amzn.to/4s45H0i", label: "PEライン" },
  { pattern: /ナイロン/i, url: "https://amzn.to/4s1SPaX", label: "ナイロンライン" },
  { pattern: /フロロ/i, url: "https://amzn.to/4tKXyzu", label: "フロロカーボン" },
];

// その他アイテムのアフィリエイトマッチング
const ITEM_AFFILIATE_LINKS: { pattern: RegExp; url: string; label: string }[] = [
  { pattern: /コマセ|アミエビ|アミ姫/, url: "https://amzn.to/4c6gaUn", label: "アミ姫" },
];

function getLineAffiliateUrl(lineText: string): { url: string; label: string } | null {
  for (const link of GEAR_AFFILIATE_LINKS) {
    if (link.pattern.test(lineText)) return link;
  }
  return null;
}

function getItemAffiliateUrl(itemText: string): { url: string; label: string } | null {
  for (const link of ITEM_AFFILIATE_LINKS) {
    if (link.pattern.test(itemText)) return link;
  }
  return null;
}

// ナイロン号数 → PE号数の換算テーブル
const NYLON_TO_PE: Record<string, string> = {
  "0.8": "0.2〜0.3",
  "1": "0.3〜0.4",
  "1.5": "0.4〜0.6",
  "2": "0.6〜0.8",
  "2.5": "0.8〜1",
  "3": "1〜1.2",
  "4": "1.5〜2",
  "5": "2〜2.5",
  "6": "3",
  "8": "4",
  "10": "5",
};

function addPeEquivalent(lineText: string): string {
  // すでにPEが含まれている場合はそのまま返す
  if (/PE/i.test(lineText)) return lineText;
  // ナイロンX号 のパターンを検出
  const match = lineText.match(/ナイロン(\d+(?:\.\d+)?)(?:〜(\d+(?:\.\d+)?))?号/);
  if (!match) return lineText;
  const low = match[1];
  const high = match[2];
  const peLow = NYLON_TO_PE[low];
  const peHigh = high ? NYLON_TO_PE[high] : undefined;
  if (!peLow) return lineText;
  // PE換算を付加
  let pe: string;
  if (peHigh) {
    const peLowFirst = peLow.split("〜")[0];
    const peHighLast = peHigh.includes("〜") ? peHigh.split("〜")[1] : peHigh;
    pe = `PE${peLowFirst}〜${peHighLast}号`;
  } else {
    pe = `PE${peLow}号`;
  }
  return `${lineText}（${pe}相当）`;
}

const difficultyColors = {
  beginner: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  intermediate: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  advanced: "bg-red-100 text-red-700 hover:bg-red-100",
};

function GearRow({ label, value, icon, affiliateUrl, affiliateLabel }: { label: string; value: string; icon: string; affiliateUrl?: string; affiliateLabel?: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="w-5 text-center text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm font-semibold">{value}</dd>
        {affiliateUrl && (
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#FF9900]/10 px-2 py-0.5 text-[11px] font-medium text-[#FF9900] transition-colors hover:bg-[#FF9900] hover:text-white"
          >
            {affiliateLabel || "おすすめを見る"}
            <ExternalLink className="size-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export function GearGuideCard({ guide }: { guide: GearGuideType }) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="border-b bg-muted/50 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold sm:text-base">
            {guide.method}
            <span className="ml-1 text-xs font-normal text-muted-foreground sm:ml-1.5 sm:text-sm">
              （{guide.targetFish}狙い）
            </span>
          </h4>
          <Badge className={cn("shrink-0 text-xs", difficultyColors[guide.difficulty])}>
            {DIFFICULTY_LABELS[guide.difficulty]}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3 sm:p-4">
        {(() => {
          const lineAffiliate = getLineAffiliateUrl(guide.line);
          return (
            <dl className="divide-y">
              <GearRow icon="🎣" label="竿（ロッド）" value={guide.rod} />
              <GearRow icon="🔄" label="リール" value={guide.reel} />
              <GearRow
                icon="🧵"
                label="糸（ライン）"
                value={addPeEquivalent(guide.line)}
                affiliateUrl={lineAffiliate?.url}
                affiliateLabel={`${lineAffiliate?.label}をAmazonで見る`}
              />
              <GearRow icon="🪝" label="仕掛け・針" value={guide.hook} />
            </dl>
          );
        })()}

        {guide.otherItems.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              その他必要なもの
            </p>
            <div className="flex flex-wrap gap-1.5">
              {guide.otherItems.map((item) => {
                const af = getItemAffiliateUrl(item);
                return af ? (
                  <a key={item} href={af.url} target="_blank" rel="noopener noreferrer sponsored">
                    <Badge variant="outline" className="cursor-pointer gap-1 text-xs transition-colors hover:border-[#FF9900] hover:text-[#FF9900]">
                      {item}
                      <ExternalLink className="size-2.5" />
                    </Badge>
                  </a>
                ) : (
                  <Badge key={item} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {guide.tip && (
          <div className="mt-3 rounded-lg bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-800">
              💡 初心者向けコツ
            </p>
            <p className="mt-1 text-sm text-amber-700">{guide.tip}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LineBuyTip() {
  return (
    <Card className="overflow-hidden border-sky-200 py-0">
      <CardContent className="p-3 sm:p-4">
        <p className="mb-1 text-xs font-bold text-sky-800">
          🧵 糸（ライン）は別で買おう！
        </p>
        <p className="text-xs leading-relaxed text-sky-700">
          リールに最初から巻いてある糸は品質が低く、すぐ切れることがあります。
          別売りのラインを自分で巻き替えるのがおすすめです。
        </p>
        <a
          href="/gear/rod-beginner#line-tip"
          className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-700"
        >
          糸の選び方を詳しく見る →
        </a>
      </CardContent>
    </Card>
  );
}

export function GearGuideList({ guides }: { guides?: GearGuideType[] }) {
  if (!guides || guides.length === 0) return null;

  return (
    <div className="space-y-4">
      {guides.map((guide, index) => (
        <GearGuideCard key={`${guide.targetFish}-${guide.method}-${index}`} guide={guide} />
      ))}
      <LineBuyTip />
    </div>
  );
}
