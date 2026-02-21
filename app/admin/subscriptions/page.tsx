import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard, PowerOff, Plus } from 'lucide-react'
import { extendSubscription, deactivateSubscription } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Role check is largely in layout but always good to fetch for UI safety
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/')

    // Fetch all shops and their subscriptions
    const { data: shops } = await supabase
        .from('shops')
        .select(`
            id,
            name,
            owner_id,
            profiles ( full_name ),
            vendor_subscriptions ( expires_at, tier ),
            subscription_payments ( amount )
        `)
        .order('created_at', { ascending: false })

    if (!shops) return <div>No shops found</div>

    const now = new Date()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6" /> Vendor Subscriptions
                    </h1>
                    <p className="text-zinc-400 mt-1">Manage active selling privileges for all vendors.</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-300">
                        <tr>
                            <th className="px-6 py-4 font-medium">Shop / Owner</th>
                            <th className="px-6 py-4 font-medium">Status / Expiry</th>
                            <th className="px-6 py-4 font-medium">LTV Revenue</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {shops.map((shop: any) => {
                            const sub = shop.vendor_subscriptions?.[0] || shop.vendor_subscriptions || null
                            const payments = shop.subscription_payments || []
                            // If relationship returned array due to 1:M nature
                            const activeSub = Array.isArray(sub) ? sub[0] : sub

                            const totalRev = Array.isArray(payments) 
                                ? payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0)
                                : Number(payments.amount || 0)
                            
                            let isActive = false
                            let daysLeft = 0
                            
                            if (activeSub && activeSub.expires_at) {
                                const expiry = new Date(activeSub.expires_at)
                                isActive = expiry > now
                                if (isActive) {
                                    daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                }
                            }

                            return (
                                <tr key={shop.id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{shop.name}</div>
                                        <div className="text-xs text-zinc-500">{shop.profiles?.full_name || 'Unknown'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className={isActive ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                                {isActive ? 'Active' : 'Expired'}
                                            </span>
                                        </div>
                                        {isActive && activeSub?.expires_at && (
                                            <div className="text-xs text-zinc-500 mt-1">
                                                {daysLeft} days left (Ends {new Date(activeSub.expires_at).toLocaleDateString()})
                                            </div>
                                        )}
                                        {!isActive && (
                                             <div className="text-xs text-zinc-500 mt-1">
                                                Locked / Missing
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-zinc-300">
                                        {totalRev.toFixed(2)} ETB
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={extendSubscription.bind(null, shop.id, 30)}>
                                                <button type="submit" className="p-2 text-zinc-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors" title="Add 30 Days (Manual)">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </form>
                                            <form action={deactivateSubscription.bind(null, shop.id)}>
                                                <button type="submit" className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Force Deactivate">
                                                    <PowerOff className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
