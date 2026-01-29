import { Skeleton } from '@/components/ui/skeleton';

export function FiveSecondsSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        {/* Back Button Skeleton */}
        <Skeleton className="h-10 w-24 rounded-full" />

        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 md:h-16 lg:h-20 w-1/2 mx-auto " />
          <Skeleton className="h-6 md:h-8 lg:h-10 w-3/4 mx-auto " />

          {/* How to Play Button Skeleton */}
          <Skeleton className="h-12 w-48 mx-auto rounded-full" />
        </div>

        {/* Grid: Players + Settings Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Players Section Skeleton */}
          <div className="space-y-2 bg-card border-border  p-6">
            <Skeleton className="h-8 w-1/3  " />
            <Skeleton className="h-20 w-full " />
            <Skeleton className="h-20 w-full " />
            <Skeleton className="h-20 w-full " />
            <Skeleton className="h-20 w-full " />
          </div>

          {/* Settings Section Skeleton */}
          <div className="space-y-4 p-6 bg-card border-border flex flex-col justify-between ">
            <Skeleton className="h-6 w-1/4 " />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
