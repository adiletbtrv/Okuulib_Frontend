export default function BookDetailsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-800/60" />

      {/* Book Card Skeleton */}
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 sm:p-8 flex flex-col md:flex-row gap-8">
        <div className="aspect-[2/3] w-full md:w-56 rounded-2xl bg-gray-200 dark:bg-gray-800/60 shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800/60" />
          <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800/60" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800/60" />
            <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-800/60" />
            <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-800/60" />
          </div>
          <div className="flex gap-4 pt-6">
            <div className="h-12 w-40 rounded-2xl bg-gray-200 dark:bg-gray-800/60" />
            <div className="h-12 w-40 rounded-2xl bg-gray-200 dark:bg-gray-800/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
