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
  { value: 'poster_photo', label: 'Poster Photo', emoji: '📸' },
  { value: 'poster_text', label: 'Poster Text', emoji: '🔤' },
  { value: 'poster_cartoon', label: 'Kartun', emoji: '🎨' },
  { value: 'jersey_mockup', label: 'Jersey', emoji: '⚡' },
  { value: 'stadium_vibe', label: 'Stadion', emoji: '🏟️' },
  { value: 'countdown', label: 'Countdown', emoji: '⏱️' },
  { value: 'score_card', label: 'Score Card', emoji: '📺' },
]

const TIER_COLORS: Record<string, string> = {
  basic: '#6b7280',
  pro: '#00c853',
  max: '#f59e0b'
}

type Tab = 'jadwal' | 'caption' | 'image' | 'akun'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  // Core state
  const [credits, setCredits] = useState<Credits | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('jadwal')

  // Match state
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedMatchId, setSelectedMatchId] = useState('')

  // Caption state
  const [captions, setCaptions] = useState<string[]>([])
  const [editedCaptions, setEditedCaptions] = useState<string[]>([])
  const [editingCaptionIdx, setEditingCaptionIdx] = useState<number | null>(null)
  const [imagePrompt, setImagePrompt] = useState('')
  const [promptVisible, setPromptVisible] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [regenLimitReached, setRegenLimitReached] = useState(false)

  // Image state
  const [imageUrls, setImageUrls] = useState<{ feed: string[], story: string[] }>({ feed: [], story: [] })
  const [selectedStyle, setSelectedStyle] = useState('poster_photo')
  const [selectedColorTheme, setSelectedColorTheme] = useState('dark_sporty')

  // Loading state
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Modal state
  const [showChangeBisnisModal, setShowChangeBisnisModal] = useState(false)

  const matchDates = getMatchDates()
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const nearestDate = matchDates.find(d => d >= todayStr) || matchDates[0]

  useEffect(() => { loadData(); setSelectedDate(nearestDate) }, [])
  useEffect(() => {
    if (selectedDate) { setSelectedMatchId(''); loadExistingOutput() }
  }, [selectedDate])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const [{ data: c }, { data: s }] = await Promise.all([
      supabase.from('kickoff_credits').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('kickoff_sessions').select('*').eq('user_id', user.id).maybeSingle(),
    ])
    if (!c) { router.push('/activate'); return }
    if (!s) { router.push('/setup'); return }
    setCredits(c); setSession(s)
  }

  async function loadExistingOutput() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('kickoff_outputs')
      .select('captions, image_feed_urls, image_story_urls, image_prompts, regen_count')
      .eq('user_id', user.id)
      .eq('match_date', selectedDate)
      .maybeSingle()
    if (data) {
      if (data.captions) { setCaptions(data.captions); setEditedCaptions(data.captions) }
      else { setCaptions([]); setEditedCaptions([]) }
      setImageUrls({
        feed: (data.image_feed_urls || []).filter((u: string) => u && u.startsWith('http')),
        story: (data.image_story_urls || []).filter((u: string) => u && u.startsWith('http'))
      })
      if (data.image_prompts) setImagePrompt(data.image_prompts[0] || '')
    } else {
      setCaptions([]); setEditedCaptions([])
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
      setTimeout(() => loadExistingOutput(), 500)
    }
  }

  async function generateImage(fmt: 'feed' | 'story', variant = 1) {
    setLoading(l => ({ ...l, [`${fmt}_${variant}`]: true }))
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_date: selectedDate,
          match_id: selectedMatchId || matchesOnDate[0]?.id,
          format: fmt, variant,
          style: selectedStyle,
          color_theme: selectedColorTheme
        })
      })
      const data = await res.json()
      if (data.image_url) {
        setImageUrls(prev => {
          const existing = prev[fmt] || []
          if (existing.includes(data.image_url)) return prev
          return { ...prev, [fmt]: [...existing, data.image_url] }
        })
      }
      if (data.error) alert(data.error)
    } finally {
      setLoading(l => ({ ...l, [`${fmt}_${variant}`]: false }))
      loadData()
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function copyCaption(text: string, idx: number) {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const matchesOnDate = selectedDate ? getMatchesByDate(selectedDate) : []
  const activeMatch = selectedMatchId
    ? matchesOnDate.find(m => m.id === selectedMatchId) || matchesOnDate[0]
    : matchesOnDate[0]
  const tierColor = TIER_COLORS[credits?.tier || 'basic']
  const regenLimit = credits?.tier === 'basic' ? 1 : credits?.tier === 'pro' ? 2 : 3

  // ─── STYLES ─────────────────────────────────────────────────
  const C = {
    bg: '#f8f9fa', white: '#ffffff', black: '#111111',
    green: '#00c853', greenLight: '#f0fdf4',
    border: '#e5e7eb', borderDark: '#d1d5db',
    gray: '#9ca3af', gray600: '#6b7280', gray700: '#374151',
    gold: '#f59e0b',
  }

  const pill = (active: boolean, color = C.green) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    letterSpacing: 0.5, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    background: active ? color : C.white,
    color: active ? (color === C.white ? C.black : C.white) : C.gray600,
    boxShadow: active ? `0 1px 4px ${color}44` : 'none',
  } as React.CSSProperties)

  const btn = (active = true, color = C.black) => ({
    padding: '10px 18px', fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
    border: 'none', cursor: active ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
    background: active ? color : C.border, color: active ? C.white : C.gray,
    borderRadius: 8,
  } as React.CSSProperties)

  const card = {
    background: C.white, borderRadius: 12, border: `1px solid ${C.border}`,
    overflow: 'hidden',
  } as React.CSSProperties

  // ─── RENDER ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, sans-serif', color: C.black, paddingBottom: 80 }}>

      {/* ── TOP HEADER ── */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: 2, textTransform: 'uppercase' }}>
          Kick<span style={{ color: C.green }}>Off</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {credits && (
            <span style={{ background: tierColor + '18', color: tierColor, padding: '3px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', borderRadius: 20 }}>
              {credits.tier}
            </span>
          )}
          {session && (
            <div style={{ fontSize: 12, fontWeight: 600, color: C.gray600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.bisnis_name}
            </div>
          )}
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* ═══ TAB: JADWAL ═══ */}
        {activeTab === 'jadwal' && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: C.green, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Pilih Tanggal</div>

            {/* Date scroll */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
              {matchDates.map(date => {
                const isSelected = date === selectedDate
                const isPast = date < todayStr
                const isToday = date === todayStr
                const d = parseISO(date)
                return (
                  <button key={date} onClick={() => setSelectedDate(date)} style={{
                    flexShrink: 0, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: isSelected ? C.black : isToday ? C.greenLight : C.white,
                    color: isSelected ? C.white : isPast ? C.gray : C.black,
                    outline: `2px solid ${isSelected ? C.black : isToday ? C.green : 'transparent'}`,
                    minWidth: 52, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{format(d, 'd', { locale: id })}</div>
                    <div style={{ fontSize: 9, marginTop: 2, opacity: 0.7 }}>{format(d, 'MMM', { locale: id })}</div>
                    {isToday && <div style={{ width: 4, height: 4, background: C.green, borderRadius: '50%', margin: '3px auto 0' }} />}
                  </button>
                )
              })}
            </div>

            {/* Match selector */}
            {matchesOnDate.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {matchesOnDate.map(match => {
                  const isSelected = selectedMatchId === match.id || (!selectedMatchId && match.id === matchesOnDate[0].id)
                  return (
                    <button key={match.id} onClick={() => setSelectedMatchId(match.id)} style={{
                      ...card, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                      border: `2px solid ${isSelected ? C.black : C.border}`,
                      background: isSelected ? C.black : C.white,
                    }}>
                      <div style={{ fontSize: 9, color: isSelected ? C.gold : C.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
                        {getFaseLabel(match.fase)}{match.grup ? ` · Grup ${match.grup}` : ''} · {match.jam_wib} WIB
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: isSelected ? C.white : C.black, letterSpacing: -0.3 }}>
                        {match.home} <span style={{ color: C.green, fontWeight: 400 }}>vs</span> {match.away}
                      </div>
                    </button>
                  )
                })}

                {/* Quick action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <button onClick={() => setActiveTab('caption')} style={{ ...btn(), borderRadius: 10, padding: '12px' }}>
                    📝 Generate Caption
                  </button>
                  <button
                    onClick={() => setActiveTab('image')}
                    disabled={(credits?.image_feed_limit ?? 0) === 0}
                    style={{ ...btn((credits?.image_feed_limit ?? 0) > 0, C.green), borderRadius: 10, padding: '12px' }}
                  >
                    🖼️ Generate Image
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ ...card, padding: '40px 20px', textAlign: 'center', color: C.gray }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 13 }}>Pilih tanggal yang ada pertandingannya</div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: CAPTION ═══ */}
        {activeTab === 'caption' && (
          <div>
            {/* Active match info */}
            {activeMatch && (
              <div style={{ ...card, padding: '12px 14px', marginBottom: 14, background: C.black }}>
                <div style={{ fontSize: 9, color: C.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  {getFaseLabel(activeMatch.fase)} · {activeMatch.jam_wib} WIB
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.white }}>
                  {activeMatch.home} <span style={{ color: C.green }}>vs</span> {activeMatch.away}
                </div>
              </div>
            )}

            {/* Generate button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.black }}>Caption Hari Ini</div>
                <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>
                  {credits?.caption_variants || 2} alternatif · {credits?.caption_days_used}/{credits?.caption_days_limit} hari terpakai
                </div>
              </div>
              <button
                onClick={generateCaption}
                disabled={loading.caption || regenLimitReached || !activeMatch}
                style={{ ...btn(!loading.caption && !regenLimitReached && !!activeMatch, C.green) }}
              >
                {loading.caption ? '⏳ Generating...' : captions.length > 0 ? '🔄 Regenerate' : '✨ Generate'}
              </button>
            </div>

            {regenLimitReached && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#c2410c', marginBottom: 12 }}>
                Limit regenerate tercapai untuk hari ini ({regenLimit}x)
              </div>
            )}

            {/* Caption cards */}
            {captions.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {captions.map((caption, idx) => (
                  <div key={idx} style={{ ...card, padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: 1, textTransform: 'uppercase' }}>
                        Alternatif {idx + 1}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setEditingCaptionIdx(editingCaptionIdx === idx ? null : idx)} style={{
                          fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: editingCaptionIdx === idx ? C.black : C.bg, color: editingCaptionIdx === idx ? C.white : C.gray600,
                        }}>
                          {editingCaptionIdx === idx ? 'Selesai' : 'Edit'}
                        </button>
                        <button onClick={() => copyCaption(editedCaptions[idx] || caption, idx)} style={{
                          fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: copiedIdx === idx ? C.green : C.bg, color: copiedIdx === idx ? C.white : C.gray600,
                        }}>
                          {copiedIdx === idx ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    {editingCaptionIdx === idx ? (
                      <textarea
                        value={editedCaptions[idx] || caption}
                        onChange={e => { const u = [...editedCaptions]; u[idx] = e.target.value; setEditedCaptions(u) }}
                        style={{ width: '100%', fontSize: 13, lineHeight: 1.7, color: C.gray700, border: `1px solid ${C.green}`, borderRadius: 6, padding: 10, background: C.bg, resize: 'vertical', minHeight: 140, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                    ) : (
                      <pre style={{ fontSize: 13, lineHeight: 1.7, color: C.gray700, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                        {editedCaptions[idx] || caption}
                      </pre>
                    )}
                  </div>
                ))}

                {/* Image prompt toggle */}
                {imagePrompt && (
                  <div style={{ ...card, overflow: 'hidden' }}>
                    <button
                      onClick={() => setPromptVisible(!promptVisible)}
                      style={{ width: '100%', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.gray600 }}>
                        💡 Image Prompt {credits?.tier === 'basic' ? '(Generik)' : '(Detail)'}
                      </span>
                      <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{promptVisible ? 'Sembunyikan' : 'Lihat'}</span>
                    </button>
                    {promptVisible && (
                      <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${C.border}` }}>
                        <pre style={{ fontSize: 11, lineHeight: 1.6, color: C.gray700, whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: C.bg, padding: 10, borderRadius: 6, marginTop: 10, overflow: 'auto' }}>
                          {imagePrompt}
                        </pre>
                        <button onClick={() => navigator.clipboard.writeText(imagePrompt)} style={{ marginTop: 8, ...btn(true, C.black), fontSize: 10, padding: '6px 14px' }}>
                          Copy Prompt
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ ...card, padding: '48px 20px', textAlign: 'center', color: C.gray }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: C.gray700 }}>Belum ada caption</div>
                <div style={{ fontSize: 12 }}>Klik Generate untuk mulai</div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: IMAGE ═══ */}
        {activeTab === 'image' && (
          <div>
            {/* Active match */}
            {activeMatch && (
              <div style={{ ...card, padding: '12px 14px', marginBottom: 14, background: C.black }}>
                <div style={{ fontSize: 9, color: C.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  {getFaseLabel(activeMatch.fase)} · {activeMatch.jam_wib} WIB
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.white }}>
                  {activeMatch.home} <span style={{ color: C.green }}>vs</span> {activeMatch.away}
                </div>
              </div>
            )}

            {(credits?.image_feed_limit ?? 0) === 0 ? (
              <div style={{ ...card, padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Image generation mulai tier Pro</div>
                <div style={{ fontSize: 12, color: C.gray, marginBottom: 16 }}>Upgrade ke Pro (Rp99.000) untuk generate image feed dengan logo bisnis</div>
                <a href="/" style={{ ...btn(), display: 'inline-block', textDecoration: 'none', borderRadius: 8, padding: '10px 20px' }}>
                  Lihat Paket
                </a>
              </div>
            ) : (
              <div>
                {/* Style picker */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: 1, color: C.gray600, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Style</div>
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                    {IMAGE_STYLES.map(style => {
                      const isSelected = selectedStyle === style.value
                      return (
                        <button key={style.value} onClick={() => setSelectedStyle(style.value)} style={{
                          flexShrink: 0, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: isSelected ? C.black : C.white,
                          color: isSelected ? C.white : C.gray600,
                          outline: `1px solid ${isSelected ? C.black : C.border}`,
                          fontSize: 11, fontWeight: 600, textAlign: 'center', minWidth: 70,
                        }}>
                          <div style={{ fontSize: 16, marginBottom: 2 }}>{style.emoji}</div>
                          <div>{style.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Color theme picker */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: 1, color: C.gray600, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Tema Warna</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {(Object.entries(COLOR_THEMES) as [string, typeof COLOR_THEMES[keyof typeof COLOR_THEMES]][]).map(([key, theme]) => {
                      const isSelected = selectedColorTheme === key
                      const bgMatch = theme.bg.match(/#[0-9a-fA-F]{6}/)
                      const accentMatch = theme.accent.match(/#[0-9a-fA-F]{6}/)
                      const bgColor = bgMatch ? bgMatch[0] : '#0a0a0a'
                      const accentColor = accentMatch ? accentMatch[0] : '#00c853'
                      return (
                        <button key={key} onClick={() => setSelectedColorTheme(key)} style={{
                          padding: '10px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                          background: isSelected ? bgColor : C.white,
                          border: `2px solid ${isSelected ? accentColor : C.border}`,
                          transition: 'all 0.15s',
                        }}>
                          <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                            <div style={{ width: 14, height: 14, background: bgColor, borderRadius: 3, border: `1px solid ${C.border}` }} />
                            <div style={{ width: 14, height: 14, background: accentColor, borderRadius: 3 }} />
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? accentColor : C.black }}>{theme.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Feed images */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>Image Feed</div>
                      <div style={{ fontSize: 11, color: C.gray }}>{credits?.image_feed_used}/{credits?.image_feed_limit} terpakai</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => generateImage('feed', 1)}
                        disabled={loading['feed_1'] || imageUrls.feed.length > 0 || (credits?.image_feed_used ?? 0) >= (credits?.image_feed_limit ?? 0)}
                        style={{ ...btn(!loading['feed_1'] && imageUrls.feed.length === 0 && (credits?.image_feed_used ?? 0) < (credits?.image_feed_limit ?? 0), C.green), fontSize: 11 }}
                      >
                        {loading['feed_1'] ? '⏳' : imageUrls.feed.length > 0 ? '✓ Done' : '✨ Generate'}
                      </button>
                      {credits?.tier === 'max' && (
                        <button
                          onClick={() => generateImage('feed', 2)}
                          disabled={loading['feed_2'] || imageUrls.feed.length !== 1 || (credits?.image_feed_used ?? 0) >= (credits?.image_feed_limit ?? 0)}
                          style={{ ...btn(!loading['feed_2'] && imageUrls.feed.length === 1 && (credits?.image_feed_used ?? 0) < (credits?.image_feed_limit ?? 0), C.gold), fontSize: 11 }}
                        >
                          {loading['feed_2'] ? '⏳' : 'Variasi 2'}
                        </button>
                      )}
                    </div>
                  </div>

                  {imageUrls.feed.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {imageUrls.feed.map((url, idx) => (
                        <div key={idx} style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                          <img src={url} alt={`feed ${idx + 1}`} style={{ width: '100%', display: 'block' }} />
                          <a href={url} download target="_blank" style={{ display: 'block', textAlign: 'center', padding: '8px', background: C.black, color: C.white, fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.5 }}>
                            ↓ Download
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: C.bg, borderRadius: 10, border: `1px dashed ${C.border}`, padding: '28px 20px', textAlign: 'center', color: C.gray, fontSize: 12 }}>
                      Pilih style & tema warna, lalu Generate
                    </div>
                  )}
                </div>

                {/* Story images — Max only */}
                {(credits?.image_story_limit ?? 0) > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>Image Story</div>
                        <div style={{ fontSize: 11, color: C.gray }}>{credits?.image_story_used}/{credits?.image_story_limit} terpakai</div>
                      </div>
                      <button
                        onClick={() => generateImage('story', 1)}
                        disabled={loading['story_1'] || (credits?.image_story_used ?? 0) >= (credits?.image_story_limit ?? 0)}
                        style={{ ...btn(!loading['story_1'] && (credits?.image_story_used ?? 0) < (credits?.image_story_limit ?? 0), C.gold), fontSize: 11 }}
                      >
                        {loading['story_1'] ? '⏳' : '✨ Generate Story'}
                      </button>
                    </div>
                    {imageUrls.story.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {imageUrls.story.map((url, idx) => (
                          <div key={idx} style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                            <img src={url} alt={`story ${idx + 1}`} style={{ width: '100%', display: 'block' }} />
                            <a href={url} download target="_blank" style={{ display: 'block', textAlign: 'center', padding: '8px', background: C.gold, color: C.black, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                              ↓ Download
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ background: C.bg, borderRadius: 10, border: `1px dashed ${C.border}`, padding: '28px 20px', textAlign: 'center', color: C.gray, fontSize: 12 }}>
                        Generate Story untuk hari ini
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: AKUN ═══ */}
        {activeTab === 'akun' && (
          <div style={{ display: 'grid', gap: 12 }}>

            {/* Bisnis info */}
            {session && (
              <div style={{ ...card, padding: '16px' }}>
                <div style={{ fontSize: 11, letterSpacing: 1, color: C.green, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Data Bisnis</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  {session.logo_url && (
                    <img src={session.logo_url} alt="logo" style={{ width: 48, height: 48, objectFit: 'contain', background: C.bg, borderRadius: 8, padding: 4, border: `1px solid ${C.border}` }} />
                  )}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{session.bisnis_name}</div>
                    <div style={{ fontSize: 12, color: C.gray, textTransform: 'capitalize' }}>{session.niche}{session.kota ? ` · ${session.kota}` : ''}</div>
                  </div>
                </div>
                <button onClick={() => setShowChangeBisnisModal(true)} style={{ ...btn(), fontSize: 12, width: '100%', borderRadius: 8, padding: '10px' }}>
                  Edit Data Bisnis
                </button>
              </div>
            )}

            {/* Quota */}
            {credits && (
              <div style={{ ...card, padding: '16px' }}>
                <div style={{ fontSize: 11, letterSpacing: 1, color: C.green, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Quota</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    { label: 'Caption', used: credits.caption_days_used, limit: credits.caption_days_limit, color: C.green },
                    ...(credits.image_feed_limit > 0 ? [{ label: 'Image Feed', used: credits.image_feed_used, limit: credits.image_feed_limit, color: C.gold }] : []),
                    ...(credits.image_story_limit > 0 ? [{ label: 'Image Story', used: credits.image_story_used, limit: credits.image_story_limit, color: '#a78bfa' }] : []),
                  ].map(q => (
                    <div key={q.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{q.label}</span>
                        <span style={{ fontSize: 12, color: C.gray }}>{q.used}/{q.limit}</span>
                      </div>
                      <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min((q.used / q.limit) * 100, 100)}%`, background: q.color, borderRadius: 3, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div style={{ ...card, overflow: 'hidden' }}>
              {[
                { label: '? Panduan Penggunaan', href: '/help', icon: '📖' },
              ].map(item => (
                <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', textDecoration: 'none', color: C.black, borderBottom: `1px solid ${C.bg}`, fontSize: 13, fontWeight: 500 }}>
                  <span>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span style={{ color: C.gray }}>→</span>
                </a>
              ))}
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#ef4444', textAlign: 'left' }}>
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {([
          { key: 'jadwal', label: 'Jadwal', emoji: '⚽' },
          { key: 'caption', label: 'Caption', emoji: '📝' },
          { key: 'image', label: 'Image', emoji: '🖼️' },
          { key: 'akun', label: 'Akun', emoji: '👤' },
        ] as { key: Tab; label: string; emoji: string }[]).map(tab => {
          const isActive = activeTab === tab.key
          // Badge counts
          const badge = tab.key === 'caption' && captions.length > 0 ? captions.length
            : tab.key === 'image' && imageUrls.feed.length > 0 ? imageUrls.feed.length
            : null
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: '10px 4px 8px', border: 'none', cursor: 'pointer',
              background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: isActive ? C.green : C.gray, position: 'relative',
            }}>
              {isActive && <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: C.green, borderRadius: '0 0 2px 2px' }} />}
              <span style={{ fontSize: 20 }}>{tab.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: 0.3 }}>{tab.label}</span>
              {badge && (
                <div style={{ position: 'absolute', top: 6, right: '22%', background: C.green, color: C.white, fontSize: 8, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── MODAL GANTI BISNIS ── */}
      {showChangeBisnisModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, padding: '0' }}>
          <div style={{ background: C.white, padding: '24px', width: '100%', maxWidth: 600, borderRadius: '16px 16px 0 0' }}>
            <div style={{ width: 32, height: 4, background: C.border, borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: C.black, marginBottom: 10 }}>Ganti Data Bisnis?</div>
            <p style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, marginBottom: 20 }}>
              Caption yang <strong>sudah di-generate</strong> tidak akan berubah.<br />
              Caption untuk hari yang <strong>belum di-generate</strong> akan pakai data bisnis baru.
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              <button onClick={() => { setShowChangeBisnisModal(false); router.push('/setup') }} style={{ ...btn(), borderRadius: 10, padding: '12px', width: '100%' }}>
                Lanjut Ganti
              </button>
              <button onClick={() => setShowChangeBisnisModal(false)} style={{ background: C.bg, color: C.gray700, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px', width: '100%', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
