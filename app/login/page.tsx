'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError(error.message)
            } else {
                router.push('/')
                router.refresh()
            }
        } catch (err: any) {
            console.error('Login error:', err)
            if (err.message === 'Failed to fetch') {
                setError('Network error: Unable to connect to authentication server. Please check your internet connection and ensure Supabase is configured correctly.')
            } else {
                setError('An unexpected error occurred. Please try again later.')
            }
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black px-4">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your account</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <input
                                type="email"
                                required
                                className="relative block w-full rounded-t-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 dark:bg-neutral-800 dark:text-white dark:ring-gray-700"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 dark:bg-neutral-800 dark:text-white dark:ring-gray-700"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-md bg-purple-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 shadow-md shadow-purple-600/20"
                    >
                        Sign in
                    </button>
                </form>
                <div className="text-center text-sm">
                    <Link href="/register" className="font-medium text-purple-600 hover:text-purple-500">
                        Don't have an account? Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}
