'use client'

import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const supabase = createClient()

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: '#111', marginBottom: 6 }}>
          Kick<span style={{ color: '#00c853' }}>Off</span> Studio
        </div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>World Cup 2026 Content Generator</div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '40px', width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: '#00c853', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Masuk ke Akun</div>
        <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
          Masuk dengan Google untuk mulai generate konten World Cup bisnis kamu.
        </p>
        <button
          onClick={loginWithGoogle}
          style={{
            width: '100%', padding: '13px',
            background: '#111', color: 'white',
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, letterSpacing: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'opacity 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7 28.9 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.8 18.9 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.4 7 28.9 5 24 5c-7.7 0-14.3 4.4-17.7 9.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 36.3 26.7 37 24 37c-5.3 0-9.7-3-11.3-7.1l-6.5 5C9.6 40.7 16.3 45 24 45z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C36.9 40.9 44 35 44 25c0-1.3-.1-2.6-.4-3.9z"/></svg>
          Masuk dengan Google
        </button>
        <div style={{ marginTop: 16, fontSize: 11, color: '#d1d5db' }}>
          Belum punya akses? <a href="/#harga" style={{ color: '#00c853', textDecoration: 'none', fontWeight: 600 }}>Lihat paket →</a>
        </div>
      </div>

    </div>
  )
}
