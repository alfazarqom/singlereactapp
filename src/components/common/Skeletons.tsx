const Skeleton = ({ className = "" }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg ${className}`} />
);

const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-3">
    <Skeleton className="w-full aspect-square rounded-xl" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

const ProductGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
export { Skeleton, ProductCardSkeleton, ProductGridSkeleton };
