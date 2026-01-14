'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Get User's Shop ID
    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!shop) {
        throw new Error('Shop not found')
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const category = formData.get('category') as string
    const imagesJson = formData.get('images') as string
    let images: string[] = []

    try {
        images = imagesJson ? JSON.parse(imagesJson) : []
    } catch (e) {
        console.error('Failed to parse images JSON', e)
    }

    const { error } = await supabase
        .from('products')
        .insert({
            shop_id: shop.id,
            name,
            price,
            stock,
            category,
            images
        })

    if (error) {
        console.error(error)
        return { error: 'Failed to create product: ' + error.message }
    }

    revalidatePath('/dashboard/products')
    redirect('/dashboard/products')
}

export async function updateProduct(productId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Verify ownership
    const { data: product } = await supabase
        .from('products')
        .select('shop_id, shops(owner_id)')
        .eq('id', productId)
        .single()

    if (!product || (product.shops as any).owner_id !== user.id) {
        throw new Error('Unauthorized')
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const category = formData.get('category') as string
    const imagesJson = formData.get('images') as string
    let images: string[] = []

    try {
        images = imagesJson ? JSON.parse(imagesJson) : []
    } catch (e) {
        console.error('Failed to parse images JSON', e)
    }

    const { error } = await supabase
        .from('products')
        .update({
            name,
            price,
            stock,
            category,
            images,
            description
        })
        .eq('id', productId)

    if (error) {
        console.error(error)
        return { error: 'Failed to update product: ' + error.message }
    }

    revalidatePath('/dashboard/products')
    redirect('/dashboard/products')
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Verify ownership
    const { data: product } = await supabase
        .from('products')
        .select('shop_id, shops(owner_id)')
        .eq('id', productId)
        .single()

    if (!product || (product.shops as any).owner_id !== user.id) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
        console.error('Delete error:', error.message)
    }
    revalidatePath('/dashboard/products')
}
