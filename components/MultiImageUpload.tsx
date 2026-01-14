'use client'
import { useState } from 'react'
import { Loader2, X, UploadCloud } from 'lucide-react'
import { toast } from 'react-toastify'

interface MultiImageUploadProps {
    onUpload: (urls: string[]) => void
    maxFiles?: number
    label: string
    initialImages?: string[]
}

export default function MultiImageUpload({ onUpload, maxFiles = 3, label, initialImages = [] }: MultiImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [images, setImages] = useState<string[]>(initialImages)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (images.length + files.length > maxFiles) {
            toast.warning(`You can only upload up to ${maxFiles} images.`)
            return
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            toast.error('Cloudinary config missing.')
            return
        }

        setUploading(true)
        const newUrls: string[] = []

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const formData = new FormData()
                formData.append('file', file)
                formData.append('upload_preset', uploadPreset)

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) throw new Error('Upload failed')

                const data = await res.json()
                if (data.secure_url) {
                    newUrls.push(data.secure_url)
                }
            }

            const updatedImages = [...images, ...newUrls]
            setImages(updatedImages)
            onUpload(updatedImages)
            toast.success('Images uploaded successfully!')

        } catch (err) {
            console.error('Upload failed', err)
            toast.error('One or more uploads failed.')
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index)
        setImages(updated)
        onUpload(updated)
    }

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label} (Max {maxFiles})
            </label>

            <div className="grid grid-cols-3 gap-4 mb-4">
                {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            {images.length < maxFiles && (
                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-center cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
                        ) : (
                            <UploadCloud className="w-8 h-8 mb-2" />
                        )}
                        <span className="text-sm font-medium">
                            {uploading ? 'Uploading...' : 'Click to Upload Images'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
