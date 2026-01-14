'use client'

import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { removeItem, updateQuantity, clearCart } from '@/lib/features/cart/cartSlice'
import { Trash2, Plus, Minus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { checkout } from './actions'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function CartPage() {
    const cart = useAppSelector((state) => state.cart.items)
    const dispatch = useAppDispatch()
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

    async function handleCheckout() {
        setIsCheckingOut(true)
        const result = await checkout(cart, paymentMethod)

        if (result.error) {
            toast.error(result.error)
            setIsCheckingOut(false)
            return
        }

        if (result.success) {
            dispatch(clearCart())
            setShowPaymentModal(false)
            toast.success('Order placed successfully! Thank you for your purchase.')
            setIsCheckingOut(false)
        }
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h2>
                <Link href="/" className="text-purple-600 hover:underline">Continue Shopping</Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            {/* Payment Method Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Select Payment Method</h3>

                        <div className="space-y-3 mb-6">
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-neutral-800'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="Cash on Delivery"
                                    checked={paymentMethod === 'Cash on Delivery'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="ml-3 font-medium text-gray-900 dark:text-white">Cash on Delivery</span>
                            </label>

                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'Telebirr' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-neutral-800'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="Telebirr"
                                    checked={paymentMethod === 'Telebirr'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="text-purple-600 focus:ring-purple-500"
                                />
                                <div className="ml-3">
                                    <span className="block font-medium text-gray-900 dark:text-white">Telebirr</span>
                                    <span className="text-xs text-gray-500">Pay securely with mobile money</span>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex justify-center items-center"
                            >
                                {isCheckingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {Object.entries(cart.reduce((groups, item) => {
                        const group = groups[item.shopId] || []
                        group.push(item)
                        groups[item.shopId] = group
                        return groups
                    }, {} as Record<string, typeof cart>)).map(([shopId, items]) => (
                        <div key={shopId} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-neutral-800 pb-2">
                                Vendor Order #{shopId.slice(0, 8)}
                            </h3>
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-6">
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                                        </div>
                                        <div className="flex flex-1 flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                                    <h3>{item.name}</h3>
                                                    <p className="ml-4">{(item.price * item.quantity).toFixed(2)} ETB</p>
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
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order Summary</h2>
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-base font-medium text-gray-900 dark:text-white">Subtotal</p>
                            <p className="text-base font-medium text-gray-900 dark:text-white">{total.toFixed(2)} ETB</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="mt-6 w-full flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-purple-700"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
