'use client'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const links = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 hidden md:block flex-shrink-0">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vendor Portal</h2>
            </div>
            <nav className="space-y-1 px-4">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-800"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
