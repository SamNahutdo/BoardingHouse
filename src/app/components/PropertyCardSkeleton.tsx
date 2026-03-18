import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden border rounded-2xl">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[4/3] w-full" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    </Card>
  );
}
