import { Skeleton } from "@/components/ui/skeleton";
import { SpotCardSkeleton } from "@/components/spots/spot-card-skeleton";

export default function SpotsLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb skeleton */}
      <Skeleton className="mb-4 h-4 w-48" />

      {/* Title */}
      <Skeleton className="mb-2 h-8 w-64" />
      <Skeleton className="mb-6 h-4 w-96 max-w-full" />

      {/* Filter bar skeleton */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Spot cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SpotCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
