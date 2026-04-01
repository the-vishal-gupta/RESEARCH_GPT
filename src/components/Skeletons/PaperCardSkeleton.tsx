/**
 * Loading skeleton for PaperCard component
 * Animated placeholder matching PaperCard dimensions
 */
export function PaperCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 h-full animate-pulse">
      {/* Title Skeleton */}
      <div className="mb-3">
        <div className="h-5 bg-[#e8eaed] rounded w-4/5 mb-2"></div>
        <div className="h-5 bg-[#e8eaed] rounded w-3/5"></div>
      </div>

      {/* Authors Skeleton */}
      <div className="mb-3">
        <div className="h-4 bg-[#e8eaed] rounded w-2/3"></div>
      </div>

      {/* Publication Info Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-3 bg-[#e8eaed] rounded w-1/3"></div>
        <div className="h-3 bg-[#e8eaed] rounded w-1/4"></div>
      </div>

      {/* Abstract Skeleton */}
      <div className="mb-4">
        <div className="h-3 bg-[#e8eaed] rounded w-full mb-2"></div>
        <div className="h-3 bg-[#e8eaed] rounded w-full mb-2"></div>
        <div className="h-3 bg-[#e8eaed] rounded w-3/4"></div>
      </div>

      {/* Citation Count Skeleton */}
      <div className="mb-4">
        <div className="h-3 bg-[#e8eaed] rounded w-1/2"></div>
      </div>

      {/* Buttons Skeleton */}
      <div className="flex gap-2">
        <div className="h-9 bg-[#e8eaed] rounded flex-1"></div>
        <div className="h-9 bg-[#e8eaed] rounded flex-1"></div>
        <div className="h-9 bg-[#e8eaed] rounded w-10"></div>
      </div>
    </div>
  );
}
