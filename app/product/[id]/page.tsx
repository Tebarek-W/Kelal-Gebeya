import { createClient } from '@/lib/supabase/server'
import ProductGallery from '@/components/ProductGallery'
import ProductActions from '@/components/ProductActions'

interface Product {
    id: string
    shop_id: string
    name: string
    price: number
    images: string[]
    stock: number
    category: string
    description?: string
    shops?: {
        name: string
        logo_url: string | null
    } | null
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: product, error } = await supabase
        .from('products')
        .select('*, shops(name, logo_url)')
        .eq('id', id)
        .single()

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-500">Product not found</h1>
            </div>
        )
    }

    const images = product.images || []

    return (
        <div className="bg-white dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                    {/* Image Gallery Section */}
                    <div>
                        <ProductGallery images={images} productName={product.name} />
                    </div>

                    {/* Product Info Section */}
                    <div>
                        <div className="mb-6">
                            <h2 className="text-sm font-medium text-purple-600 tracking-wide uppercase">{product.category || 'Apparel'}</h2>
                            <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">{product.name}</h1>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
                            {product.stock > 0 ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    In Stock ({product.stock})
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Shop Info */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-neutral-900 rounded-xl mb-8">
                            {product.shops?.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.shops.logo_url} className="w-12 h-12 rounded-full border border-gray-200" alt="Shop" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl">
                                    {product.shops?.name?.[0]}
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500">Sold by</p>
                                <p className="font-bold text-gray-900 dark:text-white">{product.shops?.name}</p>
                            </div>
                        </div>

                        <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300">
                            <p>{product.description || "No description available for this product."}</p>
                        </div>

                        <ProductActions product={product} />
                    </div>
                </div>
            </div>
        </div>
    )
}
