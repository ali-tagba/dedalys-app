import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xgytxckiatphdxkifctb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneXR4Y2tpYXRwaGR4a2lmY3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzYwMjksImV4cCI6MjA4NzQxMjAyOX0.TNBhUzExcC1hz_h_Ab3SuX9ctrr6p7igVPHt6L9jmdA'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Creates a Supabase client authenticated as the current user.
 * Pass the Authorization header value (Bearer token) from the incoming request.
 * The RLS policies will automatically restrict access to the user's espace_id.
 */
export function createServerClient(authHeader: string | null) {
    const token = authHeader?.replace(/^Bearer\s+/i, '')

    if (token) {
        // Use the user's JWT – RLS policies will enforce espace_id
        return createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: `Bearer ${token}` },
            },
        })
    }

    // Fallback: if no token, use service role key (admin bypass – use with caution)
    if (supabaseServiceKey) {
        return createClient(supabaseUrl, supabaseServiceKey)
    }

    // Last resort: anon client (queries will fail on RLS-protected tables)
    return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Creates an admin Supabase client using the service role key.
 * This bypasses RLS entirely. Use only for trusted server-side operations.
 */
export function createAdminClient() {
    if (!supabaseServiceKey) {
        // Fallback to anon if no service key – may not work with RLS-protected tables
        return createClient(supabaseUrl, supabaseAnonKey)
    }
    return createClient(supabaseUrl, supabaseServiceKey)
}
