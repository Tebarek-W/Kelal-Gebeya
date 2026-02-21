'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSubscriptionFee(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Unauthorized' }
    }

    const amountRaw = formData.get('amount')
    console.log('--- ADMIN SETTINGS UPDATE ---')
    console.log('Received raw amount form data:', amountRaw)
    
    const amount = parseFloat(amountRaw as string)
    if (isNaN(amount) || amount <= 0) {
        console.error('Invalid amount parsed:', amount)
        return { error: 'Invalid amount. Must be greater than 0.' }
    }

    console.log('Attempting to upsert amount:', amount)

    const { error } = await supabase
        .from('system_settings')
        .upsert({ key: 'vendor_subscription_fee', value: { amount } })

    if (error) {
        console.error('Supabase update error:', error)
        return { error: error.message }
    }

    console.log('Successfully updated settings to', amount)
    revalidatePath('/admin/settings')
    return { success: true }
}
