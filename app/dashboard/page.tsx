'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getMatchDates, getMatchesByDate, getFaseLabel } from '@/lib/matches'
import { COLOR_THEMES } from '@/lib/prompts'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

interface Credits {
  tier: string
  caption_days_used: number
  caption_days_limit: number
  caption_variants: number
  image_feed_used: number
  image_feed_limit: number
  image_story_used: number
  image_story_limit: number
  image_prompt_detail: string
  logo_inject: boolean
}

interface Session {
  bisnis_name: string
  niche: string
  tagline?: string
  kota?: string
  logo_url?: string
  wa_number?: string
  link_toko?: string
}

const IMAGE_STYLES = [
  { value: 'poster_text', label: 'Poster Teks', desc: 'Tipografi bold dominan' },
  { value: 'poster_photo', label: 'Poster Foto', desc: 'Visual realistis + teks' },
  { value: 'poster_cartoon', label: 'Poster Kartun', desc: 'Ilustrasi flat & playful' },
  { value: 'jersey_mockup', label: 'Jersey Mockup', desc: 'Siluet pemain pakai kostum' },
  { value: 'stadium_vibe', label: 'Stadion Vibe', desc: 'Suasana penuh crowd' },
  { value: 'countdown', label: 'Countdown', desc: 'Hitung mundur match' },
  { value: 'score_card', label: 'Score Card', desc: 'Gaya broadcast TV' },
]

const TIER_COLORS: Record<string, string> = { basic: '#6b7280', pro: '#00c853', max: '#f59e0b' }

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [credits, setCredits] = useState<Credits | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [editingCaptionIdx, setEditingCaptionIdx] = useState<number | null>(null)
  const [editedCaptions, setEditedCaptions] = useState<string[]>([])
  const [captions, setCaptions] = useState<string[]>([])
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageUrls, setImageUrls] = useState<{ feed: string[], story: string[] }>({ feed: [], story: [] })
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'caption' | 'image'>('caption')
  const [selectedStyle, setSelectedStyle] = useState('poster_text')
  const [selectedColorTheme, setSelectedColorTheme] = useState('dark_sporty')
  const [regenLimitReached, setRegenLimitReached] = useState(false)
  const [showChangeBisnisModal, setShowChangeBisnisModal] = useState(false)
  const [promptVisible, setPromptVisible] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const matchDates = getMatchDates()
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const nearestDate = matchDates.find(d => d >= todayStr) || matchDates[0]

  useEffect(() => { loadData(); setSelectedDate(nearestDate) }, [])
  useEffect(() => { if (selectedDate) { setSelectedMatchId(''); loadExistingOutput() } }, [selectedDate])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const [{ data: c }, { data: s }] = await Promise.all([
      supabase.from('kickoff_credits').select('*').eq('user_id', user.id).single(),
      supabase.from('kickoff_sessions').select('*').eq('user_id', user.id).single(),
    ])
    if (!c) { router.push('/activate'); return }
    if (!s) { router.push('/setup'); return }
    setCredits(c)
    setSession(s)
  }

  async function loadExistingOutput() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Pakai maybeSingle() supaya tidak throw error kalau tidak ada row
    const { data, error } = await supabase
      .from('kickoff_outputs')
      .select('captions, image_feed_urls, image_story_urls, image_prompts, regen_count')
      .eq('user_id', user.id)
      .eq('match_date', selectedDate)
      .maybeSingle()

    if (error) {
      console.error('loadExistingOutput error:', error)
    }

    if (data) {
      if (data.captions) { setCaptions(data.captions); setEditedCaptions(data.captions) }
      else { setCaptions([]); setEditedCaptions([]) }
      // Filter out empty/null/data-url URLs — hanya simpan public URLs
      const feedUrls = (data.image_feed_urls || []).filter((u: string) => u && u.startsWith('http'))
      const storyUrls = (data.image_story_urls || []).filter((u: string) => u && u.startsWith('http'))
      setImageUrls({ feed: feedUrls, story: storyUrls })
      if (data.image_prompts) setImagePrompt(data.image_prompts[0] || '')
    } else {
      setCaptions([])
      setImageUrls({ feed: [], story: [] })
      setImagePrompt('')
    }
    setRegenLimitReached(false)
  }

  async function generateCaption() {
    setLoading(l => ({ ...l, caption: true }))
    try {
      const res = await fetch('/api/generate/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_date: selectedDate, match_id: selectedMatchId || matchesOnDate[0]?.id })
      })
      const data = await res.json()
      if (data.captions) { setCaptions(data.captions); setEditedCaptions(data.captions) }
      if (data.image_prompt) setImagePrompt(data.image_prompt)
      if (data.regen_limit_reached) setRegenLimitReached(true)
      if (data.error) alert(data.error)
    } finally {
      setLoading(l => ({ ...l, caption: false }))
      loadData()
      // Reload from DB supaya persist saat refresh
      setTimeout(() => loadExistingOutput(), 500)
    }
  }

  async function generateImage(fmt: 'feed' | 'story', variant = 1) {
    setLoading(l => ({ ...l, [`${fmt}_${variant}`]: true }))
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_date: selectedDate, match_id: selectedMatchId || matchesOnDate[0]?.id, format: fmt, variant, style: selectedStyle, color_theme: selectedColorTheme })
      })
      const data = await res.json()
      if (data.image_url) {
        // Langsung update state dari response — tidak tunggu reload DB
        setImageUrls(prev => {
          const existing = prev[fmt] || []
          // Hindari duplikat
          if (existing.includes(data.image_url)) return prev
          return { ...prev, [fmt]: [...existing, data.image_url] }
        })
        if (data.image_prompt) setImagePrompt(data.image_prompt)
      }
      if (data.error) alert(data.error)
    } finally {
      setLoading(l => ({ ...l, [`${fmt}_${variant}`]: false }))
      loadData() // update credit counter di header
    }
  }

  function copyCaption(text: string, idx: number) {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const tierColor = TIER_COLORS[credits?.tier || 'basic']
  const matchesOnDate = selectedDate ? getMatchesByDate(selectedDate) : []
  const selectedMatches = selectedMatchId 
    ? matchesOnDate.filter(m => m.id === selectedMatchId)
    : matchesOnDate.slice(0, 1)
  const activeMatch = selectedMatches[0] || matchesOnDate[0]
  const regenLimit = credits?.tier === 'basic' ? 1 : credits?.tier === 'pro' ? 2 : 3

  // Styles
  const s = {
    page: { minHeight: '100vh', background: '#f8f9fa', color: '#111', fontFamily: 'system-ui, sans-serif' },
    header: { background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 },
    brand: { fontWeight: 900, fontSize: 18, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#111' },
    card: { background: 'white', border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 12 },
    label: { fontSize: 10, letterSpacing: 2, color: '#00c853', textTransform: 'uppercase' as const, fontWeight: 700, marginBottom: 6, display: 'block' },
    btn: (active: boolean, color = '#00c853') => ({
      padding: '9px 20px', background: active ? color : '#f3f4f6', color: active ? (color === '#00c853' ? '#000' : '#000') : '#9ca3af',
      border: 'none', cursor: active ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700,
      letterSpacing: 1, textTransform: 'uppercase' as const, transition: 'all 0.15s',
    }),
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.brand}>Kick<span style={{ color: '#00c853' }}>Off</span> Studio</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {credits && (
            <>
              <a href='/help' style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'none', fontWeight: 600 }}>? Panduan</a>
              <button onClick={handleLogout} style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Logout</button>
              <span style={{ background: tierColor + '18', color: tierColor, padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                {credits.tier}
              </span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Caption {credits.caption_days_used}/{credits.caption_days_limit}</span>
              {credits.image_feed_limit > 0 && <span style={{ fontSize: 11, color: '#9ca3af' }}>Feed {credits.image_feed_used}/{credits.image_feed_limit}</span>}
              {credits.image_story_limit > 0 && <span style={{ fontSize: 11, color: '#9ca3af' }}>Story {credits.image_story_used}/{credits.image_story_limit}</span>}
            </>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>

        {/* Bisnis Info */}
        {session && (
          <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            {session.logo_url && <img src={session.logo_url} alt="logo" style={{ width: 44, height: 44, objectFit: 'contain', background: '#f3f4f6', padding: 4 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{session.bisnis_name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>{session.niche}{session.kota ? ` · ${session.kota}` : ''}</div>
            </div>
            <button
              onClick={() => setShowChangeBisnisModal(true)}
              style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}
            >
              Ganti Bisnis
            </button>
          </div>
        )}

        {/* Date Selector */}
        <div style={{ marginBottom: 20 }}>
          <span style={s.label}>Pilih Tanggal Pertandingan</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {matchDates.map(date => {
              const isSelected = date === selectedDate
              const isPast = date < todayStr
              return (
                <button key={date} onClick={() => setSelectedDate(date)} style={{
                  padding: '7px 12px', fontSize: 12, fontWeight: isSelected ? 700 : 400,
                  background: isSelected ? '#111' : isPast ? '#f9fafb' : 'white',
                  color: isSelected ? 'white' : isPast ? '#d1d5db' : '#374151',
                  border: `1px solid ${isSelected ? '#111' : '#e5e7eb'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {format(parseISO(date), 'd MMM', { locale: id })}
                </button>
              )
            })}
          </div>
        </div>

        {/* Match Selector */}
        {matchesOnDate.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {matchesOnDate.length > 1 && (
              <div style={{ marginBottom: 10 }}>
                <span style={s.label}>Pilih Pertandingan</span>
                <div style={{ display: 'grid', gap: 6 }}>
                  {matchesOnDate.map(match => {
                    const isSelected = selectedMatchId === match.id || (!selectedMatchId && match.id === matchesOnDate[0].id)
                    return (
                      <button key={match.id} onClick={() => setSelectedMatchId(match.id)} style={{
                        padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                        background: isSelected ? '#f0fdf4' : 'white',
                        border: `1px solid ${isSelected ? '#00c853' : '#e5e7eb'}`,
                        transition: 'all 0.15s',
                      }}>
                        <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                          {getFaseLabel(match.fase)}{match.grup ? ` · Grup ${match.grup}` : ''} · {match.jam_wib} WIB
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
                          {match.home} <span style={{ color: '#00c853' }}>vs</span> {match.away}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {activeMatch && (
              <div style={{ ...s.card, background: '#f9fafb' }}>
                <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  {getFaseLabel(activeMatch.fase)}{activeMatch.grup ? ` · Grup ${activeMatch.grup}` : ''}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: 1 }}>
                  {activeMatch.home} <span style={{ color: '#00c853' }}>vs</span> {activeMatch.away}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{activeMatch.jam_wib} WIB</div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
          {(['caption', 'image'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 24px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? '#111' : 'transparent'}`,
              color: activeTab === tab ? '#111' : '#9ca3af',
              cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase', marginBottom: -2,
            }}>
              {tab === 'caption' ? '📝 Caption' : '🖼️ Image'}
            </button>
          ))}
        </div>

        {/* CAPTION TAB */}
        {activeTab === 'caption' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                {credits?.caption_variants || 2} alternatif · max {regenLimit}x generate per hari
                {regenLimitReached && <span style={{ color: '#ef4444', marginLeft: 8, fontSize: 11 }}>Limit regenerate tercapai</span>}
              </div>
              <button onClick={generateCaption} disabled={loading.caption || regenLimitReached} style={s.btn(!loading.caption && !regenLimitReached)}>
                {loading.caption ? 'Generating...' : captions.length > 0 ? 'Regenerate' : 'Generate Caption'}
              </button>
            </div>

            {captions.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {captions.map((caption, idx) => (
                  <div key={idx} style={{ ...s.card, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ ...s.label, marginBottom: 0 }}>Alternatif {idx + 1}</span>
                      <button onClick={() => setEditingCaptionIdx(editingCaptionIdx === idx ? null : idx)} style={{
                        fontSize: 10, fontWeight: 700, background: editingCaptionIdx === idx ? '#111' : '#f3f4f6',
                        color: editingCaptionIdx === idx ? 'white' : '#6b7280',
                        border: '1px solid #e5e7eb', padding: '4px 10px', cursor: 'pointer',
                      }}>
                        {editingCaptionIdx === idx ? 'SELESAI' : 'EDIT'}
                      </button>
                    </div>
                    {editingCaptionIdx === idx ? (
                      <textarea
                        value={editedCaptions[idx] || caption}
                        onChange={e => {
                          const updated = [...editedCaptions]
                          updated[idx] = e.target.value
                          setEditedCaptions(updated)
                        }}
                        style={{
                          width: '100%', fontSize: 13, lineHeight: 1.75, color: '#374151',
                          fontFamily: 'inherit', border: '1px solid #00c853', padding: 12,
                          background: '#f9fafb', resize: 'vertical', minHeight: 160,
                          outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      <pre style={{ fontSize: 13, lineHeight: 1.75, color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'inherit', paddingRight: 70 }}>
                        {editedCaptions[idx] || caption}
                      </pre>
                    )}
                    <button onClick={() => copyCaption(editedCaptions[idx] || caption, idx)} style={{
                      position: 'absolute', top: 16, right: 16,
                      background: copiedIdx === idx ? '#00c853' : '#f3f4f6',
                      color: copiedIdx === idx ? 'white' : '#6b7280',
                      border: '1px solid #e5e7eb', padding: '5px 12px',
                      cursor: 'pointer', fontSize: 10, fontWeight: 700, transition: 'all 0.15s',
                    }}>
                      {copiedIdx === idx ? 'COPIED ✓' : 'COPY'}
                    </button>
                  </div>
                ))}

                {/* Image prompt untuk basic */}
                {imagePrompt && (
                  <div style={{ ...s.card, background: '#f9fafb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: promptVisible ? 12 : 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                        🎨 Image Prompt {credits?.tier === 'basic' ? '(Generik)' : '(Detail)'}
                      </div>
                      <button onClick={() => setPromptVisible(!promptVisible)} style={{ fontSize: 11, color: '#00c853', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {promptVisible ? 'Sembunyikan' : 'Lihat Prompt'}
                      </button>
                    </div>
                    {promptVisible && (
                      <div style={{ position: 'relative' }}>
                        <pre style={{ fontSize: 12, lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap', fontFamily: 'monospace', paddingRight: 70, background: '#f3f4f6', padding: 12 }}>
                          {imagePrompt}
                        </pre>
                        <button onClick={() => { navigator.clipboard.writeText(imagePrompt) }} style={{
                          position: 'absolute', top: 8, right: 8,
                          background: '#111', color: 'white', border: 'none',
                          padding: '4px 10px', cursor: 'pointer', fontSize: 10, fontWeight: 700,
                        }}>COPY</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ ...s.card, textAlign: 'center', padding: '48px', color: '#d1d5db' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>⚽</div>
                <div style={{ fontSize: 13 }}>Klik "Generate Caption" untuk mulai</div>
              </div>
            )}
          </div>
        )}

        {/* IMAGE TAB */}
        {activeTab === 'image' && (
          <div>
            {credits?.image_feed_limit === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Image generation tersedia mulai tier Pro</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Upgrade ke Pro (Rp99.000) untuk generate image feed dengan logo bisnis</div>
                <a href="/" style={{ background: '#111', color: 'white', padding: '10px 24px', textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                  Lihat Paket
                </a>
              </div>
            ) : (
              <div>
                {/* Style Selector */}
                <div style={{ marginBottom: 20 }}>
                  <span style={s.label}>Pilih Style Image</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {IMAGE_STYLES.map(style => (
                      <button key={style.value} onClick={() => setSelectedStyle(style.value)} style={{
                        padding: '8px 14px', fontSize: 12, fontWeight: selectedStyle === style.value ? 700 : 400,
                        background: selectedStyle === style.value ? '#111' : 'white',
                        color: selectedStyle === style.value ? 'white' : '#374151',
                        border: `1px solid ${selectedStyle === style.value ? '#111' : '#e5e7eb'}`,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                        {style.label}
                        <span style={{ display: 'block', fontSize: 10, color: '#9ca3af', fontWeight: 400 }}>{style.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Theme Picker */}
                <div style={{ marginBottom: 20 }}>
                  <span style={s.label}>Pilih Tema Warna</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {(Object.entries(COLOR_THEMES) as [string, typeof COLOR_THEMES[keyof typeof COLOR_THEMES]][]).map(([key, theme]) => {
                      const isSelected = selectedColorTheme === key
                      // Extract hex colors for preview
                      const bgMatch = theme.bg.match(/#[0-9a-fA-F]{6}/)
                      const accentMatch = theme.accent.match(/#[0-9a-fA-F]{6}/)
                      const bgColor = bgMatch ? bgMatch[0] : '#0a0a0a'
                      const accentColor = accentMatch ? accentMatch[0] : '#00c853'
                      return (
                        <button key={key} onClick={() => setSelectedColorTheme(key)} style={{
                          padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                          background: isSelected ? bgColor : 'white',
                          border: `2px solid ${isSelected ? accentColor : '#e5e7eb'}`,
                          transition: 'all 0.15s', position: 'relative',
                        }}>
                          {/* Color preview swatches */}
                          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                            <div style={{ width: 18, height: 18, background: bgColor, border: '1px solid #e5e7eb' }} />
                            <div style={{ width: 18, height: 18, background: accentColor, border: '1px solid #e5e7eb' }} />
                            {(() => {
                              const textMatch = theme.text.match(/#[0-9a-fA-F]{6}/)
                              return textMatch ? <div style={{ width: 18, height: 18, background: textMatch[0], border: '1px solid #e5e7eb' }} /> : null
                            })()}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? accentColor : '#111' }}>{theme.label}</div>
                          <div style={{ fontSize: 10, color: isSelected ? '#9ca3af' : '#9ca3af', marginTop: 2 }}>{theme.desc}</div>
                          {isSelected && <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 10, color: accentColor, fontWeight: 700 }}>✓</div>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Feed Images */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Image Feed (1080×1350)</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{credits?.image_feed_used}/{credits?.image_feed_limit} terpakai</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* Generate Feed: aktif kalau hari ini belum ada image feed */}
                      <button onClick={() => generateImage('feed', 1)}
                        disabled={loading['feed_1'] || imageUrls.feed.length > 0 || (credits?.image_feed_used ?? 0) >= (credits?.image_feed_limit ?? 0)}
                        style={s.btn(!loading['feed_1'] && imageUrls.feed.length === 0 && (credits?.image_feed_used ?? 0) < (credits?.image_feed_limit ?? 0))}>
                        {loading['feed_1'] ? 'Generating...' : imageUrls.feed.length > 0 ? 'Sudah Di-generate' : 'Generate Feed'}
                      </button>
                      {/* Variasi 2: hanya Max, aktif kalau sudah ada 1 image tapi belum ada 2 */}
                      {credits?.tier === 'max' && (
                        <button onClick={() => generateImage('feed', 2)}
                          disabled={loading['feed_2'] || imageUrls.feed.length !== 1 || (credits?.image_feed_used ?? 0) >= (credits?.image_feed_limit ?? 0)}
                          style={s.btn(!loading['feed_2'] && imageUrls.feed.length === 1 && (credits?.image_feed_used ?? 0) < (credits?.image_feed_limit ?? 0), '#f59e0b')}>
                          {loading['feed_2'] ? 'Generating...' : imageUrls.feed.length === 0 ? 'Generate Feed Dulu' : imageUrls.feed.length >= 2 ? 'Sudah 2 Variasi' : 'Variasi 2'}
                        </button>
                      )}
                    </div>
                  </div>

                  {imageUrls.feed.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                      {imageUrls.feed.map((url, idx) => (
                        <div key={idx} style={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                          <img src={url} alt={`feed ${idx + 1}`} style={{ width: '100%', display: 'block' }} />
                          <a href={url} download target="_blank" style={{
                            display: 'block', textAlign: 'center', padding: '8px',
                            background: '#111', color: 'white', fontSize: 11, fontWeight: 700,
                            textDecoration: 'none', letterSpacing: 1,
                          }}>DOWNLOAD</a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ ...s.card, textAlign: 'center', padding: '32px', color: '#d1d5db', fontSize: 13 }}>
                      Pilih style dan klik Generate Feed
                    </div>
                  )}
                </div>

                {/* Story Images — Max only */}
                {(credits?.image_story_limit ?? 0) > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Image Story (1080×1920)</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{credits?.image_story_used}/{credits?.image_story_limit} terpakai</div>
                      </div>
                      <button onClick={() => generateImage('story', 1)}
                        disabled={loading['story_1'] || (credits?.image_story_used ?? 0) >= (credits?.image_story_limit ?? 0)}
                        style={s.btn(!loading['story_1'] && (credits?.image_story_used ?? 0) < (credits?.image_story_limit ?? 0), '#f59e0b')}>
                        {loading['story_1'] ? 'Generating...' : 'Generate Story'}
                      </button>
                    </div>

                    {imageUrls.story.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                        {imageUrls.story.map((url, idx) => (
                          <div key={idx} style={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                            <img src={url} alt={`story ${idx + 1}`} style={{ width: '100%', display: 'block' }} />
                            <a href={url} download target="_blank" style={{ display: 'block', textAlign: 'center', padding: '6px', background: '#f59e0b', color: '#000', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                              DOWNLOAD
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ ...s.card, textAlign: 'center', padding: '32px', color: '#d1d5db', fontSize: 13 }}>
                        Pilih style dan klik Generate Story
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Ganti Bisnis */}
      {showChangeBisnisModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'white', padding: '32px', maxWidth: 420, width: '100%', borderRadius: 2 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 12 }}>Ganti Data Bisnis?</div>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
              Caption yang <strong>sudah di-generate</strong> tidak akan berubah dan tetap tersimpan.<br /><br />
              Caption untuk hari yang <strong>belum di-generate</strong> akan otomatis menggunakan data bisnis baru.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowChangeBisnisModal(false); router.push('/setup') }} style={{
                flex: 1, padding: '11px', background: '#111', color: 'white', border: 'none',
                cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1,
              }}>Lanjut Ganti</button>
              <button onClick={() => setShowChangeBisnisModal(false)} style={{
                flex: 1, padding: '11px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb',
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
              }}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
