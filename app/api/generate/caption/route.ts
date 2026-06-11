import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { buildCaptionPrompt, BisnisData } from '@/lib/prompts'
import { getMatchesByDate } from '@/lib/matches'

const BLACKBOX_URL = 'https://api.blackbox.ai/chat/completions'
const BLACKBOX_KEY = process.env.BLACKBOX_API_KEY!
const MODEL = 'blackboxai/anthropic/claude-sonnet-4.6'

async function callClaude(systemPrompt: string, userContent: string, maxTokens = 2000): Promise<string[]> {
  const res = await fetch(BLACKBOX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BLACKBOX_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    })
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Blackbox API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  
  // Strip markdown code blocks
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  
  // Try direct JSON parse first
  try {
    const parsed = JSON.parse(clean)
    if (parsed.captions && Array.isArray(parsed.captions)) {
      return parsed.captions
    }
  } catch {
    // JSON parse failed — try to extract captions array manually
  }
  
  // Fallback: extract JSON object more aggressively
  const jsonMatch = clean.match(/\{[\s\S]*"captions"[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.captions && Array.isArray(parsed.captions)) {
        return parsed.captions
      }
    } catch {
      // Still failed
    }
  }

  // Last fallback: extract array directly
  const arrayMatch = clean.match(/"captions"\s*:\s*(\[[\s\S]*?\])/)
  if (arrayMatch) {
    try {
      const captions = JSON.parse(arrayMatch[1])
      if (Array.isArray(captions)) return captions
    } catch {
      // Give up
    }
  }

  console.error('Failed to parse captions from response:', clean.slice(0, 500))
  throw new Error('Gagal parse response dari AI')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { match_date, match_id } = await req.json()
    if (!match_date) return NextResponse.json({ error: 'match_date required' }, { status: 400 })

    // Cek credits
    const serviceClient = createServiceClient()
    const { data: credits } = await serviceClient
      .from('kickoff_credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!credits) return NextResponse.json({ error: 'No active subscription' }, { status: 403 })
    if (credits.caption_days_used >= credits.caption_days_limit) {
      return NextResponse.json({ error: 'Caption credit habis' }, { status: 403 })
    }

    // Regen limit per tier: basic=1, pro=2, max=3
    const regenLimit = credits.tier === 'basic' ? 1 : credits.tier === 'pro' ? 2 : 3

    // Cek apakah sudah pernah generate hari ini
    const { data: existingOutput } = await supabase
      .from('kickoff_outputs')
      .select('captions, image_prompts')
      .eq('user_id', user.id)
      .eq('match_date', match_date)
      .maybeSingle()

    // Cek regen count — kalau sudah mencapai limit, kembalikan cache
    const regenCount = (existingOutput as any)?.regen_count || 0
    if (existingOutput?.captions && regenCount >= regenLimit) {
      return NextResponse.json({ captions: existingOutput.captions, cached: true, regen_limit_reached: true })
    }

    // Ambil data bisnis
    const { data: session } = await supabase
      .from('kickoff_sessions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!session) return NextResponse.json({ error: 'Setup bisnis dulu' }, { status: 400 })

    // Ambil pertandingan
    const matches = getMatchesByDate(match_date)
    const match = match_id ? matches.find(m => m.id === match_id) || matches[0] : matches[0]

    if (!match) return NextResponse.json({ error: 'Tidak ada pertandingan pada tanggal ini' }, { status: 400 })

    const bisnis: BisnisData = {
      bisnis_name: session.bisnis_name,
      niche: session.niche,
      tagline: session.tagline,
      kota: session.kota,
      wa_number: session.wa_number,
      link_toko: session.link_toko,
    }

    const systemPrompt = `Kamu adalah copywriter Indonesia yang ahli membuat caption Instagram untuk bisnis lokal UMKM. 
Selalu balas dalam format JSON valid saja, tanpa penjelasan, tanpa markdown backticks.`

    const userPrompt = buildCaptionPrompt(bisnis, match, credits.caption_variants, credits.tier)

    const captions = await callClaude(systemPrompt, userPrompt)

    // Generate image prompt (disimpan untuk ditampilkan di UI)
    const { buildImagePrompt } = await import('@/lib/prompts')
    const imgPrompt = buildImagePrompt(bisnis, match, 'feed', credits.image_prompt_detail, 1)

    // Simpan output
    const isFirstGenerate = !existingOutput?.captions
    const { error: upsertErr } = await supabase
      .from('kickoff_outputs')
      .upsert({
        user_id: user.id,
        match_date,
        match_info: match,
        captions,
        image_prompts: [imgPrompt],
        regen_count: regenCount + 1,
      }, { onConflict: 'user_id,match_date' })
    if (upsertErr) console.error('Caption upsert error:', upsertErr)
    else console.log('Caption saved to DB successfully')

    // Increment credit hanya kalau generate pertama kali (bukan regenerate)
    if (isFirstGenerate) {
      await serviceClient
        .from('kickoff_credits')
        .update({ caption_days_used: credits.caption_days_used + 1 })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ captions, match, image_prompt: imgPrompt })

  } catch (error) {
    console.error('Caption generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
