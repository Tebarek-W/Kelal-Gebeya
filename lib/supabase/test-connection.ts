import { createClient } from './server'

export async function testSupabaseConnection() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('products').select('id').limit(1)
    if (error) {
        console.error('Supabase Connection Test Failed:', error)
        return { success: false, error }
    }
    return { success: true, count: data?.length }
}
