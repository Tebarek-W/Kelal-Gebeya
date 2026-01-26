'use client'

import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { ShoppingCart, LogOut, User, Search, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'
import { setUser } from '@/lib/features/auth/authSlice'
import { toast } from 'react-toastify'
import { logout } from '@/app/auth/actions'

interface SearchResult {
    id: string
    name: string
    price: number
    images: string[]
}

export default function Navbar() {
    const { user, role } = useAppSelector((state) => state.auth)
    const cartItems = useAppSelector((state) => state.cart.items)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const supabase = createClient()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement>(null)

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    const handleLogout = async () => {
        setShowProfileMenu(false)
        try {
            // Clear client-side state first
            dispatch(setUser({ user: null, role: null }))

            // Call server action to clear cookies
            const result = await logout()
            if (result?.success) {
                toast.success('Logged out successfully')
                router.push('/')
                router.refresh()
            } else if (result?.error) {
                toast.error(result.error)
            }
        } catch (error) {
            console.error('Logout failed:', error)
            toast.error('Failed to logout. Please try again.')
        }
    }

    // Search products
    const searchProducts = useCallback(async (query: string) => {
        if (query.length < 1) {
            setSearchResults([])
            setShowSearchResults(false)
            return
        }

        setIsSearching(true)
        const { data, error } = await supabase
            .from('products')
            .select('id, name, price, images')
            .ilike('name', `%${query}%`)
            .limit(6)

        if (error) {
            console.error('Search error:', error)
        } else {
            setSearchResults(data || [])
            setShowSearchResults(true)
        }
        setIsSearching(false)
    }, [supabase])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(searchQuery)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, searchProducts])

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false)
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleProductClick = (productId: string) => {
        setShowSearchResults(false)
        setSearchQuery('')
        router.push(`/product/${productId}`)
    }

    return (
        <nav className="border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Kelal Gebeya
                    </Link>

                    {/* Search */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative" ref={searchRef}>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                                className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 overflow-hidden z-50">
                                {searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No products found for "{searchQuery}"
                                    </div>
                                ) : (
                                    <div>
                                        {searchResults.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left"
                                            >
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Search className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                                                    <p className="text-sm text-purple-600 font-semibold">{product.price.toFixed(2)} ETB</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {role === 'buyer' && (
                            <Link href="/shop/create" className="text-sm font-medium hover:text-purple-600 transition-colors">
                                Become a Seller
                            </Link>
                        )}

                        {role === 'vendor' && (
                            <Link href="/dashboard" className="text-sm font-medium hover:text-purple-600 transition-colors">
                                My Shop
                            </Link>
                        )}

                        {role === 'admin' && (
                            <Link href="/admin" className="text-sm font-medium hover:text-purple-600 transition-colors">
                                Admin Panel
                            </Link>
                        )}

                        {user && (
                            <Link href="/orders" className="text-sm font-medium hover:text-purple-600 transition-colors">
                                My Orders
                            </Link>
                        )}

                        <Link href="/cart" className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                            <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                            {cartItems.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                                >
                                    <User className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800 overflow-hidden z-50">
                                        <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                                        </div>
                                        <div className="p-2 border-b border-gray-100 dark:border-neutral-800">
                                            {role === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setShowProfileMenu(false)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-gray-700 dark:text-gray-200">Log in</Link>
                                <Link href="/register" className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-md shadow-sm transition-all hover:shadow-md">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
