'use server'

import { createClient } from '@/lib/supabase/server'

export async function getVendorOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated', orders: [] }
    }

    // Get the vendor's shop
    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!shop) {
        return { error: 'No shop found', orders: [] }
    }

    // Get orders for this shop with buyer info and order items
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            profiles:buyer_id (full_name),
            order_items (
                id,
                quantity,
                price,
                products:product_id (name, images)
            )
        `)
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching orders:', error)
        return { error: error.message, orders: [] }
    }

    return { orders: orders || [] }
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'processing' | 'completed') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Verify the order belongs to this vendor's shop
    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!shop) {
        return { error: 'No shop found' }
    }

    // Get current order status to check if we're transitioning to completed
    const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('shop_id', shop.id)
        .single()

    if (!currentOrder) {
        return { error: 'Order not found' }
    }

    // Update order status
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .eq('shop_id', shop.id)

    if (error) {
        return { error: error.message }
    }

    // If status changed to completed and wasn't already completed, update stock
    if (status === 'completed' && currentOrder.status !== 'completed') {
        // Get order items
        const { data: orderItems } = await supabase
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', orderId)

        if (orderItems && orderItems.length > 0) {
            // Update stock for each product
            for (const item of orderItems) {
                if (item.product_id) {
                    // Get current stock
                    const { data: product } = await supabase
                        .from('products')
                        .select('stock')
                        .eq('id', item.product_id)
                        .single()

                    if (product) {
                        const newStock = Math.max(0, (product.stock || 0) - item.quantity)

                        await supabase
                            .from('products')
                            .update({ stock: newStock })
                            .eq('id', item.product_id)
                    }
                }
            }
        }
    }

    return { success: true }
}
