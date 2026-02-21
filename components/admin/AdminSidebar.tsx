'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, LogOut, ShieldCheck, Settings, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Vendors', href: '/admin/vendors', icon: Store },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    return (
        <div className="flex h-full w-64 flex-col bg-zinc-900 border-r border-zinc-800">
            <div className="flex h-16 items-center px-6 border-b border-zinc-800">
                <ShieldCheck className="h-8 w-8 text-white mr-2" />
                <span className="text-lg font-bold text-white">Admin</span>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto py-4">
                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t border-zinc-800 p-4">
                <button
                    onClick={handleSignOut}
                    className="group flex w-full items-center px-2 py-2 text-sm font-medium text-zinc-400 rounded-md hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <LogOut
                        className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-white"
                        aria-hidden="true"
                    />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
