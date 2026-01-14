'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react'

export default function ProductFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [keyword, setKeyword] = useState(searchParams.get('q') || '')
    const [category, setCategory] = useState(searchParams.get('category') || '')
    const [minPrice, setMinPrice] = useState(searchParams.get('min') || '')
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '')
    const [isOpen, setIsOpen] = useState(false)

    // Debounced search logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (keyword !== (searchParams.get('q') || '')) {
                applyFilters()
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [keyword])

    // Apply all filters real-time
    useEffect(() => {
        if (
            category !== (searchParams.get('category') || '') ||
            minPrice !== (searchParams.get('min') || '') ||
            maxPrice !== (searchParams.get('max') || '')
        ) {
            applyFilters()
        }
    }, [category, minPrice, maxPrice])

    const applyFilters = () => {
        const params = new URLSearchParams()
        if (keyword) params.set('q', keyword)
        if (category) params.set('category', category)
        if (minPrice) params.set('min', minPrice)
        if (maxPrice) params.set('max', maxPrice)

        const query = params.toString() ? `?${params.toString()}` : '/'

        startTransition(() => {
            router.push(query, { scroll: false })
        })
    }

    const clearFilters = () => {
        setKeyword('')
        setCategory('')
        setMinPrice('')
        setMaxPrice('')
        router.push('/')
        setIsOpen(false)
    }

    const categories = [
        'Traditional Clothing',
        'Modern Fashion',
        'Kids & Infants',
        'Shoes'
    ]

    return (
        <div className="mb-8">
            {/* Mobile/Desktop Search Bar */}
            <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Search products as you type..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${isOpen || category || minPrice || maxPrice
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                        }`}
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">Filters</span>
                </button>
            </div>

            {/* Expanded Filters */}
            {(isOpen || category || minPrice || maxPrice) && (
                <div className={`p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl transition-all duration-300 ${!isOpen ? 'hidden' : 'block'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white">Refine Search</h3>
                        <button onClick={clearFilters} className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                            <X className="w-3 h-3" />
                            Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all font-medium"
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Price From (ETB)
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Price To (ETB)
                            </label>
                            <input
                                type="number"
                                placeholder="Any"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

