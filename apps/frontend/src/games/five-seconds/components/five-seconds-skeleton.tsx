import { Skeleton } from '@/components/ui/skeleton';

export function FiveSecondsSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-6xl space-y-8 m-4">
        <Skeleton className="h-8 w-24 rounded-3xl" />
        <div className="text-center space-y-4 rounded-3xl">
          <Skeleton className="h-16 w-1/2 mx-auto rounded-3xl" />
          <Skeleton className="h-8 w-3/4 mx-auto rounded-3xl" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 rounded-3xl">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
