import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'

export default async function Home() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*').limit(20)

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen pb-12">
      <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
        {/* Hero Section */}
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Discover Unique Fashion
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Shop from hundreds of independent creators and vendors.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Featured Products</h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700">
            <p className="text-gray-500">No products found. Be the first to start selling!</p>
          </div>
        )}
      </div>
    </div>
  )
}
