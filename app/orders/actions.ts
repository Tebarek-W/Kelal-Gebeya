'use server'

import { createClient } from '@/lib/supabase/server'

export async function getBuyerOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated', orders: [] }
    }

    // Get all orders placed by this buyer
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            shops:shop_id (name, logo_url),
            order_items (
                id,
                quantity,
                price,
                products:product_id (name, images)
            ),
            shop_reviews (
                id,
                rating,
                comment,
                created_at
            )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching orders:', error)
        return { error: error.message, orders: [] }
    }

    return { orders: orders || [] }
}

export async function submitReview(orderId: string, shopId: string, rating: number, comment?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    if (rating < 1 || rating > 5) {
        return { error: 'Rating must be between 1 and 5' }
    }

    const { error } = await supabase
        .from('shop_reviews')
        .insert({
            order_id: orderId,
            shop_id: shopId,
            buyer_id: user.id,
            rating,
            comment: comment?.trim() || null
        })

    if (error) {
        console.error('Error submitting review:', error)
        if (error.code === '23505') { // Postgres unique violation error code
            return { error: 'You have already reviewed this order' }
        }
        return { error: error.message }
    }

    return { success: true }
}
