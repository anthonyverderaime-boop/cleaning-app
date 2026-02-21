import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return <Skeleton className="h-20 rounded-xl" />;
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return <Skeleton className="h-80 rounded-xl" />;
}
