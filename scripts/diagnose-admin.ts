import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Simple env loader
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
const email = 'baruck12@gmail.com'
const password = 'password1'

async function diagnose() {
    console.log('🩺 Starting Admin Access Diagnosis...')

    // 1. Sign in
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (loginError || !user) {
        console.error('❌ Login failed:', loginError?.message)
        return
    }
    console.log('✅ Admin Logged in.')

    // 2. Fetch a shop to test
    const { data: shops, error: fetchError } = await supabase
        .from('shops')
        .select('id, name')
        .limit(1)

    if (fetchError) {
        console.error('❌ Failed to fetch shops:', fetchError)
        return
    }

    if (!shops || shops.length === 0) {
        console.log('⚠️ No shops found to test update on. Please create a shop first.')
        return
    }

    const shop = shops[0]
    console.log(`ℹ️  Testing update on shop: ${shop.name} (${shop.id})`)

    // 3. Try to update 'status' - THIS IS THE CRITICAL TEST
    const { error: updateError } = await supabase
        .from('shops')
        .update({ status: 'approved' } as any)
        .eq('id', shop.id)

    if (updateError) {
        console.error('❌ UPDATE FAILED with error:', JSON.stringify(updateError, null, 2))

        if (updateError.code === '42703') { // Undefined column
            console.log('\n🚨 DIAGNOSIS: The "status" column does not exist on the "shops" table.')
            console.log('   FIX: You MUST run the "supabase/admin_setup.sql" script in your Supabase Dashboard.')
        } else if (updateError.code === '42501') { // RLS violation
            console.log('\n🚨 DIAGNOSIS: Permission denied (RLS Violation).')
            console.log('   The "Admins can update all shops" policy is missing.')
            console.log('   FIX: You MUST run the "supabase/admin_setup.sql" script in your Supabase Dashboard.')
        } else {
            console.log('\n🚨 DIAGNOSIS: Unknown error. Check the code above.')
        }
    } else {
        console.log('✅ UPDATE SUCCESSFUL! The admin system is correctly configured.')
    }
}

diagnose()
