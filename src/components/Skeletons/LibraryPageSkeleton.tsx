import { PaperCardSkeleton } from './PaperCardSkeleton';

/**
 * Loading skeleton for Library page
 * Shows header skeleton with search/filter/export buttons
 * and grid of paper card skeletons
 */
export function LibraryPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        {/* Title Skeleton */}
        <div className="h-8 bg-[#e8eaed] rounded w-1/3 mb-6"></div>

        {/* Search Bar Skeleton */}
        <div className="h-12 bg-[#e8eaed] rounded-lg mb-4"></div>

        {/* Buttons Bar Skeleton */}
        <div className="flex gap-2 flex-wrap">
          <div className="h-10 bg-[#e8eaed] rounded-lg w-32"></div>
          <div className="h-10 bg-[#e8eaed] rounded-lg w-32"></div>
          <div className="h-10 bg-[#e8eaed] rounded-lg w-32"></div>
          <div className="h-10 bg-[#e8eaed] rounded-lg w-32"></div>
        </div>
      </div>

      {/* Library Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#e8eaed] rounded-lg p-4 h-20"></div>
        ))}
      </div>

      {/* Filter/Sort Controls Skeleton */}
      <div className="flex gap-2 animate-pulse">
        <div className="h-10 bg-[#e8eaed] rounded-lg w-32"></div>
        <div className="h-10 bg-[#e8eaed] rounded-lg w-32"></div>
      </div>

      {/* Grid of Paper Card Skeletons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <PaperCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center gap-2 animate-pulse mt-8">
        <div className="h-10 bg-[#e8eaed] rounded w-10"></div>
        <div className="h-10 bg-[#e8eaed] rounded w-10"></div>
        <div className="h-10 bg-[#e8eaed] rounded w-10"></div>
      </div>
    </div>
  );
}
