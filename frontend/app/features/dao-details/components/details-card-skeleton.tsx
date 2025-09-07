import { Skeleton } from '@/shared/components/ui/skeleton';

export default function DetailsCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-16 w-56 rounded-2xl" />
        <div className="flex gap-4 lg:gap-6">
          <Skeleton className="h-10 w-56 rounded-2xl" />
          <Skeleton className="h-10 w-56 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
