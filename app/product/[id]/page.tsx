import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
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
        contact_phone: string | null
        address: string | null
        category: string | null
    } | null
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: product, error } = await supabase
        .from('products')
        .select('*, shops(name, logo_url, contact_phone, address, category)')
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
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{product.price.toFixed(2)} ETB</p>
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
                        <div className="p-6 bg-gray-50 dark:bg-neutral-900 rounded-xl mb-8 border border-gray-100 dark:border-neutral-800">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Seller Information</h3>
                            <div className="flex items-start gap-4">
                                {product.shops?.logo_url ? (
                                    <Link href={`/shop/${product.shop_id}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={product.shops.logo_url} className="w-16 h-16 rounded-full border border-gray-200 object-cover" alt="Shop" />
                                    </Link>
                                ) : (
                                    <Link href={`/shop/${product.shop_id}`}>
                                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-2xl flex-shrink-0">
                                            {product.shops?.name?.[0]}
                                        </div>
                                    </Link>
                                )}
                                <div className="space-y-2 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Link href={`/shop/${product.shop_id}`} className="hover:text-purple-600 transition-colors">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{product.shops?.name}</p>
                                            </Link>
                                            {product.shops?.category && <p className="text-sm text-purple-600 font-medium">{product.shops.category}</p>}
                                        </div>
                                        <div className="flex items-center gap-1 bg-white dark:bg-black px-2 py-1 rounded-full border border-gray-200 dark:border-neutral-800">
                                            <span className="text-yellow-400">★</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">4.8</span>
                                            <span className="text-xs text-gray-500">(124)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 pt-1">
                                        {product.shops?.address && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <span className="w-20 text-xs font-semibold uppercase text-gray-400">Address</span>
                                                <span className="truncate">{product.shops.address}</span>
                                            </div>
                                        )}
                                        {product.shops?.contact_phone && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <span className="w-20 text-xs font-semibold uppercase text-gray-400">Phone</span>
                                                <span>{product.shops.contact_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4 border-gray-200 dark:border-neutral-800" />

                            <div>
                                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">Return & Refund Policy</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    7-day return policy if item is damaged or not as described.
                                    Buyer pays return shipping.
                                </p>
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
