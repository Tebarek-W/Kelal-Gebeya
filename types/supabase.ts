export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    role: 'buyer' | 'vendor' | 'admin'
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    role?: 'buyer' | 'vendor' | 'admin'
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    role?: 'buyer' | 'vendor' | 'admin'
                    created_at?: string
                }
            }
            shops: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    description: string | null
                    logo_url: string | null
                    banner_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    description?: string | null
                    logo_url?: string | null
                    banner_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    description?: string | null
                    logo_url?: string | null
                    banner_url?: string | null
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    shop_id: string
                    name: string
                    price: number
                    images: string[] | null
                    stock: number
                    category: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    shop_id: string
                    name: string
                    price: number
                    images?: string[] | null
                    stock?: number
                    category?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    shop_id?: string
                    name?: string
                    price?: number
                    images?: string[] | null
                    stock?: number
                    category?: string | null
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    buyer_id: string
                    shop_id: string
                    total_price: number
                    status: 'pending' | 'processing' | 'completed'
                    created_at: string
                }
                Insert: {
                    id?: string
                    buyer_id: string
                    shop_id: string
                    total_price: number
                    status?: 'pending' | 'processing' | 'completed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    buyer_id?: string
                    shop_id?: string
                    total_price?: number
                    status?: 'pending' | 'processing' | 'completed'
                    created_at?: string
                }
            }
        }
    }
}
