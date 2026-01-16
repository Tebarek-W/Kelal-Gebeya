'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function logout() {
    const supabase = await createClient()

    // Sign out from Supabase (clears server-side session)
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Logout error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
