// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

/**
 * The Supabase project that will replace WordPress as the identity provider.
 *
 * The anon key is meant to be public — it identifies the project and nothing
 * else. Every rule that matters is enforced server-side.
 */
const SUPABASE_URL = 'https://urvfnsimzrfxwhisydpt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydmZuc2ltenJmeHdoaXN5ZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MzQyMjQsImV4cCI6MjEwMzUxMDIyNH0._3PMipX99zsTpz_ie-oPw0jONhMWA_C5Egt1NyR7Cd0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // The session lives in localStorage and refreshes itself, which is what
    // lets tokenService stop hand-rolling a 45-minute refresh timer.
    persistSession: true,
    autoRefreshToken: true,
    // The password-reset link comes back with the session in the URL fragment.
    detectSessionInUrl: true,
    storageKey: 'pc-auth',
  },
});

export default supabase;
