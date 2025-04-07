import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col space-y-8 p-4 md:p-8">
      {/* Header Skeleton */}
      <Skeleton className="h-10 w-1/3" />

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>

      {/* Chart Skeleton */}
      <Skeleton className="h-64 w-full rounded-lg" />

      {/* Table Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" /> {/* Table Title/Header */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded" /> {/* Table Header Row */}
          <Skeleton className="h-10 w-full rounded" /> {/* Table Row */}
          <Skeleton className="h-10 w-full rounded" /> {/* Table Row */}
          <Skeleton className="h-10 w-full rounded" /> {/* Table Row */}
          <Skeleton className="h-10 w-full rounded" /> {/* Table Row */}
        </div>
      </div>
    </div>
  );
}
