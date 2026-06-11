'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    num: '01',
    title: 'Aktivasi Akun',
    icon: '🔑',
    content: [
      { q: 'Cara aktivasi setelah beli', a: 'Setelah pembayaran berhasil, kamu dapat kode aktivasi via email. Format kode: KICKBASIC-2026-XXXX, KICKPRO-2026-XXXX, atau KICKMAX-2026-XXXX.' },
      { q: 'Cara masukkan kode', a: 'Login dengan Google → masuk ke halaman Aktivasi → ketik kode persis seperti yang diterima → klik Aktivasi Sekarang. Kode hanya bisa dipakai sekali.' },
      { q: 'Kode tidak valid', a: 'Pastikan kode diketik lengkap dan huruf besar semua. Kalau masih error, hubungi support via WA.' },
    ]
  },
  {
    num: '02',
    title: 'Setup Bisnis',
    icon: '🏪',
    content: [
      { q: 'Field apa yang wajib diisi', a: 'Hanya Nama Bisnis dan Jenis Bisnis yang wajib. Sisanya opsional, tapi makin lengkap makin personal caption yang dihasilkan.' },
      { q: 'Teks Headline Poster itu apa', a: 'Teks besar yang muncul di image poster kamu. Contoh: "NOBAR PIALA DUNIA 2026" untuk cafe, "WORLD CUP SALE 2026" untuk seller online. Klik contoh yang muncul di bawah field untuk isi otomatis.' },
      { q: 'Upload logo (Pro & Max)', a: 'Logo bisnis kamu akan di-inject ke setiap image yang di-generate. Format: PNG, JPG, atau WebP. Ukuran: minimal 100×100px, maksimal 2000×2000px, maks 2MB.' },
      { q: 'Bisa ganti data bisnis nanti?', a: 'Bisa — klik tombol "Ganti Bisnis" di dashboard. Caption yang sudah di-generate tidak berubah. Caption hari-hari berikutnya akan pakai data bisnis baru.' },
    ]
  },
  {
    num: '03',
    title: 'Generate Caption',
    icon: '📝',
    content: [
      { q: 'Cara generate caption', a: 'Pilih tanggal → kalau ada beberapa pertandingan pilih yang mana → klik Generate Caption. AI akan buat caption yang sudah dipersonalisasi dengan nama bisnis, niche, dan konteks pertandingan.' },
      { q: 'Berapa alternatif yang didapat', a: 'Basic: 2 alternatif per hari. Pro: 3 alternatif. Max: 5 alternatif. Semua sudah disesuaikan dengan niche bisnismu.' },
      { q: 'Bisa regenerate?', a: 'Bisa, tapi ada batasnya. Basic: 1x generate per hari. Pro: 2x. Max: 3x. Setelah limit tercapai, hasil terakhir yang tersimpan.' },
      { q: 'Bisa edit caption sebelum posting?', a: 'Bisa — klik tombol EDIT di bawah alternatif yang mau diubah. Edit bebas, lalu klik SELESAI. Tombol COPY akan ambil versi yang sudah kamu edit.' },
      { q: 'Caption hilang setelah refresh', a: 'Caption tersimpan otomatis di akun kamu. Kalau tidak muncul setelah refresh, coba pilih ulang tanggalnya.' },
    ]
  },
  {
    num: '04',
    title: 'Generate Image',
    icon: '🖼️',
    content: [
      { q: 'Image tersedia di tier mana', a: 'Basic: tidak ada image generation, tapi dapat image prompt untuk dipakai sendiri di ChatGPT. Pro: image feed (1 per hari). Max: image feed 2 variasi + image story.' },
      { q: 'Cara pilih style', a: 'Di tab Image, pilih Style dan Tema Warna sebelum klik Generate. Ada 7 style: Poster Photo, Poster Text, Poster Kartun, Jersey Mockup, Stadion Vibe, Countdown, Score Card.' },
      { q: 'Cara pilih tema warna', a: 'Ada 6 tema: Dark Sporty, Neon Night, Warm Indonesian, Clean White, Vintage Street, Tropical Vibe. Pilih yang paling cocok dengan brand bisnismu.' },
      { q: 'Logo bisnis muncul di mana', a: 'Logo di-inject ke area atas poster. Pastikan sudah upload logo di halaman Setup Bisnis. Hanya tersedia untuk tier Pro dan Max.' },
      { q: 'Image hilang setelah refresh', a: 'Image tersimpan di cloud dan seharusnya muncul setelah refresh. Kalau tidak muncul, kemungkinan ada error saat upload — coba generate ulang.' },
      { q: 'Cara download image', a: 'Klik tombol DOWNLOAD di bawah image. File PNG akan langsung tersimpan ke perangkat kamu.' },
    ]
  },
  {
    num: '05',
    title: 'Image Prompt (Basic)',
    icon: '💡',
    content: [
      { q: 'Image prompt itu apa', a: 'Kalau kamu tier Basic, kamu tidak bisa generate image langsung di app. Tapi kamu dapat image prompt — teks instruksi yang bisa kamu paste ke ChatGPT atau tools AI lain untuk generate image sendiri.' },
      { q: 'Cara pakai image prompt', a: 'Setelah generate caption, scroll ke bawah dan klik "Lihat Prompt". Copy teksnya, buka ChatGPT (perlu Plus), paste di kolom chat, dan generate image di sana.' },
      { q: 'Kenapa promptnya berbeda dengan tier Pro/Max', a: 'Sengaja. Basic dapat prompt generik yang bisa dipakai, Pro/Max dapat prompt yang jauh lebih detail dan spesifik — hasilnya juga lebih bagus.' },
    ]
  },
  {
    num: '06',
    title: 'Jadwal & Pertandingan',
    icon: '⚽',
    content: [
      { q: 'Tanggal mana saja yang tersedia', a: 'Semua 38 hari World Cup 2026 — dari 12 Juni sampai 19 Juli 2026. Pilih tanggal di bagian atas dashboard.' },
      { q: 'Beberapa pertandingan dalam satu hari', a: 'Kalau ada lebih dari satu pertandingan di hari itu, akan muncul pilihan pertandingan. Pilih satu → caption dan image akan spesifik untuk pertandingan itu.' },
      { q: 'Caption untuk hari tanpa pertandingan', a: 'Tidak bisa generate — caption dan image selalu terhubung ke pertandingan spesifik.' },
    ]
  },
  {
    num: '07',
    title: 'Quota & Limit',
    icon: '📊',
    content: [
      { q: 'Berapa total caption yang didapat', a: 'Semua tier dapat 38 hari caption — satu per hari selama World Cup berlangsung.' },
      { q: 'Berapa total image yang didapat', a: 'Basic: 0 image. Pro: 38 image feed. Max: 76 image feed (2 per hari) + 38 image story.' },
      { q: 'Quota sisa bisa dilihat di mana', a: 'Di header dashboard — tertera Caption X/38, Feed X/38, dst.' },
      { q: 'Quota habis sebelum World Cup selesai', a: 'Kalau quota caption habis sebelum hari ke-38, berarti kamu sudah generate untuk semua hari. Kalau image habis lebih cepat karena regenerate, tidak bisa tambah.' },
    ]
  },
]

export default function HelpPage() {
  const router = useRouter()
  const [openStep, setOpenStep] = useState<number | null>(0)
  const [openItem, setOpenItem] = useState<string | null>(null)

  const s = {
    page: { minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif', color: '#111' },
    header: { background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 },
    brand: { fontWeight: 900, fontSize: 18, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#111' },
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.brand}>Kick<span style={{ color: '#00c853' }}>Off</span> Studio</div>
        <button onClick={() => router.push('/dashboard')} style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '7px 16px', cursor: 'pointer' }}>
          ← Kembali ke Dashboard
        </button>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: '#00c853', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Panduan Penggunaan</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111', marginBottom: 8 }}>Cara Pakai KickOff Studio</h1>
          <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.6 }}>Semua yang perlu kamu tahu untuk generate konten World Cup 2026 dalam hitungan menit.</p>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {STEPS.map((step, si) => (
            <div key={si} style={{ background: 'white', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {/* Step Header */}
              <button
                onClick={() => setOpenStep(openStep === si ? null : si)}
                style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#00c853', fontWeight: 700, minWidth: 24 }}>{step.num}</span>
                <span style={{ fontSize: 18 }}>{step.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111', flex: 1 }}>{step.title}</span>
                <span style={{ fontSize: 12, color: '#9ca3af', transform: openStep === si ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
              </button>

              {/* Step Content */}
              {openStep === si && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '4px 0 12px' }}>
                  {step.content.map((item, ii) => {
                    const key = `${si}-${ii}`
                    const isOpen = openItem === key
                    return (
                      <div key={ii} style={{ borderBottom: ii < step.content.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                        <button
                          onClick={() => setOpenItem(isOpen ? null : key)}
                          style={{ width: '100%', padding: '12px 20px 12px 58px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, background: isOpen ? '#f9fafb' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', flex: 1 }}>{item.q}</span>
                          <span style={{ fontSize: 11, color: '#d1d5db', flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: '4px 20px 14px 58px', fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Support */}
        <div style={{ marginTop: 32, background: 'white', border: '1px solid #e5e7eb', padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 6 }}>Masih ada pertanyaan?</div>
          <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
            Hubungi support via WhatsApp — kami respon dalam 1×24 jam kerja.
          </div>
          <a href="https://wa.me/62xxxxxxxxx" target="_blank" style={{ display: 'inline-block', marginTop: 12, padding: '9px 20px', background: '#111', color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: 1, textDecoration: 'none' }}>
            HUBUNGI SUPPORT →
          </a>
        </div>
      </div>
    </div>
  )
}
