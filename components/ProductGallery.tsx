'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

interface ProductGalleryProps {
    images: string[]
    productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Handling no images case
    const displayImages = images.length > 0 ? images : ['/placeholder.png']

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
    }

    return (
        <div className="space-y-4 select-none">
            {/* Main Image with Arrows */}
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-none group">
                <Image
                    src={displayImages[currentIndex]}
                    alt={`${productName} - Image ${currentIndex + 1}`}
                    fill
                    className="object-cover transition-all duration-300"
                    priority
                />

                {/* Navigation Arrows (Only if multiple images) */}
                {displayImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {displayImages.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={clsx(
                                "w-24 h-24 relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0",
                                idx === currentIndex
                                    ? "border-purple-600 ring-2 ring-purple-100 dark:ring-purple-900"
                                    : "border-transparent hover:border-gray-300 dark:hover:border-neutral-700"
                            )}
                        >
                            <Image src={img} alt="" fill className="object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
