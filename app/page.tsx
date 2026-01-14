import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import ProductFilters from '@/components/ProductFilters'
import Link from 'next/link'
import { ShoppingBag, ChevronRight, Search } from 'lucide-react'

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient()
  const params = await searchParams

  const q = typeof params.q === 'string' ? params.q : ''
  const category = typeof params.category === 'string' ? params.category : ''
  const min = typeof params.min === 'string' ? params.min : ''
  const max = typeof params.max === 'string' ? params.max : ''

  // Fetch products with filters
  let productQuery = supabase.from('products').select('*, shops(name)')
  if (q) productQuery = productQuery.ilike('name', `%${q}%`)
  if (category) productQuery = productQuery.eq('category', category)
  if (min) productQuery = productQuery.gte('price', parseFloat(min))
  if (max) productQuery = productQuery.lte('price', parseFloat(max))
  const { data: products } = await productQuery.order('created_at', { ascending: false }).limit(20)

  const categories = [
    { name: 'Traditional Clothing', count: '120+ Items' },
    { name: 'Modern Fashion', count: '450+ Items' },
    { name: 'Kids & Infants', count: '80+ Items' },
    { name: 'Shoes', count: '200+ Items' },
  ]

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      {/* 1. Minimalist Hero */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
            Ethiopia's curated <br />
            <span className="text-neutral-500">fashion marketplace.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-500 dark:text-neutral-400 font-medium">
            Discover authentic traditional wear and modern design from local independent creators.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <Link
              href="#catalog"
              className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white border-b-2 border-black dark:border-white pb-1 hover:text-neutral-500 hover:border-neutral-500 transition-all"
            >
              Browse Catalog
            </Link>
            <Link
              href="/shop/setup"
              className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Simple Category Navigation */}
      <section className="py-12 border-y border-neutral-100 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/?category=${cat.name}`}
                className={`p-6 rounded-2xl transition-all ${category === cat.name
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                  : 'bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
              >
                <h3 className="font-bold text-sm tracking-wide uppercase">{cat.name}</h3>
                <p className={`text-[10px] mt-1 uppercase tracking-widest ${category === cat.name ? 'opacity-60' : 'text-neutral-400'}`}>
                  {cat.count}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Main Catalog Section */}
      <section id="catalog" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-2">Collection</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {q ? `Search: ${q}` : category || 'All Products'}
              </h2>
            </div>
            <div className="flex-1 max-w-xs w-full">
              <ProductFilters />
            </div>
          </div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
            <ShoppingBag className="w-8 h-8 mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500 font-medium">No results found.</p>
            <Link href="/" className="mt-4 text-xs font-bold uppercase tracking-widest hover:text-neutral-900 dark:hover:text-white">Reset Filters</Link>
          </div>
        )}
      </section>

      {/* 4. Minimalist Trust Phrase */}
      <section className="py-32 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white italic leading-relaxed">
            "We believe in fashion that tells a story, connecting Ethiopia's heritage with the modern world through the hands of independent creators."
          </h2>
          <div className="mt-12 flex items-center justify-center gap-8 grayscale opacity-40">
            <span className="font-bold tracking-tighter text-2xl italic">EST. 2026</span>
            <div className="w-1 h-1 bg-neutral-300 rounded-full" />
            <span className="font-bold tracking-widest text-xs uppercase">ADDIS ABABA</span>
          </div>
        </div>
      </section>
    </div>
  )
}
