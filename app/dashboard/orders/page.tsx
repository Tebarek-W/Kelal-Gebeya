'use client'

import { useEffect, useState } from 'react'
import { getVendorOrders, updateOrderStatus } from './actions'
import { Package, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

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
    profiles: {
        full_name: string
    } | null
    order_items: OrderItem[]
}

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        setLoading(true)
        const result = await getVendorOrders()
        if (result.error) {
            toast.error(result.error)
        } else {
            setOrders(result.orders as Order[])
        }
        setLoading(false)
    }

    async function handleStatusChange(orderId: string, newStatus: 'pending' | 'processing' | 'completed') {
        setUpdatingId(orderId)
        const result = await updateOrderStatus(orderId, newStatus)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Order status updated!')
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ))
        }
        setUpdatingId(null)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="w-3 h-3" /> Pending</span>
            case 'processing':
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><Package className="w-3 h-3" /> Processing</span>
            case 'completed':
                return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="w-3 h-3" /> Completed</span>
            default:
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
                <span className="text-sm text-gray-500">{orders.length} total orders</span>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
                    <p className="text-gray-500">When customers place orders, they will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
                            {/* Order Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-mono text-sm text-gray-900 dark:text-white">{order.id.slice(0, 8)}...</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{order.profiles?.full_name || 'Guest'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{order.payment_method || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="font-bold text-lg text-gray-900 dark:text-white">{order.total_price.toFixed(2)} ETB</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Status</p>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6 bg-gray-50 dark:bg-neutral-950">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Items</h4>
                                <div className="space-y-3">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                                                {item.products?.images?.[0] ? (
                                                    <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">{item.products?.name || 'Unknown Product'}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity} × {item.price.toFixed(2)} ETB</p>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">{(item.quantity * item.price).toFixed(2)} ETB</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-gray-100 dark:border-neutral-800 flex gap-2">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value as 'pending' | 'processing' | 'completed')}
                                    disabled={updatingId === order.id}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                </select>
                                {updatingId === order.id && <Loader2 className="w-5 h-5 animate-spin text-purple-600" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
