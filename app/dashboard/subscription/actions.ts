'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function renewSubscription() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Not authenticated' }

    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return { error: 'Shop not found' }

    // Fetch the dynamic fee
    const { data: setting } = await supabase.from('system_settings').select('value').eq('key', 'vendor_subscription_fee').maybeSingle()
    const amount = setting?.value?.amount || 500

    // Mock payment reference
    const reference = `MOCK_PAY_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`

    // Call Process RPC
    const { error } = await supabase.rpc('process_subscription_payment', {
        p_shop_id: shop.id,
        p_amount: amount,
        p_reference: reference,
        p_days: 30
    })

    if (error) {
        console.error('Payment RPC error:', error)
        return { error: 'Payment processing failed: ' + error.message }
    }

    revalidatePath('/dashboard/subscription')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/products')
    return { success: true }
}
