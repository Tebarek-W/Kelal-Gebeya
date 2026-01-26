import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardChart from './DashboardChart'
import { ShoppingBag, DollarSign, Package, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get User's Shop
    const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!shop) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-full mb-4">
                    <ShoppingBag className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Setup Your Shop</h2>
                <p className="text-gray-500 mb-6 max-w-md">You haven't created a shop yet. Start selling your products today!</p>
                <a href="/shop/create" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Create Shop
                </a>
            </div>
        )
    }

    // Parallel data fetching for analytics
    const [
        { count: productsCount },
        { data: orders },
    ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id),
        supabase.from('orders').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false })
    ])

    const totalOrders = orders?.length || 0
    const totalSales = orders?.reduce((acc, order) => acc + (order.total_price || 0), 0) || 0

    const stats = [
        { label: 'Total Sales', value: `${totalSales.toFixed(2)} ETB`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
        { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { label: 'Products', value: (productsCount || 0).toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back to {shop.name} analytics.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-neutral-800">
                    {shop.logo_url ? (
                        <img src={shop.logo_url} alt={shop.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                            {shop.name[0]}
                        </div>
                    )}
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{shop.name}</span>
                </div>
            </div>

            {/* Status Banners */}
            {shop.status === 'pending' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Shop Under Review</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Your shop is currently pending approval from our administrators. You cannot upload products or receive orders until approved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {shop.status === 'rejected' && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Application Rejected</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Your shop application has been rejected.</p>
                                {shop.admin_notes && <p className="mt-1 font-semibold">Reason: {shop.admin_notes}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {shop.status === 'suspended' && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Shop Suspended</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Your shop has been suspended. Your products are no longer visible, and new orders cannot be placed. Please contact support.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} p-2 rounded-lg`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <span className="flex items-center text-green-500 text-xs font-medium">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +0%
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <DashboardChart orders={orders || []} />
                </div>
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Recent Orders</h3>
                    <div className="space-y-4">
                        {orders && orders.length > 0 ? (
                            orders.slice(0, 5).map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-neutral-700">
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{order.total_price.toFixed(2)} ETB</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 text-sm">No orders yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

