export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse pb-16">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-800/60" />
        <div className="h-4 w-96 rounded bg-gray-200 dark:bg-gray-800/60" />
      </div>

      <div className="h-12 w-full max-w-md rounded-2xl bg-gray-200 dark:bg-gray-800/60" />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-800/60 shrink-0" />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[2/3] w-full rounded-xl bg-gray-200 dark:bg-gray-800/60" />
            <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-800/60" />
            <div className="h-2.5 w-1/2 rounded bg-gray-200 dark:bg-gray-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
