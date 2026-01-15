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

async function attemptSelfPromotion() {
    console.log('🛠️  Attempting to self-promote user to admin...')

    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (loginError || !user) {
        console.error('❌ Login failed.')
        return
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' } as any) // Type assertion if types prevent it
        .eq('id', user.id)

    if (updateError) {
        console.error('❌ Failed to update role via client:', updateError.message)
        console.log('   Row Level Security is correctly preventing self-promotion (which is good for security, but bad for this script).')
        console.log('   You MUST go to Supabase Dashboard -> Table Editor -> profiles -> Manually change role to "admin".')
    } else {
        console.log('✅ SUCCESS! Updated role to "admin".')
        console.log('   (Note: You should lock this down in RLS later)')
    }
}

attemptSelfPromotion()
