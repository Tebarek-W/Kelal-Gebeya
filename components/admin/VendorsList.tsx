'use client'

import { approveVendor, rejectVendor, suspendVendor, toggleVerification, reactivateVendor } from '@/app/admin/actions'
import { Check, X, Ban, ShieldCheck, Store, Eye, Phone, MapPin, Calendar, Info } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Shop = {
    id: string
    name: string
    status: 'pending' | 'approved' | 'rejected' | 'suspended'
    is_verified: boolean
    created_at: string
    category: string
    description: string | null
    logo_url: string | null
    banner_url: string | null
    contact_phone: string | null
    address: string | null
    admin_notes: string | null
    owner?: {
        full_name: string | null
    } | null
}

export default function VendorsList({ shops }: { shops: Shop[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
    const [rejectionNotes, setRejectionNotes] = useState('')
    const [showRejectionInput, setShowRejectionInput] = useState(false)
    const router = useRouter()

    const handleAction = async (action: () => Promise<void>, id: string) => {
        setLoadingId(id)
        try {
            await action()
            router.refresh()
            if (selectedShop?.id === id) {
                // Refresh local state if a modal is open
                setSelectedShop(null)
                setShowRejectionInput(false)
                setRejectionNotes('')
            }
        } catch (error) {
            console.error(error)
            alert('Action failed')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="space-y-4">
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
                                                <button
                                                    onClick={() => setSelectedShop(shop)}
                                                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                {(!shop.status || shop.status === 'pending') && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleAction(() => approveVendor(shop.id), shop.id)}
                                                            disabled={loadingId === shop.id}
                                                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                                                            title="Quick Approve"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedShop(shop);
                                                                setShowRejectionInput(true);
                                                            }}
                                                            disabled={loadingId === shop.id}
                                                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                                            title="Quick Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedShop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Banner */}
                        <div className="h-32 bg-zinc-800 relative">
                            {selectedShop.banner_url ? (
                                <img src={selectedShop.banner_url} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                    <Store className="h-12 w-12" />
                                </div>
                            )}
                            {/* Logo Overflow */}
                            <div className="absolute -bottom-10 left-8 h-20 w-20 rounded-xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden shadow-xl">
                                {selectedShop.logo_url ? (
                                    <img src={selectedShop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-purple-600 font-bold text-2xl">
                                        {selectedShop.name[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-14 p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{selectedShop.name}</h3>
                                    <p className="text-purple-400 font-medium text-sm">{selectedShop.category}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedShop.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500' :
                                    selectedShop.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                        'bg-red-500/20 text-red-500'
                                    }`}>
                                    {selectedShop.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Info className="h-5 w-5 text-zinc-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase">Description</p>
                                            <p className="text-sm text-zinc-300 leading-relaxed">{selectedShop.description || 'No description provided.'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-zinc-500" />
                                        <div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase">Joined</p>
                                            <p className="text-sm text-zinc-300">{new Date(selectedShop.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-zinc-500" />
                                        <div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase">Contact</p>
                                            <p className="text-sm text-zinc-300">{selectedShop.contact_phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-zinc-500" />
                                        <div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase">Address</p>
                                            <p className="text-sm text-zinc-300">{selectedShop.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Notes Area */}
                            {showRejectionInput && (
                                <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                                    <label className="text-sm font-bold text-red-400 uppercase tracking-tight">Reason for Rejection / Suspension</label>
                                    <textarea
                                        value={rejectionNotes}
                                        onChange={(e) => setRejectionNotes(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-red-500 outline-none h-24"
                                        placeholder="e.g. Invalid documents, poor image quality..."
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (selectedShop.status === 'approved') {
                                                    handleAction(() => suspendVendor(selectedShop.id, rejectionNotes), selectedShop.id)
                                                } else {
                                                    handleAction(() => rejectVendor(selectedShop.id, rejectionNotes), selectedShop.id)
                                                }
                                            }}
                                            disabled={!rejectionNotes.trim() || loadingId === selectedShop.id}
                                            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {selectedShop.status === 'approved' ? 'Confirm Suspension' : 'Confirm Rejection'}
                                        </button>
                                        <button
                                            onClick={() => setShowRejectionInput(false)}
                                            className="px-4 bg-zinc-800 text-white py-2 rounded-lg font-bold text-sm hover:bg-zinc-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Actions Footer */}
                            {!showRejectionInput && (
                                <div className="flex gap-3 border-t border-zinc-800 pt-6">
                                    <button
                                        onClick={() => setSelectedShop(null)}
                                        className="px-6 py-2.5 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl font-bold transition-all"
                                    >
                                        Close
                                    </button>

                                    <div className="flex-1" />

                                    {selectedShop.status === 'pending' || selectedShop.status === 'suspended' ? (
                                        <button
                                            onClick={() => handleAction(() => (selectedShop.status === 'suspended' ? reactivateVendor(selectedShop.id) : approveVendor(selectedShop.id)), selectedShop.id)}
                                            disabled={loadingId === selectedShop.id}
                                            className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center min-w-[140px]"
                                        >
                                            {loadingId === selectedShop.id ? (
                                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                selectedShop.status === 'suspended' ? 'Re-activate' : 'Approve Shop'
                                            )}
                                        </button>
                                    ) : null}

                                    {selectedShop.status !== 'rejected' && (
                                        <button
                                            onClick={() => setShowRejectionInput(true)}
                                            className="px-6 py-2.5 bg-zinc-800 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all border border-red-500/20"
                                        >
                                            {selectedShop.status === 'approved' ? 'Suspend' : 'Reject'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
