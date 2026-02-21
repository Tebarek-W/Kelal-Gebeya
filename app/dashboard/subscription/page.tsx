import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard, CheckCircle2, AlertCircle, CalendarClock, History } from 'lucide-react'
import { renewSubscription } from './actions'

export default async function SubscriptionPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get Shop, Active Sub, and Payments
    const { data: shop } = await supabase
        .from('shops')
        .select(`
            id,
            vendor_subscriptions(expires_at, tier),
            subscription_payments(amount, payment_reference, created_at, status)
        `)
        .eq('owner_id', user.id)
        .single()

    if (!shop) {
        redirect('/dashboard')
    }

    const { data: setting } = await supabase.from('system_settings').select('value').eq('key', 'vendor_subscription_fee').maybeSingle()
    const amount = setting?.value?.amount || 500

    const sub = shop.vendor_subscriptions?.[0] || shop.vendor_subscriptions || null
    const activeSub = Array.isArray(sub) ? sub[0] : sub

    const payments = Array.isArray(shop.subscription_payments) 
        ? shop.subscription_payments.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) 
        : shop.subscription_payments ? [shop.subscription_payments] : []

    let isExpired = true
    let daysLeft = 0
    let expiryDate = null

    if (activeSub && activeSub.expires_at) {
        expiryDate = new Date(activeSub.expires_at)
        const now = new Date()
        isExpired = expiryDate < now
        if (!isExpired) {
            daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-6 h-6" /> Subscription Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your active selling privileges and billing history.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl border ${isExpired ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        {isExpired ? (
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        ) : (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        )}
                        <div>
                            <h2 className={`text-xl font-bold ${isExpired ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                                {isExpired ? 'Subscription Expired' : 'Active Subscription'}
                            </h2>
                            {!isExpired && <p className="text-sm text-green-600 dark:text-green-500">{daysLeft} days remaining</p>}
                        </div>
                    </div>
                    {expiryDate ? (
                        <div className="text-sm font-medium mt-4 text-gray-700 dark:text-gray-300">
                            Current Period Ends: {expiryDate.toLocaleDateString()}
                        </div>
                    ) : (
                        <div className="text-sm font-medium mt-4 text-gray-700 dark:text-gray-300">
                            Status: Unsubscribed / Trial Expired
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Renew or Extend Plan</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Extend your selling privileges by 30 days. {isExpired ? "Unlock your storefront immediately." : "Added seamlessly to your current expiration date."}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            {amount} <span className="text-lg font-medium text-gray-500">ETB / month</span>
                        </div>
                    </div>
                    <form action={renewSubscription}>
                        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md hover:shadow-lg">
                            Pay {amount} ETB via Mock Gateway
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <History className="w-5 h-5" /> Payment History
                    </h2>
                </div>
                {payments && payments.length > 0 ? (
                    <table className="w-full text-left text-sm">
                         <thead className="bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-neutral-700">
                             <tr>
                                 <th className="px-6 py-4">Date</th>
                                 <th className="px-6 py-4">Reference ID</th>
                                 <th className="px-6 py-4">Status</th>
                                 <th className="px-6 py-4 text-right">Amount</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                            {payments.map((p: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-300">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                        {p.payment_reference}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                        {Number(p.amount).toFixed(2)} ETB
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No payments found.
                    </div>
                )}
            </div>
        </div>
    )
}
