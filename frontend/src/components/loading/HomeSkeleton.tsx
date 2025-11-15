export default function HomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-4 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
