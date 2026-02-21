'use server'

import { createClient } from '@/lib/supabase/server'

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image: string
    shopId: string
}

export async function checkout(cart: CartItem[], paymentMethod: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Please log in to checkout' }
    }

    if (cart.length === 0) {
        return { error: 'Cart is empty' }
    }

    // Group items by shop
    const shopOrders = new Map<string, CartItem[]>()
    cart.forEach(item => {
        const items = shopOrders.get(item.shopId) || []
        items.push(item)
        shopOrders.set(item.shopId, items)
    })
    
    const shopIds = Array.from(shopOrders.keys())

    // Check shop subscriptions
    const { data: subs, error: subsError } = await supabase
        .from('vendor_subscriptions')
        .select('shop_id, expires_at')
        .in('shop_id', shopIds)

    if (subsError) {
        return { error: 'Failed to verify shop statuses.' }
    }

    const validShopSubs = new Map(subs?.map(s => [s.shop_id, s.expires_at]))

    for (const shopId of shopIds) {
        const expiresAt = validShopSubs.get(shopId)
        if (!expiresAt || new Date(expiresAt) < new Date()) {
            return { error: 'Checkout failed: Processing is paused for one or more shops in your cart. Please remove their products to continue.' }
        }
    }

    try {
        for (const [shopId, items] of shopOrders) {
            const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

            // Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: user.id,
                    shop_id: shopId,
                    total_price: totalPrice,
                    payment_method: paymentMethod,
                    status: 'pending'
                })
                .select()
                .single()

            if (orderError) throw orderError

            // Create Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError
        }
    } catch (error: any) {
        console.error('Checkout error:', error)
        return { error: 'Failed to place order. Please try again.' + (error.message ? ` (${error.message})` : '') }
    }

    return { success: true }
}
