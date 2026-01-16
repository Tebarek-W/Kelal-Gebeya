import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Simple env loader
const envPath = path.resolve(__dirname, '../.env.local')
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (fs.existsSync(envPath) && (!supabaseUrl || !supabaseKey)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
        const parts = line.split('=')
        if (parts.length >= 2) {
            const key = parts[0].trim()
            const value = parts.slice(1).join('=').trim()
            if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value
            if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value
            if (key === 'SUPABASE_SERVICE_ROLE_KEY') serviceRoleKey = value
        }
    })
}

// Prefer service role key if available for administrative tasks
const supabase = createClient(supabaseUrl!, serviceRoleKey || supabaseKey!)

const email = 'tazahd54@gmail.com'
const password = 'admin1'

async function seedAdmin() {
    console.log('🌱 Seeding admin account...')

    // 1. Check if user exists (by trying to sign in)
    let { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (!user) {
        console.log('User does not exist (or password wrong). Creating user...')
        // 2. Create user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'System Admin',
                }
            }
        })

        if (signUpError) {
            console.error('❌ Error creating user:', signUpError.message)
            return
        }

        user = signUpData.user
        if (user) {
            console.log('✅ User created successfully.')
        } else {
            console.log('⚠️ User creation initiated, but no user returned (maybe verification required?).')
            // If verification is needed, we might not be able to proceed without manual intervention or service role
        }
    } else {
        console.log('✅ User already exists.')
    }

    if (!user) return

    // 3. Ensure profile exists and has admin role
    // We update the profile. If using ANON key, RLS might block 'admin' role assignment depending on policy.
    // Ideally we assume the user has a way to bypass this or the policy allows it for the first user (unlikely)
    // or we are just hoping it works/logging instructions.

    console.log('🔄 updating profile role to admin...')

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

    if (updateError) {
        console.error('❌ Error updating profile role:', updateError.message)
        console.log('⚠️ If you see RLS error, you need to set the role manually in Supabase dashboard or use a SERVICE_ROLE_KEY.')
    } else {
        console.log('✅ Profile role updated to admin.')
    }
}

seedAdmin()
