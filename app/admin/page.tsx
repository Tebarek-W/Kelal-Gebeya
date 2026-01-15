import { createClient } from '@/lib/supabase/server'
import { Users, Store, Clock, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react'

// Helper for cards
function StatCard({ title, value, icon: Icon, colorClass }: { title: string, value: number, icon: any, colorClass: string }) {
    return (
        <div className="relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl transition-transform hover:scale-[1.02]">
            <div className={`absolute -right-4 -top-4 opacity-5 ${colorClass}`}>
                <Icon className="h-32 w-32" />
            </div>
            <div className="flex items-center">
                <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 mr-4`}>
                    <Icon className={`h-6 w-6 ${colorClass}`} />
                </div>
                <div>
                    <dt className="truncate text-sm font-medium text-zinc-400">{title}</dt>
                    <dd className="mt-1 text-3xl font-bold text-white tracking-tight">{value}</dd>
                </div>
            </div>
        </div>
    )
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Execute queries in parallel
    const [
        { count: totalUsers },
        { count: totalShops },
        { count: pendingShops },
        { count: verifiedShops },
        { count: suspendedShops },
        { count: approvedShops }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('shops').select('*', { count: 'exact', head: true }),
        supabase.from('shops').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('shops').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('shops').select('*', { count: 'exact', head: true }).eq('status', 'suspended'),
        supabase.from('shops').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    ])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                        Dashboard
                    </h2>
                    <p className="mt-1 text-zinc-400">Real-time platform overview and metrics.</p>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Users" value={totalUsers || 0} icon={Users} colorClass="text-blue-500" />
                <StatCard title="Total Shops" value={totalShops || 0} icon={Store} colorClass="text-purple-500" />
                <StatCard title="Verified Shops" value={verifiedShops || 0} icon={CheckCircle} colorClass="text-emerald-500" />
            </div>

            <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-white border-l-4 border-yellow-500 pl-4">Shop Status</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard title="Pending Review" value={pendingShops || 0} icon={Clock} colorClass="text-yellow-500" />
                    <StatCard title="Active Vendors" value={approvedShops || 0} icon={PlayCircle} colorClass="text-green-400" />
                    <StatCard title="Suspended" value={suspendedShops || 0} icon={AlertTriangle} colorClass="text-red-500" />
                </div>
            </div>
        </div>
    )
}
