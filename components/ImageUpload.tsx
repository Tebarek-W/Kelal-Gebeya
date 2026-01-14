'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

interface ImageUploadProps {
    onUpload: (url: string) => void
    label: string
}

export default function ImageUpload({ onUpload, label }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            toast.error('Cloudinary config missing. Check .env.local')
            console.error('Missing Config:', { cloudName, uploadPreset })
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const errorText = await res.text()
                console.error(`Cloudinary Error (${res.status}):`, errorText)
                try {
                    const errorJson = JSON.parse(errorText)
                    toast.error(`Upload failed: ${errorJson.error?.message || res.statusText}`)
                } catch {
                    toast.error(`Upload failed: ${res.statusText}`)
                }
                return
            }

            const data = await res.json()
            console.log('Upload Success:', data)

            if (data.secure_url) {
                setPreview(data.secure_url)
                onUpload(data.secure_url)
                toast.success('Image uploaded successfully!')
            } else {
                console.error('Missing secure_url in response:', data)
                toast.error('Upload successful but URL missing.')
            }
        } catch (err) {
            console.error('Network Error:', err)
            toast.error('Network error during upload.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            <div className="flex items-center gap-4">
                {preview && (
                    <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                )}
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-50 file:text-purple-700
                        hover:file:bg-purple-100 dark:file:bg-neutral-800 dark:file:text-neutral-300
                        cursor-pointer"
                    />
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50">
                            <Loader2 className="animate-spin w-4 h-4 text-purple-600" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
