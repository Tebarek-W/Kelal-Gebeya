import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditProductForm from './EditProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ShopCategory } from '@/lib/categories'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: product } = await supabase
        .from('products')
        .select(`
            *, 
            shops (
                owner_id,
                category
            )
        `)
        .eq('id', id)
        .single()

    if (!product) {
        notFound()
    }

    const shop = product.shops as any
    // Check ownership
    if (shop.owner_id !== user.id) {
        redirect('/dashboard/products')
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/dashboard/products" className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
            </Link>

            <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Edit Product</h1>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Editing product in your <strong className="text-purple-600 dark:text-purple-400">{shop.category}</strong> shop.
            </p>

            <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                <EditProductForm product={product} shopCategory={shop.category as ShopCategory} />
            </div>
        </div>
    )
}
