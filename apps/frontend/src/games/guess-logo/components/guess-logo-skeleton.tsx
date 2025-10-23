import { Skeleton } from '@/components/ui/skeleton';

export function GuessLogoSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl p-8 rounded-xl bg-card text-center flex flex-col justify-between h-[90vh]">
        {/* Header */}
        <div className="space-y-4">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="h-10 w-3/4 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-1/2 mx-auto rounded-lg" />
        </div>

        {/* Logo Set Selection */}
        <div className="space-y-6">
          <Skeleton className="h-6 w-48 mx-auto rounded-md" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-border space-y-8"
              >
                <Skeleton className="w-12 h-12 rounded-full mx-auto" />
                <Skeleton className="h-5 w-2/3 mx-auto rounded-md" />
                <Skeleton className="h-4 w-1/2 mx-auto rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <Skeleton className="h-12 w-1/2 rounded-2xl" />
          <Skeleton className="h-12 w-1/2 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
