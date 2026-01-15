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

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Could not load Supabase credentials from .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const email = 'baruck12@gmail.com'
const password = 'password1'

async function checkAndSeedAdmin() {
    console.log(`🔍 Checking status for admin: ${email}`)

    // 1. Try to Login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (!loginError && loginData.user) {
        console.log('✅ Success! Admin user exists and credentials work.')
        console.log(`   User ID: ${loginData.user.id}`)
        console.log('   Please proceed to log in at /login')
        return
    }

    console.log('⚠️  Login failed:', loginError?.message || 'Unknown reason')

    if (loginError?.message.includes('Email not confirmed')) {
        console.log('❗ ACTION REQUIRED: Only you can fix this.')
        console.log('   Go to your email inbox and click the confirmation link from Supabase.')
        console.log('   OR, go to your Supabase Project Dashboard > Authentication > Users and manually confirm the user.')
        return
    }

    // 2. If Login failed (and not just unconfirmed), try to SignUp
    console.log('🔄 Attempting to create (seed) the admin user...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'System Admin',
            },
        },
    })

    if (signUpError) {
        console.error('❌ Signup failed:', signUpError.message)
        if (signUpError.message.includes('already registered')) {
            console.log('   The user is registered but login failed. This usually means:')
            console.log('   1. The password might be different than "password1".')
            console.log('   2. The email is not confirmed yet.')
        }
    } else if (signUpData.user) {
        if (signUpData.session) {
            console.log('✅ Admin user created and auto-logged in!')
        } else {
            console.log('✅ Admin user created successfully.')
            console.log('❗ IMPORTANT: You likely need to verify your email address before logging in.')
            console.log('   Check your inbox for a link from Supabase.')
        }
    }
}

checkAndSeedAdmin()
