import { PaperCardSkeleton } from './PaperCardSkeleton';

/**
 * Loading skeleton for SearchResults page
 * Grid of paper card skeletons with header
 */
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        {/* Search Bar Skeleton */}
        <div className="h-12 bg-[#e8eaed] rounded-lg mb-4"></div>

        {/* Filter/Sort Bar Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 bg-[#e8eaed] rounded-lg w-32"></div>
          <div className="h-10 bg-[#e8eaed] rounded-lg w-32"></div>
          <div className="h-10 bg-[#e8eaed] rounded-lg w-32"></div>
        </div>
      </div>

      {/* Results Count Skeleton */}
      <div className="animate-pulse">
        <div className="h-4 bg-[#e8eaed] rounded w-1/3"></div>
      </div>

      {/* Grid of Paper Card Skeletons */}
      <div className="grid gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <PaperCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center gap-2 animate-pulse mt-8">
        <div className="h-10 bg-[#e8eaed] rounded w-10"></div>
        <div className="h-10 bg-[#e8eaed] rounded w-10"></div>
        <div className="h-10 bg-[#e8eaed] rounded w-10"></div>
        <div className="h-10 bg-[#e8eaed] rounded w-10"></div>
      </div>
    </div>
  );
}
