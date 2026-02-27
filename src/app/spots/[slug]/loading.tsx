import { Skeleton } from "@/components/ui/skeleton";

export default function SpotDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <Skeleton className="mb-4 h-4 w-64" />

      {/* Back link */}
      <Skeleton className="mb-4 h-5 w-36" />

      {/* Title area */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 sm:w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="size-10 rounded-md" />
            <Skeleton className="size-10 rounded-md" />
          </div>
        </div>
        <Skeleton className="mt-2 h-4 w-48" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-3/4" />
      </div>

      {/* Photo */}
      <Skeleton className="mb-6 h-48 w-full rounded-xl sm:h-56 md:h-72" />

      {/* Tab bar skeleton */}
      <div className="mt-6 flex gap-1 rounded-lg bg-muted p-1">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </div>

      {/* Tab content skeleton */}
      <div className="mt-4 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-16" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
