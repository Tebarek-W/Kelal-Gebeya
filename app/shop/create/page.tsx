'use client'

import { Store, Laptop, Watch, Scissors } from 'lucide-react'
import Link from 'next/link'

const categories = [
    {
        id: 'Fashion',
        name: 'Fashion',
        description: 'Clothing, shoes, and accessories for men, women, and kids.',
        icon: Store,
        href: '/shop/setup?category=Fashion',
        color: 'bg-purple-500'
    },
    {
        id: 'Electronics',
        name: 'Electronics',
        description: 'Gadgets, phones, computers, and home appliances.',
        icon: Laptop,
        href: '/shop/create/electronics',
        color: 'bg-blue-500'
    },
    {
        id: 'Jewelry',
        name: 'Jewelry',
        description: 'Rings, necklaces, watches, and precious stones.',
        icon: Watch,
        href: '/shop/create/jewelry',
        color: 'bg-amber-500'
    },
    {
        id: 'Handmade Crafts',
        name: 'Handmade Crafts',
        description: 'Art, decor, and unique handmade items.',
        icon: Scissors,
        href: '/shop/create/handmade',
        color: 'bg-emerald-500'
    }
]

export default function SelectCategoryPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in duration-700">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Choose Your Business Type
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Select the category that best fits your products to get a tailored shop setup experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                    {categories.map((cat, i) => (
                        <Link
                            key={cat.id}
                            href={cat.href}
                            className={`group relative overflow-hidden bg-white dark:bg-neutral-900/50 p-8 rounded-2xl border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-xl`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {/* Abstract Background Icon */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-150 transition-transform duration-700 pointer-events-none">
                                <cat.icon className="w-48 h-48" />
                            </div>

                            <div className="relative z-10 flex items-start gap-5">
                                <div className={`p-4 rounded-xl ${cat.color} text-white shadow-lg shrink-0 group-hover:shadow-${cat.color.split('-')[1]}/30 transition-shadow`}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-snug">
                                        {cat.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
