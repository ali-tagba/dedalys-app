import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient(request.headers.get('authorization'))
        const { data, error } = await supabase
            .from('utilisateurs')
            .select('id, nom, prenom, email, role_cabinet')
            .order('nom', { ascending: true })

        if (error) throw error
        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('GET /api/v1/utilisateurs error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
