import { Skeleton } from "@/components/ui/skeleton";
import { SpotCardSkeleton } from "@/components/spots/spot-card-skeleton";

export default function FavoritesLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Title */}
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-4 w-80 max-w-full" />

      {/* Spot cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SpotCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
