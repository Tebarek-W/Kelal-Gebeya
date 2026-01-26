'use client'

import { useState } from 'react'
import { createProduct } from '../actions'
import MultiImageUpload from '@/components/MultiImageUpload'
import { PRODUCT_CATEGORIES, ShopCategory } from '@/lib/categories'

export default function NewProductForm({ shopCategory }: { shopCategory: ShopCategory }) {
    const [images, setImages] = useState<string[]>([])
    const [error, setError] = useState('')

    async function handleSubmit(formData: FormData) {
        if (images.length === 0) {
            setError('Please upload at least one product image')
            return
        }
        setError('')

        // Append actual images array data
        formData.set('images', JSON.stringify(images))

        const res = await createProduct(formData)
        if (res?.error) {
            if (res.error.includes("Vendors can insert products to own APPROVED shop")) {
                setError("You cannot upload products because your shop is not approved or is suspended.")
            } else {
                setError(res.error)
            }
        }
    }

    const categories = PRODUCT_CATEGORIES[shopCategory] || []

    return (
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
            <form action={handleSubmit} className="space-y-6">
                <input type="hidden" name="images" value={JSON.stringify(images)} />

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product Name</label>
                    <input
                        name="name"
                        required
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                        placeholder="e.g. Traditional Dress, Modern Laptop"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price (ETB)</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            required
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                            placeholder="49.99"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Stock Quantity</label>
                        <input
                            name="stock"
                            type="number"
                            required
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                            placeholder="100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                    <select
                        name="category"
                        required
                        defaultValue=""
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white dark:bg-neutral-800"
                    >
                        <option value="" disabled>Select a sub-category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                        placeholder="Product details..."
                    />
                </div>

                <MultiImageUpload onUpload={setImages} label="Product Images" maxFiles={3} />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-medium transition-colors shadow-sm">
                    Create Product
                </button>
            </form>
        </div>
    )
}
