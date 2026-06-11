import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: 'Kode tidak boleh kosong' }, { status: 400 })

    const normalizedCode = code.trim().toUpperCase()
    const serviceClient = createServiceClient()

    // Cek kode
    const { data: activation } = await serviceClient
      .from('kickoff_activation_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single()

    if (!activation) {
      return NextResponse.json({ error: 'Kode tidak valid' }, { status: 400 })
    }

    if (activation.used_by) {
      return NextResponse.json({ error: 'Kode sudah digunakan' }, { status: 400 })
    }

    // Cek apakah user sudah punya credits
    const { data: existingCredits } = await serviceClient
      .from('kickoff_credits')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    if (existingCredits) {
      return NextResponse.json({ error: 'Akun ini sudah aktif' }, { status: 400 })
    }

    // Aktivasi tier
    await serviceClient.rpc('kickoff_activate_tier', {
      p_user_id: user.id,
      p_tier: activation.tier
    })

    // Mark kode as used
    await serviceClient
      .from('kickoff_activation_codes')
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq('code', normalizedCode)

    return NextResponse.json({ success: true, tier: activation.tier })

  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json({ error: 'Aktivasi gagal' }, { status: 500 })
  }
}
