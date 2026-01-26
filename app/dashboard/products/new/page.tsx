import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NewProductForm from './NewProductForm'
import { ShopCategory } from '@/lib/categories'

export default async function NewProductPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get User's Shop Category
    const { data: shop } = await supabase
        .from('shops')
        .select('category')
        .eq('owner_id', user.id)
        .single()

    if (!shop) {
        redirect('/dashboard')
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/dashboard/products" className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
            </Link>

            <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Add New Product</h1>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                You are adding a product to your <strong className="text-purple-600 dark:text-purple-400">{shop.category}</strong> shop.
            </p>

            <NewProductForm shopCategory={shop.category as ShopCategory} />
        </div>
    )
}
