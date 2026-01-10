import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image: string
    shopId: string
}

interface CartState {
    items: CartItem[]
    isOpen: boolean
}

const initialState: CartState = {
    items: [],
    isOpen: false,
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find((item) => item.id === action.payload.id)
            if (existingItem) {
                existingItem.quantity += 1
            } else {
                state.items.push(action.payload)
            }
        },
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload)
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const item = state.items.find((item) => item.id === action.payload.id)
            if (item) {
                item.quantity = Math.max(0, action.payload.quantity)
                if (item.quantity === 0) {
                    state.items = state.items.filter((i) => i.id !== action.payload.id)
                }
            }
        },
        clearCart: (state) => {
            state.items = []
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen
        },
    },
})

export const { addItem, removeItem, updateQuantity, clearCart, toggleCart } = cartSlice.actions
export default cartSlice.reducer
