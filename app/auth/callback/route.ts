import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      // Cek credits (sudah aktivasi?)
      const { data: credits } = await supabase
        .from('kickoff_credits')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!credits) return NextResponse.redirect(`${origin}/activate`)

      // Cek session bisnis
      const { data: session } = await supabase
        .from('kickoff_sessions')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!session) return NextResponse.redirect(`${origin}/setup`)

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
