import { Skeleton } from "@/components/ui/skeleton";

export default function RankingLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Title */}
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-4 w-72 max-w-full" />

      {/* Tab bar (3-4 tabs) */}
      <div className="mb-6 flex gap-1 rounded-lg border p-1">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>

      {/* Ranking list (10 rows: number + name + score) */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border p-3"
          >
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-5 w-48 max-w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
