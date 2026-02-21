'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function extendSubscription(shopId: string, days: number = 30) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Verify admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    // Use the RPC to process a manual extension as a payment event
    // This ensures LTV revenue is updated
    const { data: setting } = await supabase.from('system_settings').select('value').eq('key', 'vendor_subscription_fee').maybeSingle()
    const amount = setting?.value?.amount || 500
    const reference = `ADMIN_EXTEND_${Date.now()}_${Math.random().toString(36).substring(5).toUpperCase()}`

    const { error } = await supabase.rpc('process_subscription_payment', {
        p_shop_id: shopId,
        p_amount: amount,
        p_reference: reference,
        p_days: days
    })

    if (error) return { error: error.message }
    
    revalidatePath('/admin/subscriptions')
    return { success: true }
}

export async function deactivateSubscription(shopId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    // Upserting with an immediate past date to signify expiration
    const { error } = await supabase.from('vendor_subscriptions').upsert({
        shop_id: shopId,
        expires_at: new Date(Date.now() - 1000).toISOString() 
    })

    if (error) return { error: error.message }
    
    revalidatePath('/admin/subscriptions')
    return { success: true }
}
