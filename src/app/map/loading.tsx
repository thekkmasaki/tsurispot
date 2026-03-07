import { Skeleton } from "@/components/ui/skeleton";

export default function MapLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Title */}
      <Skeleton className="mb-6 h-8 w-48" />

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Map area */}
        <div className="flex-1">
          <Skeleton className="h-[60vh] w-full rounded-lg" />
        </div>

        {/* Sidebar filters */}
        <div className="w-full space-y-4 lg:w-72">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
