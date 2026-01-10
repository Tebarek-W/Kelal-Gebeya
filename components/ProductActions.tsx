'use client'

import { useState } from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useAppDispatch } from '@/lib/hooks'
import { addItem } from '@/lib/features/cart/cartSlice'
import { useRouter } from 'next/navigation'

interface Product {
    id: string
    shop_id: string
    name: string
    price: number
    images: string[]
    stock: number
    category: string
    description?: string // Though not in schema yet, good for future
}

// Separate component for interactivity
export default function ProductActions({ product }: { product: any }) {
    const [quantity, setQuantity] = useState(1)
    const dispatch = useAppDispatch()
    const router = useRouter()

    const handleAddToCart = () => {
        dispatch(addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.images?.[0] || '/placeholder.png',
            shopId: product.shop_id
        }))
        router.push('/cart')
    }

    return (
        <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Quantity</span>
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-bold text-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ShoppingCart className="w-5 h-5" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
        </div>
    )
}
