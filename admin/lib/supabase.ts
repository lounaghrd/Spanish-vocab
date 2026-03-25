import { createClient } from '@supabase/supabase-js';

// Server-side only — uses the secret key that bypasses Row Level Security.
// Never use this client in browser code.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export default supabaseAdmin;
