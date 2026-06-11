'use client'

import { useRouter } from 'next/navigation'

const STEPS = [
  {
    num: '01',
    title: 'Beli & Aktivasi',
    desc: 'Pilih paket di landing page, selesaikan pembayaran, dan kamu akan dapat kode aktivasi. Masukkan kode saat pertama kali login.',
    items: [
      'Kode format: KICKBASIC-2026-XXXX / KICKPRO-2026-XXXX / KICKMAX-2026-XXXX',
      'Kode hanya bisa dipakai satu kali per akun',
      'Login pakai Google — tidak perlu daftar manual',
    ],
    color: '#00c853',
  },
  {
    num: '02',
    title: 'Setup Data Bisnis',
    desc: 'Isi data bisnis kamu sekali saja. Semua konten yang di-generate akan otomatis dipersonalisasi berdasarkan data ini.',
    items: [
      'Nama bisnis, niche, tagline bisnis',
      'Teks headline poster — muncul besar di image (contoh disediakan per niche)',
      'WA, link toko, kota — untuk CTA di caption',
      'Upload logo (Pro & Max) — inject langsung ke image yang di-generate',
    ],
    color: '#00c853',
  },
  {
    num: '03',
    title: 'Pilih Tanggal & Pertandingan',
    desc: 'Dashboard menampilkan semua tanggal World Cup 2026. Pilih hari yang mau kamu buat kontennya.',
    items: [
      'Klik tanggal di bagian atas dashboard',
      'Kalau ada lebih dari 1 pertandingan hari itu, pilih yang mana dulu',
      'Sistem otomatis tahu nama tim, jam WIB, dan fase pertandingan',
    ],
    color: '#00c853',
  },
  {
    num: '04',
    title: 'Generate Caption',
    desc: 'Klik "Generate Caption" untuk membuat caption siap posting. Caption disesuaikan dengan niche bisnis dan pertandingan hari itu.',
    items: [
      'Dapat beberapa alternatif sekaligus (Basic: 2x, Pro: 3x, Max: 5x)',
      'Klik EDIT untuk ubah caption sebelum di-copy',
      'Klik COPY untuk salin ke clipboard',
      'Bisa regenerate dengan batas per hari (Basic: 1x, Pro: 2x, Max: 3x)',
      'Caption tersimpan otomatis — tidak hilang saat refresh',
    ],
    color: '#00c853',
  },
  {
    num: '05',
    title: 'Generate Image',
    desc: 'Buka tab Image, pilih style dan tema warna, lalu generate. Image disesuaikan dengan niche bisnis dan pertandingan yang dipilih.',
    items: [
      '7 style: Poster Photo, Poster Teks, Kartun, Jersey Mockup, Stadion, Countdown, Score Card',
      '6 tema warna: Dark Sporty, Neon Night, Warm Indonesian, Clean White, Vintage Street, Tropical Vibe',
      'Pro: 38 image feed (1 per hari)',
      'Max: 76 image feed (2 variasi per hari) + 38 image story',
      'Logo bisnis otomatis di-inject ke image (Pro & Max)',
      'Download langsung dari dashboard',
    ],
    color: '#f59e0b',
  },
  {
    num: '06',
    title: 'Image Prompt (Basic)',
    desc: 'Pengguna Basic mendapat image prompt yang bisa dipakai sendiri di ChatGPT atau Midjourney.',
    items: [
      'Muncul di bawah caption setelah generate',
      'Klik "Lihat Prompt" untuk tampilkan',
      'Copy prompt, paste ke ChatGPT image gen atau Midjourney',
      'Hasil lebih bagus kalau upgrade ke Pro/Max — image di-generate langsung di app',
    ],
    color: '#6b7280',
  },
]

const TIERS = [
  {
    name: 'Basic',
    price: 'Rp49.000',
    color: '#6b7280',
    features: [
      '2 alternatif caption per hari',
      'Caption 38 hari otomatis',
      'Jadwal pertandingan real WIB',
      'Image prompt generik (buat sendiri)',
      'Regenerate caption 1x per hari',
    ],
  },
  {
    name: 'Pro',
    price: 'Rp99.000',
    color: '#00c853',
    features: [
      '3 alternatif caption per hari',
      'Caption 38 hari otomatis',
      '38 image feed siap download',
      'Image prompt detail',
      'Logo inject ke image',
      'Regenerate caption 2x per hari',
    ],
  },
  {
    name: 'Max',
    price: 'Rp199.000',
    color: '#f59e0b',
    features: [
      '5 alternatif caption per hari',
      'Caption 38 hari otomatis',
      '76 image feed (2 variasi/hari)',
      '38 image story',
      'Logo inject ke semua image',
      'Image prompt detail',
      'Regenerate caption 3x per hari',
    ],
  },
]

const FAQ = [
  {
    q: 'Apakah konten bisa dipakai untuk semua jenis bisnis?',
    a: 'Ya. KickOff Studio punya 5 niche: cafe/warung kopi, seller online, barbershop, distro/fashion, dan bisnis umum. Caption dan image di-generate khusus per niche — seller tidak akan dapat konten nobar, barber dapat konten tampil fresh, dan seterusnya.',
  },
  {
    q: 'Bagaimana cara upload logo?',
    a: 'Di halaman Setup Bisnis, ada field upload logo. Format yang didukung: PNG, JPG, WebP. Ukuran maksimal 2MB, dimensi minimal 100×100px. Logo akan otomatis di-inject ke setiap image yang di-generate (fitur Pro & Max).',
  },
  {
    q: 'Kalau hari itu ada banyak pertandingan, bagaimana?',
    a: 'Dashboard menampilkan semua pertandingan hari itu. Kamu bisa pilih pertandingan mana yang mau dijadikan konten. Caption dan image akan disesuaikan dengan pertandingan yang dipilih.',
  },
  {
    q: 'Apakah image bisa di-regenerate?',
    a: 'Image tidak bisa di-regenerate — setiap generate langsung pakai credit. Pastikan style dan tema warna sudah sesuai sebelum generate. Caption bisa di-regenerate dengan batas per tier.',
  },
  {
    q: 'Apakah konten hilang kalau browser di-refresh?',
    a: 'Tidak. Semua caption dan image tersimpan otomatis di server. Buka dashboard kapan saja, data tetap ada.',
  },
  {
    q: 'Apakah bisa ganti data bisnis setelah setup?',
    a: 'Bisa. Klik tombol "Ganti Bisnis" di dashboard. Caption yang sudah di-generate tidak akan berubah, tapi hari yang belum di-generate akan pakai data bisnis yang baru.',
  },
]

export default function HowToUsePage() {
  const router = useRouter()

  const s = {
    page: { minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif', color: '#111' },
    header: { background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 50 },
    brand: { fontWeight: 900, fontSize: 18, letterSpacing: 3, textTransform: 'uppercase' as const },
    container: { maxWidth: 760, margin: '0 auto', padding: '40px 24px' },
    section: { marginBottom: 56 },
    sectionLabel: { fontSize: 10, letterSpacing: 2, color: '#00c853', textTransform: 'uppercase' as const, fontWeight: 700, marginBottom: 8 },
    sectionTitle: { fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 6 },
    sectionDesc: { fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 28 },
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.brand}>Kick<span style={{ color: '#00c853' }}>Off</span> Studio</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ fontSize: 12, fontWeight: 700, background: '#111', color: 'white', border: 'none', padding: '8px 18px', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' as const }}>
            Ke Dashboard →
          </button>
        </div>
      </header>

      <div style={s.container}>

        {/* Hero */}
        <div style={{ ...s.section, paddingTop: 8 }}>
          <div style={s.sectionLabel}>Panduan Penggunaan</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 12, lineHeight: 1.2 }}>
            Cara pakai<br />KickOff Studio
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 560 }}>
            Dari aktivasi sampai konten siap posting — panduan lengkap dalam 6 langkah.
          </p>
        </div>

        {/* Steps */}
        <div style={s.section}>
          <div style={{ display: 'grid', gap: 2 }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #e5e7eb', padding: '24px 28px', display: 'flex', gap: 24 }}>
                <div style={{ fontWeight: 900, fontSize: 28, color: step.color, fontFamily: 'monospace', minWidth: 48, lineHeight: 1 }}>
                  {step.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#111', marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 12 }}>{step.desc}</div>
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
                    {step.items.map((item, j) => (
                      <li key={j} style={{ fontSize: 12, color: '#374151', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: step.color, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Comparison */}
        <div style={s.section}>
          <div style={s.sectionLabel}>Perbandingan Paket</div>
          <h2 style={{ ...s.sectionTitle }}>Basic vs Pro vs Max</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {TIERS.map((tier, i) => (
              <div key={i} style={{ background: 'white', border: `1px solid ${tier.color}`, padding: '20px 18px' }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: tier.color, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 4 }}>{tier.name}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 16 }}>{tier.price}</div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
                  {tier.features.map((f, j) => (
                    <li key={j} style={{ fontSize: 12, color: '#374151', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ color: tier.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={s.section}>
          <div style={s.sectionLabel}>FAQ</div>
          <h2 style={s.sectionTitle}>Pertanyaan Umum</h2>
          <div style={{ display: 'grid', gap: 2 }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #e5e7eb', padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111', marginBottom: 8 }}>{item.q}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: '#111', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 }}>Sudah siap?</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Mulai generate konten World Cup bisnis kamu sekarang.</div>
          <button onClick={() => router.push('/dashboard')} style={{ background: '#00c853', color: '#000', border: 'none', padding: '12px 32px', fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, cursor: 'pointer' }}>
            Buka Dashboard →
          </button>
        </div>

      </div>
    </div>
  )
}
