import { Skeleton } from "@/components/ui/skeleton";

export default function FishLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb skeleton */}
      <Skeleton className="mb-4 h-4 w-48" />

      {/* Title */}
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-4 w-80 max-w-full" />

      {/* Filter bar skeleton (category / difficulty / season) */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>

      {/* Fish cards grid (3 columns, 6 items) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-3 h-40 w-full rounded-md" />
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="mb-1 h-4 w-24" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
