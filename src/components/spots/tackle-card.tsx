import { Star, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TackleRecommendation } from "@/types";

export function TackleCard({ tackle }: { tackle: TackleRecommendation }) {
  return (
    <Card className="relative gap-4 py-4">
      {/* PR label */}
      <div className="absolute right-3 top-3 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
        PR
      </div>

      <CardContent className="space-y-3 px-4">
        {/* Product name and brand */}
        <div className="pr-8">
          <div className="flex items-start gap-2">
            <h4 className="text-sm font-semibold leading-tight">
              {tackle.name}
            </h4>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {tackle.brand}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{tackle.description}</p>

        {/* Rating and beginner badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{tackle.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({tackle.reviewCount}件)
            </span>
          </div>
          {tackle.isBeginnerFriendly && (
            <Badge className="bg-green-600 text-[10px] hover:bg-green-600">
              初心者向け
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="text-lg font-bold text-primary">
          {"\u00a5"}
          {tackle.price.toLocaleString()}
        </div>

        {/* Affiliate buttons */}
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1 bg-[#FF9900] hover:bg-[#FF9900]/90 min-h-[44px]">
            <a href={tackle.amazonUrl} target="_blank" rel="noopener noreferrer">
              Amazon
              <ExternalLink className="ml-1 size-3" />
            </a>
          </Button>
          <Button asChild size="sm" className="flex-1 bg-[#BF0000] hover:bg-[#BF0000]/90 min-h-[44px]">
            <a href={tackle.rakutenUrl} target="_blank" rel="noopener noreferrer">
              楽天
              <ExternalLink className="ml-1 size-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
