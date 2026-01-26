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
    { name: 'Fashion', count: '500+ Items', description: 'Clothing & Shoes' },
    { name: 'Electronics', count: '200+ Items', description: 'Gadgets & Core Tech' },
    { name: 'Jewelry', count: '150+ Items', description: 'Gems & Watches' },
    { name: 'Handmade Crafts', count: '300+ Items', description: 'Art & Heritage' },
  ]

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      {/* 1. Enhanced Lifestyle Hero */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left z-10">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-8">
              Discover Ethiopian <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">craftsmanship & innovation</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-neutral-400 font-medium mb-12 max-w-xl leading-relaxed">
              From traditional fashion to modern electronics and unique handmade gems—all from trusted local vendors.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="#catalog"
                className="px-8 py-4 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 hover:scale-105 active:scale-95 text-lg"
              >
                Start Exploring
              </Link>
              <Link
                href="/shop/create"
                className="px-8 py-4 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white font-bold rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95 text-lg"
              >
                Open Your Shop
              </Link>
            </div>
          </div>

          <div className="relative group lg:block">
            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/5] lg:aspect-square">
              <img
                src="/hero.png"
                alt="Ethiopian Marketplace Lifestyle"
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
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
                  {cat.description} • {cat.count}
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-2">Marketplace</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {q ? `Search: ${q}` : category || 'Recent Products'}
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
            "Connecting Ethiopia's rich heritage with modern innovation through one trusted, community-driven marketplace."
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

