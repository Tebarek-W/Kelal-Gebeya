'use client'

import { useState } from 'react'
import { createShop } from './actions'
import ImageUpload from '@/components/ImageUpload'
import { useAppSelector } from '@/lib/hooks'

export default function ShopSetupPage() {
    const [logoUrl, setLogoUrl] = useState('')
    const [bannerUrl, setBannerUrl] = useState('')
    const [error, setError] = useState('')
    const { user } = useAppSelector(state => state.auth)

    if (!user) {
        return <div className="p-8 text-center">Please log in to set up a shop.</div>
    }

    async function handleSubmit(formData: FormData) {
        if (!logoUrl) {
            setError('Please upload a logo')
            return
        }

        setError('')
        const res = await createShop(formData)
        if (res?.error) {
            setError(res.error)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Setup Your Shop</h1>
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800">
                <form action={handleSubmit} className="space-y-6">
                    <input type="hidden" name="logo_url" value={logoUrl} />
                    <input type="hidden" name="banner_url" value={bannerUrl} />

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Shop Name</label>
                        <input
                            name="name"
                            required
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="My Awesome Store"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="Tell us about your shop..."
                        />
                    </div>

                    <ImageUpload onUpload={setLogoUrl} label="Shop Logo (Required)" />
                    <ImageUpload onUpload={setBannerUrl} label="Shop Banner (Optional)" />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-medium transition-colors shadow-sm">
                        Create Shop & Start Selling
                    </button>
                </form>
            </div>
        </div>
    )
}
