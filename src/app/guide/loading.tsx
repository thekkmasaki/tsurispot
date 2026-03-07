import { Skeleton } from "@/components/ui/skeleton";

export default function GuideLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Title */}
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-6 h-4 w-80 max-w-full" />

      {/* Guide cards (2 columns, 4 items) */}
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-3 h-40 w-full rounded-md" />
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
