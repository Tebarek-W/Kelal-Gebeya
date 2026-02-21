import { createClient } from '@/lib/supabase/server'
import { Settings } from 'lucide-react'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: setting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'vendor_subscription_fee')
        .maybeSingle()

    const currentFee = setting?.value?.amount || 500

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="w-6 h-6" /> System Settings
                    </h1>
                    <p className="text-zinc-400 mt-1">Configure global application variables.</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-2xl">
                <h2 className="text-lg font-semibold text-white mb-4">Vendor Subscriptions</h2>
                
                <SettingsForm initialAmount={currentFee} />
            </div>
        </div>
    )
}
