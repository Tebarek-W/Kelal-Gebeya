'use client'

import { approveVendor, rejectVendor, suspendVendor, toggleVerification } from '@/app/admin/actions'
import { Check, X, Ban, ShieldCheck, MoreHorizontal, Store } from 'lucide-react'
import { useState } from 'react'

type Shop = {
    id: string
    name: string
    status: 'pending' | 'approved' | 'rejected' | 'suspended'
    is_verified: boolean
    created_at: string
    category: string
    owner?: {
        full_name: string | null
    } | null
}

export default function VendorsList({ shops }: { shops: Shop[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleAction = async (action: () => Promise<void>, id: string) => {
        setLoadingId(id)
        try {
            await action()
        } catch (error) {
            console.error(error)
            alert('Action failed')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950/50 text-zinc-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Shop Name</th>
                            <th className="px-6 py-4 font-medium">Owner</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Verified</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {shops.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Store className="h-12 w-12 mb-4 opacity-20" />
                                        <p>No vendors found matching criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            shops.map((shop) => (
                                <tr key={shop.id} className="group hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white">{shop.name}</div>
                                        <div className="text-xs text-zinc-500">{shop.category}</div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-300">
                                        {shop.owner?.full_name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${(shop.status || 'pending') === 'approved'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : (shop.status || 'pending') === 'pending'
                                                    ? 'bg-yellow-500/10 text-yellow-500'
                                                    : (shop.status || 'pending') === 'suspended'
                                                        ? 'bg-red-500/10 text-red-500'
                                                        : 'bg-zinc-500/10 text-zinc-500'
                                                }`}
                                        >
                                            {shop.status
                                                ? shop.status.charAt(0).toUpperCase() + shop.status.slice(1)
                                                : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleAction(() => toggleVerification(shop.id, shop.is_verified), shop.id)}
                                            disabled={loadingId === shop.id}
                                            className={`transition-colors ${shop.is_verified ? 'text-blue-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                                            title="Toggle Verification"
                                        >
                                            <ShieldCheck className={`h-5 w-5 ${loadingId === shop.id ? 'animate-pulse' : ''}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            {(!shop.status || shop.status === 'pending') && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(() => approveVendor(shop.id), shop.id)}
                                                        disabled={loadingId === shop.id}
                                                        className="p-1 rounded hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                                                        title="Approve Shop"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(() => rejectVendor(shop.id), shop.id)}
                                                        disabled={loadingId === shop.id}
                                                        className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                                                        title="Reject Shop"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                            {shop.status === 'approved' && (
                                                <button
                                                    onClick={() => handleAction(() => suspendVendor(shop.id), shop.id)}
                                                    disabled={loadingId === shop.id}
                                                    className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                                                    title="Suspend Vendor"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </button>
                                            )}
                                            {shop.status === 'suspended' && (
                                                <button
                                                    onClick={() => handleAction(() => approveVendor(shop.id), shop.id)}
                                                    disabled={loadingId === shop.id}
                                                    className="p-1 rounded hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                                                    title="Re-activate Vendor"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
