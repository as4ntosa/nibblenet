export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-gray-200" />
      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 bg-gray-200 rounded-full" />
        <div className="h-4 w-full bg-gray-200 rounded-full" />
        <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
        <div className="h-3 w-20 bg-gray-200 rounded-full" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 w-12 bg-gray-200 rounded-full" />
          <div className="h-3 w-14 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
