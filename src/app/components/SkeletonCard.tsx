export function SkeletonCard() {
  return (
    <div className="bg-white border text-left border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="p-3">
        {/* Header row skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gray-200" />
          <div className="h-3 w-24 bg-gray-200 rounded-full" />
          <div className="h-3 w-16 bg-gray-200 rounded-full" />
        </div>
        
        {/* Title skeleton */}
        <div className="h-5 w-3/4 bg-gray-200 rounded-full mb-2" />
        <div className="h-5 w-1/2 bg-gray-200 rounded-full mb-4" />
        
        {/* Content line preview */}
        <div className="h-3 w-full bg-gray-100 rounded-full mb-1.5" />
        <div className="h-3 w-5/6 bg-gray-100 rounded-full mb-3" />
        
        {/* Actions bar skeleton */}
        <div className="flex gap-3 mt-4">
          <div className="h-6 w-16 bg-gray-200 rounded-lg" />
          <div className="h-6 w-16 bg-gray-200 rounded-lg" />
          <div className="h-6 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
