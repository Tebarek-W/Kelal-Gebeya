import { createClient } from '@/lib/supabase/server'
import VendorsList from '@/components/admin/VendorsList'

export const dynamic = 'force-dynamic'

export default async function VendorsPage() {
    const supabase = await createClient()

    const { data: shops, error } = await supabase
        .from('shops')
        .select('*, owner:profiles(full_name)')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching shops:', error)
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Vendor Management</h2>
                    <p className="text-zinc-400 text-sm mt-1">Review registrations and manage shop statuses.</p>
                </div>
            </div>
            <VendorsList shops={shops as any || []} />
        </div>
    )
}
