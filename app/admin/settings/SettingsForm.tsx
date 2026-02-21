'use client'

import { useTransition, useState } from 'react'
import { updateSubscriptionFee } from './actions'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'

export default function SettingsForm({ initialAmount }: { initialAmount: number }) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMessage(null)
        
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const result = await updateSubscriptionFee(formData)
            if (result.error) {
                setMessage({ type: 'error', text: result.error })
            } else if (result.success) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' })
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-zinc-400 mb-1">
                    Monthly Subscription Fee (ETB)
                </label>
                <div className="relative">
                    <input
                        type="number"
                        name="amount"
                        id="amount"
                        defaultValue={initialAmount}
                        step="0.01"
                        min="0.01"
                        required
                        className="w-full bg-black border border-zinc-800 rounded-md py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                    This amount will be charged to vendors every 30 days to maintain an active storefront.
                </p>
            </div>

            {message && (
                <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isPending ? 'Saving...' : 'Save Config'}
                </button>
            </div>
        </form>
    )
}
