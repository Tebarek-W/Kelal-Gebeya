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
