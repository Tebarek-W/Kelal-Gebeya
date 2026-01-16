'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createShop(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Check if shop already exists
    const { data: existingShop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (existingShop) {
        return { error: 'You already have a shop. Multi-shop support is coming soon!' }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const contact_phone = formData.get('contact_phone') as string
    const address = formData.get('address') as string
    const logo_url = formData.get('logo_url') as string
    const banner_url = formData.get('banner_url') as string

    // Create Shop
    const { error: shopError } = await supabase
        .from('shops')
        .insert({
            owner_id: user.id,
            name,
            description,
            category,
            contact_phone,
            address,
            logo_url,
            banner_url,
            status: 'pending',
            is_verified: false
        })

    if (shopError) {
        console.error(shopError)
        return { error: 'Failed to create shop: ' + shopError.message }
    }

    // Update Role
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'vendor' })
        .eq('id', user.id)

    if (profileError) {
        console.error(profileError)
        return { error: 'Failed to update user role' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
