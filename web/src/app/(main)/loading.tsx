export default function MainLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-10 animate-pulse pb-16">
      {/* Hero Banner Skeleton */}
      <div className="h-64 sm:h-72 w-full rounded-3xl bg-gray-200 dark:bg-gray-800/60" />

      {/* Book Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 rounded-lg bg-gray-200 dark:bg-gray-800/60" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] w-full rounded-xl bg-gray-200 dark:bg-gray-800/60" />
              <div className="h-3 w-3/4 rounded-md bg-gray-200 dark:bg-gray-800/60" />
              <div className="h-2.5 w-1/2 rounded-md bg-gray-200 dark:bg-gray-800/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
