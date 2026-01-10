'use client'

import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { ShoppingCart, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
    const { user, role } = useAppSelector((state) => state.auth)
    const cartItems = useAppSelector((state) => state.cart.items)
    const dispatch = useAppDispatch()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <nav className="border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Kelal Gebeya
                    </Link>

                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        {role === 'buyer' && (
                            <Link href="/shop/setup" className="text-sm font-medium hover:text-purple-600 transition-colors">
                                Become a Seller
                            </Link>
                        )}

                        {role === 'vendor' && (
                            <Link href="/dashboard" className="text-sm font-medium hover:text-purple-600 transition-colors">
                                My Shop
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
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium hidden sm:block text-gray-700 dark:text-gray-200">
                                    {user.email}
                                </span>
                                <button onClick={handleLogout} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                                    <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                                </button>
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
