'use client'

import { useEffect, useState } from 'react'
import { getBuyerOrders } from './actions'
import { Package, Clock, CheckCircle, Loader2, ShoppingBag } from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'

interface OrderItem {
    id: string
    quantity: number
    price: number
    products: {
        name: string
        images: string[]
    } | null
}

interface Order {
    id: string
    total_price: number
    status: 'pending' | 'processing' | 'completed'
    payment_method: string | null
    created_at: string
    shops: {
        name: string
        logo_url: string | null
    } | null
    order_items: OrderItem[]
}

export default function BuyerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        setLoading(true)
        const result = await getBuyerOrders()
        if (result.error) {
            toast.error(result.error)
        } else {
            setOrders(result.orders as Order[])
        }
        setLoading(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="w-3 h-3" /> Pending</span>
            case 'processing':
                return <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><Package className="w-3 h-3" /> Processing</span>
            case 'completed':
                return <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="w-3 h-3" /> Completed</span>
            default:
                return <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800">
                    <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                    <Link href="/" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium transition-colors">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
                            {/* Order Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {order.shops?.logo_url ? (
                                            <img src={order.shops.logo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                                                {order.shops?.name?.[0] || '?'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{order.shops?.name || 'Unknown Shop'}</p>
                                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(order.status)}
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{order.total_price.toFixed(2)} ETB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0">
                                                {item.products?.images?.[0] ? (
                                                    <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">{item.products?.name || 'Unknown Product'}</p>
                                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">{(item.quantity * item.price).toFixed(2)} ETB</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-950 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Payment: <span className="font-medium text-gray-700 dark:text-gray-300">{order.payment_method || 'N/A'}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Order ID: <span className="font-mono">{order.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
