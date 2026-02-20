'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { PRODUCT_CATEGORIES } from '@/lib/categories'

export default function ProductFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Local state for the search input to keep typing smooth
    const [keyword, setKeyword] = useState(searchParams.get('q') || '')
    const [isOpen, setIsOpen] = useState(false)

    // Source of truth for other filters are the URL params
    const category = searchParams.get('category') || ''
    const minPrice = searchParams.get('min') || ''
    const maxPrice = searchParams.get('max') || ''
    const sort = searchParams.get('sort') || 'newest'

    // Update local keyword state only when URL changes from external source (e.g. Hero click or Reset)
    useEffect(() => {
        const urlQ = searchParams.get('q') || ''
        if (urlQ !== keyword) {
            setKeyword(urlQ)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    const applyFilters = useCallback((newFilters: { q?: string; category?: string; sort?: string; min?: string; max?: string; reset?: boolean }) => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (newFilters.reset) {
            router.push('/')
            return
        }

        // Apply keyword if provided or existing
        const q = newFilters.q !== undefined ? newFilters.q : keyword
        if (q) params.set('q', q)
        else params.delete('q')

        // Apply other filters
        if (newFilters.category !== undefined) {
            if (newFilters.category) params.set('category', newFilters.category)
            else params.delete('category')
        }

        if (newFilters.min !== undefined) {
            if (newFilters.min) params.set('min', newFilters.min)
            else params.delete('min')
        }

        if (newFilters.max !== undefined) {
            if (newFilters.max) params.set('max', newFilters.max)
            else params.delete('max')
        }

        if (newFilters.sort !== undefined) {
            if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort)
            else params.delete('sort')
        }

        const query = params.toString() ? `/?${params.toString()}` : '/'

        startTransition(() => {
            router.push(query, { scroll: false })
        })
    }, [searchParams, keyword, router])

    // Debounced search logic for keyword
    useEffect(() => {
        const timer = setTimeout(() => {
            if (keyword !== (searchParams.get('q') || '')) {
                applyFilters({ q: keyword })
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [keyword, applyFilters, searchParams])

    const clearFilters = () => {
        setKeyword('')
        applyFilters({ reset: true })
        setIsOpen(false)
    }

    return (
        <div className="mb-8">
            {/* Main Search & Tool Bar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
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
                        placeholder="Search products..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 outline-none transition-all shadow-sm"
                    />
                </div>
                
                <div className="flex gap-2">
                    <select
                        value={sort}
                        onChange={(e) => applyFilters({ sort: e.target.value })}
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 font-medium outline-none focus:ring-2 focus:ring-purple-600 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="oldest">Oldest First</option>
                    </select>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all shadow-sm ${isOpen || category || minPrice || maxPrice
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                            }`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        <span className="font-medium whitespace-nowrap">Filters</span>
                    </button>
                </div>
            </div>

            {/* Expanded Filters */}
            {isOpen && (
                <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xl mt-2 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                            Refine Products
                        </h3>
                        <button onClick={clearFilters} className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                            <X className="w-3 h-3" />
                            Reset All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {/* Hierarchical Category Filter */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => applyFilters({ category: e.target.value })}
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all font-medium appearance-none"
                            >
                                <option value="">All Marketplace</option>
                                {Object.entries(PRODUCT_CATEGORIES).map(([main, subs]) => (
                                    <optgroup key={main} label={main}>
                                        <option value={main}>All {main}</option>
                                        {subs.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                Price Range (ETB)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    defaultValue={minPrice}
                                    onBlur={(e) => applyFilters({ min: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    defaultValue={maxPrice}
                                    onBlur={(e) => applyFilters({ max: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

