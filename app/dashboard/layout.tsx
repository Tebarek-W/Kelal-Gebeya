import Sidebar from '@/components/DashboardSidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Clock } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        redirect('/login')
    }

    const { data: subscription } = await supabase
        .from('shops')
        .select('vendor_subscriptions(expires_at)')
        .eq('owner_id', user.id)
        .maybeSingle()

    const sub = subscription?.vendor_subscriptions?.[0] || subscription?.vendor_subscriptions || null
    const activeSub = Array.isArray(sub) ? sub[0] : sub

    let isExpired = true
    let daysLeft = 0
    let message = 'Your vendor subscription has expired. You cannot add new products or receive new orders.'

    if (activeSub && activeSub.expires_at) {
        const expiry = new Date(activeSub.expires_at)
        const now = new Date()
        if (expiry > now) {
            isExpired = false
            daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            message = `Your subscription expires in ${daysLeft} days.`
        }
    } else {
         message = 'Your vendor account requires an active subscription to start selling.'
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 bg-gray-50 dark:bg-black overflow-y-auto">
                {isExpired && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-900/50 p-4 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                        <Link href="/dashboard/subscription" className="text-sm font-bold px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md whitespace-nowrap text-center">Manage Subscription</Link>
                    </div>
                )}
                {!isExpired && daysLeft <= 5 && (
                     <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-900/50 p-4 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                     <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                         <Clock className="w-5 h-5 flex-shrink-0" />
                         <p className="text-sm font-medium">{message}</p>
                     </div>
                     <Link href="/dashboard/subscription" className="text-sm font-bold px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md whitespace-nowrap text-center">Renew Early</Link>
                 </div>
                )}
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    )
}
