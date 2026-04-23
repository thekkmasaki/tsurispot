import { cn } from "@/lib/utils";

export function FishingScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">釣り日和</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-4 rounded-sm",
              i < score ? "bg-emerald-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}
