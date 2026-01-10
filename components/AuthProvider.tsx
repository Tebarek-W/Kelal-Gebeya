'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch } from '@/lib/hooks'
import { setUser, setLoading } from '@/lib/features/auth/authSlice'
import { useRouter } from 'next/navigation'

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const dispatch = useAppDispatch()
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Fetch role from profiles table
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                dispatch(setUser({ user, role: profile?.role || 'buyer' }))
            } else {
                dispatch(setUser({ user: null, role: null }))
            }
            dispatch(setLoading(false))
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()
                dispatch(setUser({ user: session.user, role: profile?.role || 'buyer' }))
            } else {
                dispatch(setUser({ user: null, role: null }))
            }
            dispatch(setLoading(false))
            if (event === 'SIGNED_OUT') {
                router.refresh()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [dispatch, supabase, router])

    return <>{children}</>
}
