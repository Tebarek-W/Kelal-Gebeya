'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    return supabase
}

export async function approveVendor(shopId: string) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('shops')
        .update({ status: 'approved' })
        .eq('id', shopId)

    if (error) throw error
    revalidatePath('/admin/vendors')
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function rejectVendor(shopId: string, notes?: string) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('shops')
        .update({
            status: 'rejected',
            admin_notes: notes
        })
        .eq('id', shopId)

    if (error) throw error
    revalidatePath('/admin/vendors')
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function suspendVendor(shopId: string, notes?: string) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('shops')
        .update({
            status: 'suspended',
            admin_notes: notes
        })
        .eq('id', shopId)

    if (error) throw error
    revalidatePath('/admin/vendors')
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function reactivateVendor(shopId: string) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('shops')
        .update({ status: 'approved' })
        .eq('id', shopId)

    if (error) throw error
    revalidatePath('/admin/vendors')
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function toggleVerification(shopId: string, currentStatus: boolean) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('shops')
        .update({ is_verified: !currentStatus })
        .eq('id', shopId)

    if (error) throw error
    revalidatePath('/admin/vendors')
    revalidatePath('/admin')
    revalidatePath('/')
}
