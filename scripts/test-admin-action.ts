
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

async function testAdmin() {
    console.log('--- STARTING TEST ---')
    console.log('Logging in...')
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (loginError) {
        console.error('Login failed:', loginError.message)
        return
    }
    console.log('Logged in successfully. User ID:', user?.id)

    // 1. Check Profile
    console.log('Fetching profile role...')
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

    if (profileError) {
        console.error('Profile fetch error:', profileError.message)
    } else {
        console.log('Role:', profile?.role)
    }

    // 2. List Shops
    console.log('Listing shops (checking for columns)...')
    const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .limit(1)

    if (shopsError) {
        console.error('List shops error:', shopsError.message)
    } else {
        console.log('Found shops:', shops?.length)
        if (shops && shops.length > 0) {
            console.log('Shop [0] keys:', Object.keys(shops[0]))

            const shopId = shops[0].id
            console.log('Attempting to UPDATE shop:', shopId)

            // 3. Try Update
            const { error: updateError } = await supabase
                .from('shops')
                .update({ status: 'approved' })
                .eq('id', shopId)

            if (updateError) {
                console.error('Update FAILED:', updateError.message)
                console.error('Update Error Details:', JSON.stringify(updateError, null, 2))
            } else {
                console.log('Update SUCCEEDED')
            }
        } else {
            console.log('No shops found to test update.')
        }
    }
    console.log('--- TEST COMPLETE ---')
}

testAdmin()
