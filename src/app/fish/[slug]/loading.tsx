import { Skeleton } from "@/components/ui/skeleton";
import { SpotCardSkeleton } from "@/components/spots/spot-card-skeleton";

export default function FishDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb skeleton */}
      <Skeleton className="mb-4 h-4 w-56" />

      {/* Back link skeleton */}
      <Skeleton className="mb-4 h-4 w-28" />

      {/* Fish hero section */}
      <div className="mb-6 flex flex-col gap-6 md:flex-row">
        {/* Fish image */}
        <Skeleton className="h-56 w-full rounded-lg md:w-80" />

        {/* Fish info */}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Month calendar skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-3 h-6 w-36" />
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* Fishing methods skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-3 h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="mb-2 h-5 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Related spots section */}
      <div>
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SpotCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
