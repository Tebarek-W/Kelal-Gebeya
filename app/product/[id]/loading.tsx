export default function ProductLoading() {
  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 dark:bg-neutral-800 rounded-2xl w-full"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 bg-gray-100 dark:bg-neutral-800 rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-4 w-24 bg-purple-100 dark:bg-purple-900/20 rounded"></div>
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-neutral-800 rounded-lg"></div>
              <div className="flex gap-4">
                <div className="h-8 w-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                <div className="h-6 w-24 bg-green-100 dark:bg-green-900/20 rounded-full"></div>
              </div>
            </div>

            {/* Shop Info Skeleton */}
            <div className="p-6 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800">
              <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-800 mb-6 rounded"></div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-800"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 dark:bg-neutral-800/50 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-100 dark:bg-neutral-800/50 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-4 w-full bg-gray-100 dark:bg-neutral-800/50 rounded"></div>
              <div className="h-4 w-full bg-gray-100 dark:bg-neutral-800/50 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-100 dark:bg-neutral-800/50 rounded"></div>
            </div>

            <div className="h-12 w-full bg-purple-100 dark:bg-purple-900/20 rounded-xl mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
