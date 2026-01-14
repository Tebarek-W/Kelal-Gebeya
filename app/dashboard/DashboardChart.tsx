'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, ChevronDown } from 'lucide-react'

interface Order {
    id: string
    total_price: number
    created_at: string
}

type Period = 'Daily' | 'Monthly' | 'Yearly'

export default function DashboardChart({ orders }: { orders: Order[] }) {
    const [period, setPeriod] = useState<Period>('Daily')

    const chartData = useMemo(() => {
        if (!orders) return []

        const data: Record<string, number> = {}
        const now = new Date()

        if (period === 'Daily') {
            // Last 14 days
            for (let i = 13; i >= 0; i--) {
                const d = new Date()
                d.setDate(now.getDate() - i)
                const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                data[label] = 0
            }

            orders.forEach(order => {
                const date = new Date(order.created_at)
                const label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                if (data[label] !== undefined) {
                    data[label] += 1
                }
            })
        } else if (period === 'Monthly') {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const label = d.toLocaleDateString('en-US', { month: 'short' })
                data[label] = 0
            }

            orders.forEach(order => {
                const date = new Date(order.created_at)
                const label = date.toLocaleDateString('en-US', { month: 'short' })
                if (data[label] !== undefined) {
                    data[label] += 1
                }
            })
        } else {
            // Yearly (Last 5 years)
            for (let i = 4; i >= 0; i--) {
                const label = (now.getFullYear() - i).toString()
                data[label] = 0
            }

            orders.forEach(order => {
                const date = new Date(order.created_at)
                const label = date.getFullYear().toString()
                if (data[label] !== undefined) {
                    data[label] += 1
                }
            })
        }

        return Object.entries(data).map(([name, orders]) => ({ name, orders }))
    }, [orders, period])

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 h-[450px]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Performance</h3>
                    <p className="text-sm text-gray-500">View your order volume trends</p>
                </div>

                <div className="relative inline-block text-left">
                    <div className="flex bg-gray-50 dark:bg-neutral-800 p-1 rounded-lg border border-gray-200 dark:border-neutral-700">
                        {(['Daily', 'Monthly', 'Yearly'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${period === p
                                        ? 'bg-white dark:bg-neutral-700 text-purple-600 dark:text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.1} />
                        <XAxis
                            dataKey="name"
                            stroke="#888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                            cursor={{ fill: 'rgba(147, 51, 234, 0.05)' }}
                        />
                        <Bar
                            dataKey="orders"
                            fill="#9333ea"
                            radius={[6, 6, 0, 0]}
                            barSize={period === 'Daily' ? 20 : 40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
