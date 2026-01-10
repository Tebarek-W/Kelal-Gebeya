'use client'

import { useState } from 'react'
import { createProduct } from '../actions'
import MultiImageUpload from '@/components/MultiImageUpload'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
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
            setError(res.error)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/dashboard/products" className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
            </Link>

            <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Add New Product</h1>

            <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                <form action={handleSubmit} className="space-y-6">
                    {/* Use 'images' key for the JSON string */}
                    <input type="hidden" name="images" value={JSON.stringify(images)} />

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product Name</label>
                        <input
                            name="name"
                            required
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                            placeholder="Vintage Denim Jacket"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price ($)</label>
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
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                        >
                            <option value="Clothing">Clothing</option>
                            <option value="Shoes">Shoes</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Home">Home</option>
                            <option value="Art">Art</option>
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
        </div>
    )
}
