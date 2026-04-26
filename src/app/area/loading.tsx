import { Skeleton } from "@/components/ui/skeleton";

export default function AreaLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb skeleton */}
      <Skeleton className="mb-4 h-4 w-48" />

      {/* Title */}
      <Skeleton className="mb-2 h-8 w-64" />
      <Skeleton className="mb-6 h-4 w-96 max-w-full" />

      {/* Search / filter skeleton */}
      <Skeleton className="mb-6 h-10 w-full max-w-sm rounded-md" />

      {/* Region groups */}
      {Array.from({ length: 4 }).map((_, g) => (
        <div key={g} className="mb-8">
          {/* Region group title */}
          <Skeleton className="mb-4 h-6 w-32" />

          {/* Area cards grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border p-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-1 h-4 w-1/2" />
                <div className="mt-2 flex gap-1">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
