import { YouTubeSearchLink } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play } from "lucide-react";

function YouTubeLinkCard({ link }: { link: YouTubeSearchLink }) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(link.searchQuery)}`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="group overflow-hidden py-0 transition-shadow hover:shadow-md">
        {/* YouTube風のヘッダー */}
        <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-red-600">
              <Play className="size-4 fill-white text-white" />
            </div>
            <Badge className="bg-red-600 text-xs text-white hover:bg-red-600">
              YouTube
            </Badge>
          </div>
          <ExternalLink className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold group-hover:text-red-600">
            {link.label}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {link.description}
          </p>
          <p className="mt-2 text-xs text-red-600">
            「{link.searchQuery}」で動画を検索 →
          </p>
        </CardContent>
      </Card>
    </a>
  );
}

export function YouTubeVideoList({ links }: { links?: YouTubeSearchLink[] }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {links.map((link, i) => (
        <YouTubeLinkCard key={`${link.searchQuery}-${i}`} link={link} />
      ))}
    </div>
  );
}
