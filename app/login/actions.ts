'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return { error: error.message }
        }

        if (data.user) {
            // Check for admin role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            revalidatePath('/', 'layout')
            
            return { 
                success: true, 
                isAdmin: profile?.role === 'admin' 
            }
        }

        return { error: 'User session could not be established' }
    } catch (err) {
        console.error('Server Login Error:', err)
        return { error: 'An unexpected server error occurred' }
    }
}
