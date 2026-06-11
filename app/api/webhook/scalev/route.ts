import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// ScaleV webhook — dipanggil setelah pembayaran berhasil
// Setup di ScaleV: POST ke https://your-domain.vercel.app/api/webhook/scalev
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validasi webhook dari ScaleV
    // Sesuaikan dengan format webhook ScaleV kamu
    const { email, product_code, status } = body

    if (status !== 'paid') {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // Tentukan tier dari product_code
    let tier: 'basic' | 'pro' | 'max' | null = null
    if (product_code?.includes('BASIC')) tier = 'basic'
    else if (product_code?.includes('PRO')) tier = 'pro'
    else if (product_code?.includes('MAX')) tier = 'max'

    if (!tier) {
      return NextResponse.json({ error: 'Unknown product code' }, { status: 400 })
    }

    // Cari user berdasarkan email
    const serviceClient = createServiceClient()
    const { data: { users } } = await serviceClient.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
      // User belum register — simpan pending activation
      // Bisa ditangani dengan table kickoff_pending_activations
      console.log(`Pending activation for ${email}, tier ${tier}`)
      return NextResponse.json({ ok: true, pending: true })
    }

    // Aktivasi tier
    await serviceClient.rpc('kickoff_activate_tier', {
      p_user_id: user.id,
      p_tier: tier
    })

    console.log(`Activated ${tier} for ${email}`)
    return NextResponse.json({ ok: true, activated: true, tier })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
