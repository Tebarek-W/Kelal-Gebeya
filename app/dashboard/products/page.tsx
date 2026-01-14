import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Trash2, Edit } from 'lucide-react'
import Image from 'next/image'
import { deleteProduct } from './actions'

export default async function ProductsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get User's Shop ID first
    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user?.id)
        .single()

    if (!shop) {
        return <div className="text-center py-10">You don't have a shop yet.</div>
    }

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Products</h1>
                <Link
                    href="/dashboard/products/new"
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors shadow-sm text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </Link>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
                {!products || products.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No products found. Add your first product to start selling!
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-neutral-700">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                            {products.map((product) => (
                                <tr key={product.id} className="group hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                                                {product.images?.[0] && (
                                                    <Image src={product.images[0]} alt="" fill className="object-cover" />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{product.price.toFixed(2)} ETB</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : product.stock > 0
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {product.stock} in stock
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{product.category}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/dashboard/products/${product.id}`}
                                                className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <form action={deleteProduct.bind(null, product.id)} className="inline-block">
                                                <button className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
