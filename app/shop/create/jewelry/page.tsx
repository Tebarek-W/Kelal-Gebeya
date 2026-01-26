'use client'

import { useState } from 'react'
import { createShop } from '@/app/shop/setup/actions'
import ImageUpload from '@/components/ImageUpload'
import { useAppSelector } from '@/lib/hooks'

export default function JewelryShopPage() {
    const [logoUrl, setLogoUrl] = useState('')
    const [bannerUrl, setBannerUrl] = useState('')
    const [error, setError] = useState('')
    const { user } = useAppSelector(state => state.auth)

    if (!user) {
        return <div className="p-8 text-center animate-in fade-in">Please log in to set up a jewelry shop.</div>
    }

    async function handleSubmit(formData: FormData) {
        if (!logoUrl) {
            setError('Please upload a shop logo')
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
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Setup Your Jewelry Boutique</h1>
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 animate-in slide-in-from-bottom-4 duration-500">
                <form action={handleSubmit} className="space-y-6">
                    <input type="hidden" name="logo_url" value={logoUrl} />
                    <input type="hidden" name="banner_url" value={bannerUrl} />

                    {/* Hardcoded Category */}
                    <input type="hidden" name="category" value="Jewelry" />

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Shop Name</label>
                        <input
                            name="name"
                            required
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="e.g. Royal Gems, Elegant Designs"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="Describe your jewelry collection..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300 italic text-amber-600 dark:text-amber-400">Select Specific Categories (Optional)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['Rings', 'Necklaces', 'Bracelets', 'Watches', 'Traditional Jewelry'].map((cat) => (
                                <label key={cat} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 dark:border-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors cursor-pointer group border-amber-100/50 dark:border-amber-900/20">
                                    <input
                                        type="checkbox"
                                        name="specific_categories"
                                        value={cat}
                                        className="rounded border-gray-300 dark:border-neutral-700 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contact Phone Number</label>
                            <input
                                name="contact_phone"
                                type="tel"
                                required
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                placeholder="+251 9..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Shop Address</label>
                            <input
                                name="address"
                                required
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                placeholder="Addis Ababa, Bole..."
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Category Locked</h3>
                        <p className="text-sm text-amber-600 dark:text-amber-400">Your shop will be listed under <strong>Jewelry</strong>.</p>
                    </div>

                    <ImageUpload onUpload={setLogoUrl} label="Shop Logo (Required)" />
                    <ImageUpload onUpload={setBannerUrl} label="Shop Banner (Optional)" />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 font-medium transition-colors shadow-sm">
                        Launch Jewelry Shop
                    </button>
                </form>
            </div>
        </div>
    )
}
