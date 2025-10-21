import { Skeleton } from '@/components/ui/skeleton';

export function GuessLogoSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6 m-4">
        <Skeleton className="h-8 w-24 rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="min-h-screen w-full rounded-3xl p-4" />
        </div>
      </div>
    </div>
  );
}
