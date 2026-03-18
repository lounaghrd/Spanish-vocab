import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ansrjcvtqalqlatbsdut.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OYfCLe3VI4SA00RGBbfW9A_7VWYKIfO';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
