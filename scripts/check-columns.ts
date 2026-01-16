
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

async function checkColumns() {
    console.log('Listing shops...')
    const { data: shops, error } = await supabase
        .from('shops')
        .select('*')
        .limit(1)

    if (error) {
        console.log('Error:', error.message)
    } else if (shops && shops.length > 0) {
        console.log('Keys:', Object.keys(shops[0]).join(', '))
        const hasStatus = Object.keys(shops[0]).includes('status')
        console.log('Has "status" column:', hasStatus)
        if (!hasStatus) {
            console.log('CRITICAL: "status" column matches missing!')
        }
    } else {
        console.log('No shops found')
    }
}

checkColumns()
