const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || supabaseUrl.includes('YOUR_PROJECT_REF')) {
  throw new Error('SUPABASE_URL must be set in server/.env')
}
if (!supabaseKey || supabaseKey.includes('PLACE_SERVER_ONLY_SECRET_HERE')) {
  throw new Error('SUPABASE_SECRET_KEY must be set in server/.env')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

module.exports = { supabase }
