const { createClient } = require('@supabase/supabase-js');

// 🔑 Used ONLY to verify user tokens
const supabaseAuthClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 🔐 Used for backend inserts bypassing RLS
const supabaseServiceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

module.exports = { supabaseAuthClient, supabaseServiceClient };