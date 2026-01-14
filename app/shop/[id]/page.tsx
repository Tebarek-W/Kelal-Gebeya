import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { notFound } from 'next/navigation'

export default async function ShopPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch shop details
    const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single()

    if (!shop) {
        notFound()
    }

    // Fetch products for this shop
    const { data: products } = await supabase
        .from('products')
        .select('*, shops(name)')
        .eq('shop_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen pb-12">
            {/* Shop Header */}
            <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {shop.logo_url ? (
                            <img
                                src={shop.logo_url}
                                alt={shop.name}
                                className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-neutral-800 shadow-xl"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white dark:border-neutral-800 shadow-xl">
                                {shop.name[0]}
                            </div>
                        )}
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">{shop.name}</h1>
                            {shop.category && (
                                <p className="mt-2 text-purple-600 dark:text-purple-400 font-medium">{shop.category}</p>
                            )}
                            {shop.description && (
                                <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">{shop.description}</p>
                            )}
                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                                {shop.address && (
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-gray-900 dark:text-gray-300">Location:</span>
                                        <span>{shop.address}</span>
                                    </div>
                                )}
                                {shop.contact_phone && (
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-gray-900 dark:text-gray-300">Contact:</span>
                                        <span>{shop.contact_phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Products */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Products</h2>
                    <span className="text-sm text-gray-500">{products?.length || 0} Products Found</span>
                </div>

                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                        <p className="text-gray-500">This store hasn't posted any products yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
