'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ActivatePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleActivate() {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Aktivasi gagal')
        return
      }
      router.push('/setup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', color: '#111' }}>
          Kick<span style={{ color: '#00c853' }}>Off</span> Studio
        </div>
        <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>World Cup 2026 Content Generator</div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '40px', width: '100%', maxWidth: 420, borderRadius: 2 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#00c853', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Aktivasi Akun</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 8 }}>Masukkan kode aktivasi</h2>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
            Kode dikirim setelah pembayaran berhasil. Format: <span style={{ fontFamily: 'monospace', color: '#111' }}>KICKBASIC-2026-XXXX</span>
          </p>
        </div>

        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleActivate()}
          placeholder="KICKBASIC-2026-XXXX"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${error ? '#ef4444' : '#e5e7eb'}`,
            fontSize: 14,
            fontFamily: 'monospace',
            letterSpacing: 1,
            outline: 'none',
            marginBottom: 8,
            boxSizing: 'border-box',
            color: '#111',
          }}
        />

        {error && (
          <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>⚠ {error}</div>
        )}

        <button
          onClick={handleActivate}
          disabled={loading || !code.trim()}
          style={{
            width: '100%',
            padding: '12px',
            background: (!code.trim() || loading) ? '#e5e7eb' : '#00c853',
            color: (!code.trim() || loading) ? '#aaa' : '#000',
            border: 'none',
            cursor: (!code.trim() || loading) ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            transition: 'all 0.15s',
          }}
        >
          {loading ? 'Memvalidasi...' : 'Aktivasi Sekarang'}
        </button>

        <div style={{ marginTop: 20, fontSize: 12, color: '#aaa', textAlign: 'center' }}>
          Belum punya kode? <a href="/" style={{ color: '#00c853', textDecoration: 'none', fontWeight: 600 }}>Lihat paket →</a>
        </div>
      </div>
    </div>
  )
}
