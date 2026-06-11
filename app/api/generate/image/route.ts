import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { buildImagePrompt, BisnisData, ColorTheme } from '@/lib/prompts'
import { getMatchesByDate } from '@/lib/matches'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// Style names are handled directly in buildImagePrompt (lib/prompts.ts)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { match_date, match_id, format, variant = 1, style = 'poster_text', color_theme = 'dark_sporty' } = await req.json()
    if (!match_date || !format) return NextResponse.json({ error: 'match_date dan format required' }, { status: 400 })

    const serviceClient = createServiceClient()
    const { data: credits } = await serviceClient
      .from('kickoff_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!credits) return NextResponse.json({ error: 'No active subscription' }, { status: 403 })

    // Cek limit
    if (format === 'feed') {
      if (credits.image_feed_limit === 0) return NextResponse.json({ error: 'Upgrade ke Pro untuk generate image.' }, { status: 403 })
      if (credits.image_feed_used >= credits.image_feed_limit) return NextResponse.json({ error: 'Image feed credit habis' }, { status: 403 })
    }
    if (format === 'story') {
      if (credits.image_story_limit === 0) return NextResponse.json({ error: 'Upgrade ke Max untuk image story.' }, { status: 403 })
      if (credits.image_story_used >= credits.image_story_limit) return NextResponse.json({ error: 'Image story credit habis' }, { status: 403 })
    }

    const { data: session } = await supabase
      .from('kickoff_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!session) return NextResponse.json({ error: 'Setup bisnis dulu' }, { status: 400 })

    const matches = getMatchesByDate(match_date)
    const match = match_id ? matches.find(m => m.id === match_id) || matches[0] : matches[0]
    if (!match) return NextResponse.json({ error: 'Tidak ada pertandingan' }, { status: 400 })

    const bisnis: BisnisData = {
      bisnis_name: session.bisnis_name,
      niche: session.niche,
      tagline: session.tagline,
      poster_tagline: session.poster_tagline,
      kota: session.kota,
      wa_number: session.wa_number,
      link_toko: session.link_toko,
    }

    // Pass style name directly — buildImagePrompt handles full prompt per style
    const validStyles = ['poster_photo', 'poster_text', 'poster_cartoon', 'jersey_mockup', 'stadium_vibe', 'countdown', 'score_card']
    const activeStyle = validStyles.includes(style) ? style : 'poster_photo'
    const hasLogo = credits.logo_inject && !!session.logo_url
    const imagePrompt = buildImagePrompt(bisnis, match, format, credits.image_prompt_detail, variant, activeStyle, color_theme as ColorTheme, hasLogo)
    
    console.log('--- IMAGE PROMPT ---')
    console.log(imagePrompt)
    console.log('--- END PROMPT ---')

    // Generate image — dengan atau tanpa logo inject
    let b64: string | null = null
    let rawUrl: string | null = null

    if (credits.logo_inject && session.logo_url) {
      // Logo inject: fetch logo, convert ke base64, pass sebagai reference image
      try {
        const logoRes = await fetch(session.logo_url)
        const logoBuffer = await logoRes.arrayBuffer()
        const logoBase64 = Buffer.from(logoBuffer).toString('base64')
        const logoMime = logoRes.headers.get('content-type') || 'image/png'

        const logoPromptAddition = `\n\nIMPORTANT: The reference image provided is the business logo for "${session.bisnis_name}". Incorporate this logo naturally and prominently in the design — place it at the top of the poster, clearly visible. Keep the logo recognizable and do not distort it.`

        // Pakai responses API untuk image generation dengan reference image
        const response = await (openai as any).responses.create({
          model: 'gpt-4o',
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_image',
                  image_url: `data:${logoMime};base64,${logoBase64}`,
                },
                {
                  type: 'input_text',
                  text: imagePrompt + logoPromptAddition,
                }
              ]
            }
          ],
          tools: [{ type: 'image_generation', quality: 'medium', size: format === 'feed' ? '1024x1536' : '1024x1536' }],
        })

        // Extract image dari response
        const imageGenCall = response.output?.find((o: any) => o.type === 'image_generation_call')
        if (imageGenCall?.result) {
          b64 = imageGenCall.result
        }
      } catch (logoError) {
        console.error('Logo inject failed, fallback to standard generate:', logoError)
      }
    }

    // Fallback atau non-logo: pakai standard images.generate
    if (!b64 && !rawUrl) {
      const imageResponse = await openai.images.generate({
        model: 'gpt-image-1',
        prompt: imagePrompt,
        n: 1,
        size: format === 'feed' ? '1024x1536' : '1024x1536',
        quality: 'medium',
      })
      b64 = imageResponse.data?.[0]?.b64_json || null
      rawUrl = imageResponse.data?.[0]?.url || null
    }

    if (!b64 && !rawUrl) return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })

    // Upload ke Supabase Storage
    let publicUrl = rawUrl || ''
    if (b64) {
      const buffer = Buffer.from(b64, 'base64')
      const storagePath = `kickoff-images/${user.id}/${match_date}/${format}-v${variant}-${style}.png`
      
      console.log('Uploading to storage:', storagePath)
      const { error: uploadError } = await serviceClient.storage
        .from('kickoff-assets')
        .upload(storagePath, buffer, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        // Fallback: simpan sebagai data URL supaya tidak hilang
        publicUrl = `data:image/png;base64,${b64}`
      } else {
        const { data: urlData } = serviceClient.storage
          .from('kickoff-assets')
          .getPublicUrl(storagePath)
        publicUrl = urlData.publicUrl
        console.log('Upload success, publicUrl:', publicUrl)
      }
    }
    
    if (!publicUrl) {
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
    }

    // Update credit
    if (format === 'feed') {
      await serviceClient.from('kickoff_credits')
        .update({ image_feed_used: credits.image_feed_used + 1 })
        .eq('user_id', user.id)
    } else {
      await serviceClient.from('kickoff_credits')
        .update({ image_story_used: credits.image_story_used + 1 })
        .eq('user_id', user.id)
    }

    // Simpan URL ke outputs — pakai maybeSingle() supaya tidak throw error
    const { data: existingOutput } = await supabase
      .from('kickoff_outputs')
      .select('captions, image_prompts, image_feed_urls, image_story_urls, regen_count')
      .eq('user_id', user.id)
      .eq('match_date', match_date)
      .maybeSingle()

    const feedUrls = (existingOutput?.image_feed_urls || []).filter(Boolean)
    const storyUrls = (existingOutput?.image_story_urls || []).filter(Boolean)

    const newFeedUrls = format === 'feed' ? [...feedUrls, publicUrl] : feedUrls
    const newStoryUrls = format === 'story' ? [...storyUrls, publicUrl] : storyUrls

    console.log('Saving to DB — feed:', newFeedUrls, 'story:', newStoryUrls)

    const { error: upsertError } = await supabase.from('kickoff_outputs').upsert({
      user_id: user.id,
      match_date,
      match_info: match,
      // Preserve existing captions dan image_prompts
      captions: existingOutput?.captions || null,
      image_prompts: existingOutput?.image_prompts || null,
      regen_count: existingOutput?.regen_count || 0,
      image_feed_urls: newFeedUrls,
      image_story_urls: newStoryUrls,
    }, { onConflict: 'user_id,match_date' })

    if (upsertError) {
      console.error('Upsert error:', upsertError)
    } else {
      console.log('DB save success')
    }

    return NextResponse.json({ image_url: publicUrl, format, variant, style })

  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
  }
}
