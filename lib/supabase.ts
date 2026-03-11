import { createClient } from '@supabase/supabase-js';

// Public (read-only) credentials — safe to ship inside the mobile app.
// Row Level Security policies on Supabase ensure this key can only read data.
const SUPABASE_URL = 'https://ansrjcvtqalqlatbsdut.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OYfCLe3VI4SA00RGBbfW9A_7VWYKIfO';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
  },
});
