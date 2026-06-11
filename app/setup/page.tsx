'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const NICHE_OPTIONS = [
  { value: 'cafe', label: '☕ Cafe / Warung Kopi', desc: 'Nobar, promo match-day, minuman' },
  { value: 'seller', label: '📦 Seller Online / Toko', desc: 'Marketplace, toko online, produk fisik' },
  { value: 'barber', label: '✂️ Barbershop', desc: 'Potong rambut, grooming, booking' },
  { value: 'distro', label: '👕 Distro / Fashion Lokal', desc: 'Pakaian, aksesoris, brand lokal' },
  { value: 'general', label: '🏪 Bisnis Umum', desc: 'Semua jenis bisnis lainnya' },
]

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [form, setForm] = useState({
    bisnis_name: '', niche: '', tagline: '', kota: '',
    wa_number: '', link_toko: '', logo_url: '', poster_tagline: '',
  })

  useEffect(() => { loadExisting() }, [])

  async function loadExisting() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase.from('kickoff_sessions').select('*').eq('user_id', user.id).single()
    if (data) setForm(data)
  }

  const NICHE_POSTER_EXAMPLES: Record<string, string[]> = {
    cafe: ['NOBAR PIALA DUNIA 2026', 'NONTON BARENG DI SINI', 'MATCH DAY VIBES'],
    seller: ['WORLD CUP SALE 2026', 'PROMO SPESIAL WORLD CUP', 'BELANJA HEMAT MUSIM BOLA'],
    barber: ['FRESH CUT WORLD CUP 2026', 'TAMPIL KEREN MUSIM BOLA', 'RAPIIN DULU SEBELUM NOBAR'],
    distro: ['WORLD CUP DROP 2026', 'SPORTY COLLECTION IS HERE', 'NEW DROP MUSIM BOLA'],
    general: ['PIALA DUNIA 2026', 'WORLD CUP VIBES', 'SIAPA JAGOANMU?'],
  }

  const LOGO_LIMITS = {
    maxSizeBytes: 2 * 1024 * 1024,
    maxSizeMB: 2,
    minDimension: 100,
    maxDimension: 2000,
    allowedFormats: ['image/png', 'image/jpeg', 'image/webp'],
  }

  async function validateLogo(file: File): Promise<string | null> {
    if (!LOGO_LIMITS.allowedFormats.includes(file.type)) {
      return `Format tidak didukung. Gunakan PNG, JPG, atau WebP.`
    }
    if (file.size > LOGO_LIMITS.maxSizeBytes) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1)
      return `File terlalu besar (${sizeMB}MB). Maksimal ${LOGO_LIMITS.maxSizeMB}MB.`
    }
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        if (img.width < LOGO_LIMITS.minDimension || img.height < LOGO_LIMITS.minDimension) {
          resolve(`Logo terlalu kecil (${img.width}x${img.height}px). Minimal ${LOGO_LIMITS.minDimension}x${LOGO_LIMITS.minDimension}px.`)
        } else if (img.width > LOGO_LIMITS.maxDimension || img.height > LOGO_LIMITS.maxDimension) {
          resolve(`Logo terlalu besar (${img.width}x${img.height}px). Maksimal ${LOGO_LIMITS.maxDimension}x${LOGO_LIMITS.maxDimension}px.`)
        } else {
          resolve(null)
        }
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve('File tidak valid atau rusak.') }
      img.src = url
    })
  }

  async function uploadLogo(file: File) {
    setLogoError('')
    const err = await validateLogo(file)
    if (err) { setLogoError(err); return }
    setLogoUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `kickoff-logos/${user.id}.${ext}`
      const { error } = await supabase.storage.from('kickoff-assets').upload(path, file, { upsert: true })
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('kickoff-assets').getPublicUrl(path)
        setForm(f => ({ ...f, logo_url: publicUrl }))
      } else {
        setLogoError('Upload gagal. Coba lagi.')
      }
    } finally {
      setLogoUploading(false)
    }
  }

  async function handleSave() {
    if (!form.bisnis_name || !form.niche) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('kickoff_sessions').upsert({ ...form, user_id: user.id })
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'white', border: '1px solid #e5e7eb',
    color: '#111', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, letterSpacing: 1.5, color: '#00c853',
    textTransform: 'uppercase', fontWeight: 700,
    marginBottom: 6, display: 'block',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 24px' }}>
        <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 3, textTransform: 'uppercase', color: '#111' }}>
          Kick<span style={{ color: '#00c853' }}>Off</span> Studio
        </div>
      </header>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#00c853', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Setup Bisnis</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', letterSpacing: 1, marginBottom: 8 }}>Data bisnis kamu</h1>
          <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.6 }}>Input sekali, dipakai untuk semua konten 38 hari World Cup.</p>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>

          <div>
            <label style={labelStyle}>Nama Bisnis *</label>
            <input style={inputStyle} placeholder="contoh: Warung Kopi Maju"
              value={form.bisnis_name} onChange={e => setForm(f => ({ ...f, bisnis_name: e.target.value }))} />
          </div>

          <div>
            <label style={labelStyle}>Jenis Bisnis *</label>
            <div style={{ display: 'grid', gap: 8 }}>
              {NICHE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setForm(f => ({ ...f, niche: opt.value }))} style={{
                  padding: '12px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  background: form.niche === opt.value ? '#f0fdf4' : 'white',
                  border: `1px solid ${form.niche === opt.value ? '#00c853' : '#e5e7eb'}`,
                  color: '#111',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tagline Bisnis <span style={{ color: '#d1d5db', fontWeight: 400 }}>(opsional — muncul di caption)</span></label>
            <input style={inputStyle} placeholder="contoh: Kopi Enak, Harga Bersahabat"
              value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} />
          </div>

          <div>
            <label style={labelStyle}>Teks Headline Poster <span style={{ color: '#d1d5db', fontWeight: 400 }}>(muncul besar di image)</span></label>
            <input style={inputStyle}
              placeholder={form.niche ? (NICHE_POSTER_EXAMPLES[form.niche]?.[0] || 'WORLD CUP 2026') : 'Pilih niche dulu...'}
              value={form.poster_tagline}
              onChange={e => setForm(f => ({ ...f, poster_tagline: e.target.value.toUpperCase() }))} />
            {form.niche && NICHE_POSTER_EXAMPLES[form.niche] && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>Contoh untuk {form.niche}:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {NICHE_POSTER_EXAMPLES[form.niche].map(ex => (
                    <button key={ex} onClick={() => setForm(f => ({ ...f, poster_tagline: ex }))}
                      style={{ padding: '4px 10px', fontSize: 11, fontFamily: 'monospace', background: form.poster_tagline === ex ? '#111' : '#f3f4f6', color: form.poster_tagline === ex ? 'white' : '#374151', border: `1px solid ${form.poster_tagline === ex ? '#111' : '#e5e7eb'}`, cursor: 'pointer' }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Kota <span style={{ color: '#d1d5db', fontWeight: 400 }}>(opsional)</span></label>
            <input style={inputStyle} placeholder="contoh: Jakarta Selatan"
              value={form.kota} onChange={e => setForm(f => ({ ...f, kota: e.target.value }))} />
          </div>

          <div>
            <label style={labelStyle}>Nomor WhatsApp <span style={{ color: '#d1d5db', fontWeight: 400 }}>(opsional)</span></label>
            <input style={inputStyle} placeholder="contoh: 08123456789"
              value={form.wa_number} onChange={e => setForm(f => ({ ...f, wa_number: e.target.value }))} />
          </div>

          <div>
            <label style={labelStyle}>Link Toko / Bio <span style={{ color: '#d1d5db', fontWeight: 400 }}>(opsional)</span></label>
            <input style={inputStyle} placeholder="contoh: linktr.ee/namatoko"
              value={form.link_toko} onChange={e => setForm(f => ({ ...f, link_toko: e.target.value }))} />
          </div>

          <div>
            <label style={labelStyle}>Logo Bisnis <span style={{ color: '#d1d5db', fontWeight: 400 }}>(Pro & Max — untuk inject ke image)</span></label>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, lineHeight: 1.6 }}>
              Format: PNG, JPG, WebP &nbsp;·&nbsp; Maks 2MB &nbsp;·&nbsp; Ukuran: 100×100px – 2000×2000px
            </div>
            {form.logo_url && (
              <div style={{ marginBottom: 10, padding: 12, background: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={form.logo_url} alt="logo" style={{ height: 56, objectFit: 'contain', display: 'block' }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>Logo terupload ✓</div>
                  <button onClick={() => setForm(f => ({ ...f, logo_url: '' }))} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}>Hapus</button>
                </div>
              </div>
            )}
            <input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]) }}
              style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }} />
            {logoUploading && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Uploading...</div>}
            {logoError && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>⚠ {logoError}</div>}
          </div>

          <button onClick={handleSave} disabled={loading || !form.bisnis_name || !form.niche} style={{
            padding: '13px', fontSize: 13, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', border: 'none', transition: 'all 0.15s', cursor: 'pointer',
            background: (!form.bisnis_name || !form.niche) ? '#e5e7eb' : '#111',
            color: (!form.bisnis_name || !form.niche) ? '#9ca3af' : 'white',
          }}>
            {loading ? 'Menyimpan...' : 'Simpan & Mulai Generate →'}
          </button>

        </div>
      </div>
    </div>
  )
}
