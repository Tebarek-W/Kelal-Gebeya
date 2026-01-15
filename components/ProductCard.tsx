'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useAppDispatch } from '@/lib/hooks'
import { addItem } from '@/lib/features/cart/cartSlice'

interface Product {
    id: string
    name: string
    price: number
    images: string[] | null
    shop_id: string
    shops?: {
        name: string
    } | null
}

export default function ProductCard({ product }: { product: Product }) {
    const dispatch = useAppDispatch()

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        dispatch(addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images?.[0] || '/placeholder.png',
            shopId: product.shop_id
        }))
    }

    return (
        <div className="group relative block overflow-hidden rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all hover:shadow-md">
            <div className="block">
                <Link href={`/product/${product.id}`}>
                    <div className="aspect-square w-full bg-neutral-100 relative overflow-hidden">
                        {product.images?.[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                unoptimized
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-neutral-400 text-sm">No Image</div>
                        )}
                    </div>
                    <div className="pt-4 px-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</h3>
                    </div>
                </Link>

                <div className="p-4 pt-1 flex items-center justify-between">
                    <Link href={`/product/${product.id}`}>
                        <p className="text-sm text-gray-500 font-medium">{product.price.toFixed(2)} ETB</p>
                    </Link>
                    {product.shops?.name && (
                        <Link
                            href={`/shop/${product.shop_id}`}
                            className="text-[10px] text-purple-600 hover:text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-wider transition-colors z-10"
                        >
                            Sold by: {product.shops.name}
                        </Link>
                    )}
                </div>
            </div>
            <button
                onClick={handleAddToCart}
                className="absolute bottom-4 right-4 bg-black dark:bg-white text-white dark:text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer z-20"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    )
}
