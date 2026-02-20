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

// Helper to save to local storage
const saveToLocalStorage = (items: CartItem[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('kelal_cart', JSON.stringify(items))
    }
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        initializeCart: (state) => {
            if (typeof window !== 'undefined') {
                const savedCart = localStorage.getItem('kelal_cart')
                if (savedCart) {
                    try {
                        state.items = JSON.parse(savedCart)
                    } catch (e) {
                        console.error('Failed to parse cart from local storage:', e)
                    }
                }
            }
        },
        addItem: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find((item) => item.id === action.payload.id)
            if (existingItem) {
                existingItem.quantity += 1
            } else {
                state.items.push(action.payload)
            }
            saveToLocalStorage(state.items)
        },
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload)
            saveToLocalStorage(state.items)
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const item = state.items.find((item) => item.id === action.payload.id)
            if (item) {
                item.quantity = Math.max(0, action.payload.quantity)
                if (item.quantity === 0) {
                    state.items = state.items.filter((i) => i.id !== action.payload.id)
                }
            }
            saveToLocalStorage(state.items)
        },
        clearCart: (state) => {
            state.items = []
            saveToLocalStorage(state.items)
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen
        },
    },
})

export const { initializeCart, addItem, removeItem, updateQuantity, clearCart, toggleCart } = cartSlice.actions
export default cartSlice.reducer
