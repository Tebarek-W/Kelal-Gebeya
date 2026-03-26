export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-800 rounded-lg"></div>
          <div className="h-4 w-32 bg-gray-100 dark:bg-neutral-800/50 rounded-md"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800"></div>
          <div className="h-4 w-24 bg-gray-100 dark:bg-neutral-800/50 rounded-md"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-lg"></div>
              <div className="w-12 h-4 bg-gray-50 dark:bg-neutral-800 rounded-full"></div>
            </div>
            <div className="h-4 w-20 bg-gray-100 dark:bg-neutral-800 mb-2 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800"></div>
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
          <div className="h-6 w-32 bg-gray-200 dark:bg-neutral-800 mb-6 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between px-2 py-3 rounded-lg border border-transparent">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-3 w-20 bg-gray-100 dark:bg-neutral-800/50 rounded"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-3 w-16 bg-gray-100 dark:bg-neutral-800/50 rounded-full ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
