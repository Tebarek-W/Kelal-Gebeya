
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load env
const envPath = path.resolve(__dirname, '../.env.local')
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (fs.existsSync(envPath) && (!supabaseUrl || !supabaseKey)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
        const parts = line.split('=')
        if (parts.length >= 2) {
            const key = parts[0].trim()
            const value = parts.slice(1).join('=').trim()
            if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value
            if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value
        }
    })
}

const supabase = createClient(supabaseUrl!, supabaseKey!)
const email = 'tazahd54@gmail.com'
const password = 'admin1'

async function debugStatusChange() {
    console.log('Logging in as admin...')
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (loginError) {
        console.error('Login failed:', loginError.message)
        return
    }

    const user = session?.user
    console.log('Logged in as:', user?.email, 'ID:', user?.id)

    // Check role in profiles
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
    console.log('Profile Role:', profile?.role)

    // Find a shop to update
    const { data: shops } = await supabase.from('shops').select('id, name, status').limit(5)
    console.log('Current Shops Statuses:')
    shops?.forEach(s => console.log(`- ${s.name}: ${s.status} (${s.id})`))

    if (shops && shops.length > 0) {
        const target = shops[0]
        const newStatus = target.status === 'approved' ? 'suspended' : 'approved'
        console.log(`\nAttempting to change status of "${target.name}" from ${target.status} to ${newStatus}...`)

        const { error: updateError } = await supabase
            .from('shops')
            .update({ status: newStatus })
            .eq('id', target.id)

        if (updateError) {
            console.error('❌ UPDATE FAILED:', updateError.message)
            console.error('Full Error:', JSON.stringify(updateError, null, 2))
        } else {
            console.log('✅ UPDATE SUCCESSFUL')

            // Verify change
            const { data: updatedShop } = await supabase.from('shops').select('status').eq('id', target.id).single()
            console.log('Verified New Status:', updatedShop?.status)
        }
    }
}

debugStatusChange()
