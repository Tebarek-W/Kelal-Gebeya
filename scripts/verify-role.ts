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

async function checkAdminRole() {
    console.log('🔄 Verifying admin role for:', email)

    // Login to get ID
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (loginError || !user) {
        console.error('❌ Could not log in to verify role. Please run the seed script first.')
        return
    }

    // Check Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error('❌ Could not fetch profile:', profileError.message)
        console.log('   This likely means the "profiles" table does not exist or RLS is blocking access.')
        console.log('   DID YOU RUN THE "supabase/admin_setup.sql" SCRIPT IN SUPABASE DASHBOARD?')
    } else {
        console.log(`ℹ️  Current Role: ${profile?.role}`)
        if (profile?.role === 'admin') {
            console.log('✅ User is correctly configured as ADMIN.')
        } else {
            console.log('❌ User exists but is NOT an admin (Role is ' + profile?.role + ').')
            console.log('   Please manually update the role to "admin" in the "profiles" table via Supabase Dashboard.')
            console.log('   OR ensure you ran the SQL trigger setup before creating this user.')
        }
    }
}

checkAdminRole()
