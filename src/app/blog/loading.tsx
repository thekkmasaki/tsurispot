import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb skeleton */}
      <Skeleton className="mb-4 h-4 w-48" />

      {/* Title */}
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-6 h-4 w-72 max-w-full" />

      {/* Category filter bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-22 rounded-md" />
        <Skeleton className="h-9 w-26 rounded-md" />
      </div>

      {/* Blog article cards (2 columns, 4 items) */}
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-3 h-44 w-full rounded-md" />
            <Skeleton className="mb-2 h-5 w-3/4" />
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="mb-3 h-4 w-2/3" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
