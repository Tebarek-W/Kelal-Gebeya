'use client'

import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { removeItem, updateQuantity } from '@/lib/features/cart/cartSlice'
import { Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
    const cart = useAppSelector((state) => state.cart.items)
    const dispatch = useAppDispatch()

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h2>
                <Link href="/" className="text-purple-600 hover:underline">Continue Shopping</Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {cart.map((item) => (
                        <div key={item.id} className="flex gap-6 p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                            </div>
                            <div className="flex flex-1 flex-col">
                                <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                        <h3>{item.name}</h3>
                                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{item.quantity}</span>
                                        <button
                                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => dispatch(removeItem(item.id))}
                                        type="button"
                                        className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-4 h-4" /> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order Summary</h2>
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-base font-medium text-gray-900 dark:text-white">Subtotal</p>
                            <p className="text-base font-medium text-gray-900 dark:text-white">${total.toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                        <button className="mt-6 w-full flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-purple-700">
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
