import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
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
