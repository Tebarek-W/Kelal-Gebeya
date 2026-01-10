'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppSelector } from '@/lib/hooks' // While this is client-side, standard hooks are separate.
// Wait, 'useAppSelector' needs a Redux provider which wraps the app. 
// But this page is Server Component by default? No, line 1 says 'use client'.
// However, the best practice is to fetch data in a parent SC or use useEffect here. 
// For simplicity in this demo, we'll assume we pass data or fetch it.
// The prompt asked to show shop details "on his profile side". 
// We should fetch the *shop* of the current user.

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const data = [
    { name: 'Jan', orders: 40 },
    { name: 'Feb', orders: 30 },
    { name: 'Mar', orders: 20 },
    { name: 'Apr', orders: 27 },
    { name: 'May', orders: 18 },
    { name: 'Jun', orders: 23 },
    { name: 'Jul', orders: 34 },
]

export default function DashboardPage() {
    const [shop, setShop] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        async function getShop() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('shops').select('*').eq('owner_id', user.id).single()
                setShop(data)
            }
        }
        getShop()
    }, [])

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                {shop && (
                    <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-neutral-800">
                        {shop.logo_url ? (
                            <img src={shop.logo_url} alt={shop.name} className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">{shop.name[0]}</div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{shop.name}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {['Total Sales', 'Total Orders', 'Products'].map((item) => (
                    <div key={item} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                        <h3 className="text-gray-500 text-sm font-medium">{item}</h3>
                        <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">0</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 h-96">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Orders Overview</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="orders" fill="#9333ea" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
