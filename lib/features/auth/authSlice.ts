import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@supabase/supabase-js'

interface AuthState {
    user: User | null
    role: 'buyer' | 'vendor' | 'admin' | null
    isLoading: boolean
}

const initialState: AuthState = {
    user: null,
    role: null,
    isLoading: true,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: User | null; role: AuthState['role'] }>) => {
            state.user = action.payload.user
            state.role = action.payload.role
            state.isLoading = false
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
    },
})

export const { setUser, setLoading } = authSlice.actions
export default authSlice.reducer
