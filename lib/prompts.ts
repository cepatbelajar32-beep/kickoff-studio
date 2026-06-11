import { Match, getFaseLabel } from './matches'
import { Tier } from './tiers'

// ============================================
// COLOR THEMES
// ============================================
export const COLOR_THEMES = {
  dark_sporty: {
    label: 'Dark Sporty',
    bg: 'deep black (#0a0a0a)',
    accent: 'electric green (#00c853)',
    text: 'pure white (#ffffff)',
    desc: 'Hitam + hijau neon'
  },
  neon_night: {
    label: 'Neon Night',
    bg: 'very dark navy (#050510)',
    accent: 'electric blue and purple neon (#4040ff, #cc00ff)',
    text: 'bright white (#ffffff)',
    desc: 'Navy gelap + neon biru-ungu'
  },
  warm_indonesian: {
    label: 'Warm Indonesian',
    bg: 'warm dark brown (#1a0a00)',
    accent: 'warm orange and red (#ff6600, #cc2200)',
    text: 'warm cream white (#fff8ee)',
    desc: 'Coklat hangat + oranye merah'
  },
  clean_white: {
    label: 'Clean White',
    bg: 'bright white (#ffffff)',
    accent: 'bold black (#111111) and green (#00c853)',
    text: 'bold black (#111111)',
    desc: 'Putih bersih + hitam bold'
  },
  vintage_street: {
    label: 'Vintage Street',
    bg: 'aged dark brown (#1c1007)',
    accent: 'golden yellow (#ffd600) and rusty orange (#cc5500)',
    text: 'aged cream (#f5e6c8)',
    desc: 'Coklat vintage + emas'
  },
  tropical_vibe: {
    label: 'Tropical Vibe',
    bg: 'deep tropical green (#001a0a)',
    accent: 'bright yellow-green (#aaff00) and cyan (#00ffcc)',
    text: 'bright white (#ffffff)',
    desc: 'Hijau tropis + kuning neon'
  },
} as const

export type ColorTheme = keyof typeof COLOR_THEMES

// ============================================
// BISNIS DATA
// ============================================
export interface BisnisData {
  bisnis_name: string
  niche: 'cafe' | 'seller' | 'barber' | 'distro' | 'general'
  tagline?: string
  poster_tagline?: string
  kota?: string
  wa_number?: string
  link_toko?: string
}

// ============================================
// CAPTION HELPERS
// ============================================
function getNicheContext(niche: BisnisData['niche']): string {
  const contexts = {
    cafe: 'cafe atau warung kopi — fokus pada nobar, suasana nonton bareng, promo match-day, ajak pelanggan datang',
    seller: 'seller online atau toko — fokus pada promo produk, stok ready, momentum belanja World Cup, bukan tentang nonton bola',
    barber: 'barbershop — fokus pada tampil fresh, booking sebelum ramai, gaya rambut baru buat momen World Cup',
    distro: 'brand distro atau fashion lokal — fokus pada outfit sporty, new drop, koleksi musim World Cup',
    general: 'bisnis lokal — fokus murni pada engagement: ajak interaksi, diskusi, polling tim favorit, bukan promosi produk',
  }
  return contexts[niche]
}

function getNicheAngle(niche: BisnisData['niche'], match: Match): string {
  const angles: Record<string, string> = {
    cafe: `ANGLE — CAFE / WARUNG KOPI:
Tulis dari sudut pandang cafe yang mengajak pelanggan datang nonton bareng.
Fokus pada: suasana nobar, promo match-day, ajak datang sebelum penuh, kopi/minuman ready.
Sebutkan pertandingan ${match.home} vs ${match.away} jam ${match.jam_wib} WIB sebagai momen spesifik.
JANGAN tulis tentang jualan produk fisik atau online store.`,

    seller: `ANGLE — SELLER ONLINE / TOKO:
Tulis dari sudut pandang toko yang memanfaatkan momentum World Cup untuk promosi produk.
Fokus pada: promo/diskon produk, stok ready, pengiriman cepat, bundel spesial World Cup.
World Cup hanya sebagai momentum — bukan tentang nonton bola atau nobar.
JANGAN tulis "nobar", "nonton bareng", atau ajakan ke tempat fisik.
Pertandingan ${match.home} vs ${match.away} bisa disebut ringan sebagai konteks momen, bukan fokus utama.`,

    barber: `ANGLE — BARBERSHOP:
Tulis dari sudut pandang barbershop yang mengajak pelanggan tampil fresh selama World Cup.
Fokus pada: gaya rambut baru, fresh cut sebelum nonton, booking sekarang sebelum antrian panjang, promo potong.
Kaitkan dengan World Cup sebagai momen tampil terbaik, bukan tentang nonton bola itu sendiri.
JANGAN tulis tentang jualan produk atau nobar di tempat lain.`,

    distro: `ANGLE — DISTRO / FASHION LOKAL:
Tulis dari sudut pandang brand distro yang riding momen sporty World Cup.
Fokus pada: outfit sporty, new drop, koleksi limited, street style yang cocok untuk nonton dan hangout.
World Cup = musim untuk tampil keren, bukan tentang nonton bola atau nobar.
JANGAN tulis "nobar", "nonton bareng", atau ajakan ke tempat fisik.`,

    general: `ANGLE — ENGAGEMENT MURNI:
Tulis konten yang memancing interaksi follower — bukan jualan, bukan promo, bukan nobar.
Fokus pada: polling tim favorit, prediksi pemenang, pertanyaan seru seputar World Cup, meme-worthy moments.
Sebutkan pertandingan ${match.home} vs ${match.away} sebagai topik diskusi.
JANGAN tulis promosi produk, ajakan beli, atau CTA yang sifatnya commercial.
CTA-nya hanya: komen, tag teman, jawab pertanyaan.`,
  }
  return angles[niche] || angles.general
}

// ============================================
// BUILD CAPTION PROMPT
// ============================================
export function buildCaptionPrompt(
  bisnis: BisnisData,
  match: Match,
  variants: number,
  tier: Tier
): string {
  const fase = getFaseLabel(match.fase)
  const isKnockout = ['r16', 'qf', 'sf', 'final', '3rd'].includes(match.fase)
  const matchDesc = isKnockout
    ? `${fase} — pertandingan besar malam ini`
    : `${fase} — ${match.home} vs ${match.away}, Grup ${match.grup}`

  const ctaInfo = [
    bisnis.wa_number ? `WA: ${bisnis.wa_number}` : '',
    bisnis.link_toko ? `Link: ${bisnis.link_toko}` : '',
    bisnis.kota ? `Kota: ${bisnis.kota}` : '',
  ].filter(Boolean).join(' | ')

  return `Kamu adalah copywriter Indonesia yang ahli marketing digital, khususnya untuk Gen Z dan Millennial (usia 18–35 tahun).

Buat ${variants} alternatif caption Instagram untuk bisnis berikut:

BISNIS:
- Nama: ${bisnis.bisnis_name}
- Jenis: ${getNicheContext(bisnis.niche)}
- Tagline: ${bisnis.tagline || '-'}
- ${ctaInfo || 'Kontak: (isi sendiri)'}

KONTEKS WORLD CUP:
- Tanggal: ${match.date}
- Jam: ${match.jam_wib} WIB
- Pertandingan: ${matchDesc}

${getNicheAngle(bisnis.niche, match)}

INSTRUKSI TONE & STYLE:
- Target: Gen Z dan Millennial Indonesia — mereka scroll cepat, butuh hook yang bikin berhenti
- Tone: conversational, relatable, ada humor ringan sesekali — seperti teman yang nulis, bukan brand besar
- Mix bahasa Indonesia kasual + Inggris secukupnya (vibes, match day, literally, ngl, dsb)
- Hook di baris pertama harus kuat — pertanyaan, statement bold, atau relatable moment
- Variasikan angle tiap alternatif: jangan semua promo, mix antara engagement/humor/FOMO/storytelling
- Panjang: 5–10 baris — mobile-friendly, tidak bertele-tele
- CTA natural di akhir, bukan hard sell
- 2–3 hashtag yang relevan dan tidak spammy
- ${tier === 'basic' ? 'Konteks pertandingan cukup general (World Cup 2026)' : `Sebut spesifik: ${matchDesc}`}

HINDARI:
- Kalimat template kayak "Yuk segera order!" atau "Jangan sampai ketinggalan!!!"
- Tanda seru berlebihan
- Emoji berlebihan (max 3–4 per caption)
- Bahasa formal atau kaku

FORMAT OUTPUT — WAJIB DIIKUTI:
- Balas HANYA dengan satu JSON object, tidak ada teks lain sebelum atau sesudahnya
- Tidak ada markdown, tidak ada backtick, tidak ada penjelasan
- Setiap caption adalah satu string — gunakan \n untuk baris baru di dalam caption
- Jangan gunakan double quote di dalam teks caption — ganti dengan tanda kutip tunggal atau hapus
- Format: {"captions": ["caption satu...", "caption dua..."]}
- Jumlah caption tepat ${variants} buah`
}

// ============================================
// IMAGE PROMPT HELPERS
// ============================================
function getNicheVisual(niche: BisnisData['niche']): string {
  const visuals: Record<string, string> = {
    cafe: 'Indonesian warung kopi / café — steaming coffee cups, warm amber lighting, cozy wooden interior, people gathering',
    seller: 'Indonesian online seller workspace — product packages, boxes, bubble wrap, mobile phone with shop app open, desk setup',
    barber: 'Indonesian barbershop interior — classic barber chair, mirrors, scissors and clippers on shelf, grooming products, urban street outside window',
    distro: 'Indonesian streetwear distro store — clothing racks with sporty apparel, sneaker display, urban youth, graffiti art on walls',
    general: 'vibrant Indonesian urban street — local community, colorful storefronts, people gathered together',
  }
  return visuals[niche] || visuals.general
}

function getNichePromoContext(niche: BisnisData['niche'], businessName: string): string {
  const contexts: Record<string, string> = {
    cafe: `This is a WATCH PARTY / NOBAR promotion for "${businessName}" café — people coming to watch football together, café atmosphere is the hero`,
    seller: `This is a PRODUCT PROMOTION for "${businessName}" online store — focus on products, packages, shopping energy. NOT about watching football together`,
    barber: `This is a BARBERSHOP PROMOTION for "${businessName}" — fresh haircut for World Cup season. NOT about watching football together`,
    distro: `This is a FASHION / STREETWEAR PROMOTION for "${businessName}" — sporty outfit drop for World Cup season. NOT about watching football together`,
    general: `This is an ENGAGEMENT POST for "${businessName}" — football excitement, community energy, World Cup atmosphere`,
  }
  return contexts[niche] || contexts.general
}

function buildColorSpec(colorTheme: ColorTheme): string {
  const theme = COLOR_THEMES[colorTheme]
  return `COLOR SCHEME — strictly follow this palette:
- Background: ${theme.bg}
- Primary accent / highlight color: ${theme.accent}
- Text color: ${theme.text}
Override any default color tendencies — this color scheme is mandatory.`
}

// ============================================
// BUILD IMAGE PROMPT
// ============================================
export function buildImagePrompt(
  bisnis: BisnisData,
  match: Match,
  format: 'feed' | 'story',
  detail: 'basic' | 'detail',
  variant: number = 1,
  style: string = 'poster_photo',
  colorTheme: ColorTheme = 'dark_sporty',
  hasLogo: boolean = false
): string {
  const fase = getFaseLabel(match.fase)
  const isKnockout = ['r16', 'qf', 'sf', 'final'].includes(match.fase)
  const matchText = isKnockout ? fase.toUpperCase() : `${match.home} vs ${match.away}`
  const ratio = format === 'feed' ? '4:5 ratio (1080x1350px)' : '9:16 ratio vertical (1080x1920px)'
  const businessName = bisnis.bisnis_name
  const tagline = bisnis.tagline || ''
  const nicheVisual = getNicheVisual(bisnis.niche)
  const colorSpec = buildColorSpec(colorTheme)
  const nichePromoContext = getNichePromoContext(bisnis.niche, businessName)

  if (detail === 'basic') {
    return `World Cup 2026 promotional poster for a local business.
Business name: ${businessName}
Match: ${matchText} at ${match.jam_wib} WIB
Format: ${format === 'feed' ? 'Instagram feed 4:5' : 'Instagram story 9:16'}
Style: sporty poster with football elements.
Include the business name and match info as text. No official FIFA logos.`
  }

  // Shared text block for all styles
  const logoInstructions = hasLogo
    ? `LOGO INTEGRATION (reference image provided):
- The reference image is the business logo for "${businessName}"
- Place it at the TOP of the poster — top-left or top-center
- Keep it clean, legible, and proportional — do not distort, warp, or over-stylize
- Minimum visible size: logo must be clearly readable, not tiny
- The logo should feel like it belongs in the design, not pasted on top`
    : `BUSINESS NAME TREATMENT:
- No logo provided — render "${businessName}" as a clean text lockup at the top
- Use the accent color for the business name text to make it stand out`

  const textBlock = `
PROMO CONTEXT — this determines what the poster is about:
${nichePromoContext}

TEXT TO RENDER (use these exact words):
- Business name: "${businessName}"${tagline ? ` with tagline: "${tagline}"` : ''}
- "${bisnis.poster_tagline || 'WORLD CUP 2026'}"
- "${matchText}"
- "${match.jam_wib} WIB"

${logoInstructions}

${colorSpec}

FORMAT: ${ratio}
MANDATORY: No FIFA official logo, no trophy silhouette from official branding, no real player faces, no national team badge crests`

const styles: Record<string, string> = {
    poster_photo: `You are a professional Indonesian graphic designer creating a high-impact promotional poster.

PROMO TYPE: ${nichePromoContext}

CONCEPT: A bold, editorial-quality poster for an Indonesian local business. Think: the energy of a Jakarta street festival meets a premium sports event poster. Not generic. Not clipart. Real atmosphere.

VISUAL COMPOSITION:
- Background: richly textured atmospheric scene of ${nicheVisual}
- The scene must match the PROMO TYPE above — if it's a seller, show products; if barber, show barbershop; if cafe, show café nobar atmosphere
- Dramatic depth of field — background slightly bokeh, foreground sharp
- A football element present but secondary — the BUSINESS is the hero, not the match
- Strong diagonal light beams for atmosphere
- Dust particles / atmospheric haze for depth
- Feels lived-in, local, authentic — not stock photo generic

TYPOGRAPHY HIERARCHY (this is critical):
1. "${businessName}" — top area, smaller but authoritative, clean sans-serif, logo lockup area
2. "NOBAR PIALA DUNIA 2026" — large, bold, uppercase, slightly distressed/grunge texture on letters
3. "${matchText}" — LARGEST element, maximum impact, takes up ~40% of vertical space, ultra-bold condensed
4. "${match.jam_wib} WIB" — medium, clean, inside a badge or pill shape
${tagline ? `5. "${tagline}" — small tagline, italic or light weight, positioned near business name` : ''}

DESIGN DETAILS:
- Subtle halftone dot pattern overlay on background for print-culture aesthetic
- Thin geometric border frame (2px) with corner accents
- Small decorative stars or spark elements around the match name
- Football field top-down pattern as subtle background texture in one section
- Badge/stamp element for the time info

${textBlock}`,

    poster_text: `You are a world-class typographic poster designer creating a minimalist sports poster.

CONCEPT: Pure typography as art. Inspired by Swiss International Style meets modern streetwear drops. Bold, confident, no unnecessary decoration. Every element earns its place.

VISUAL COMPOSITION:
- Almost entirely typographic — text IS the design
- Strong grid structure: invisible but felt
- One single graphic element only: a minimalist football outline (just stroke, no fill) OR a bold diagonal stripe
- Generous white space used intentionally as a design element
- Subtle paper texture or grain overlay for tactile feel

TYPOGRAPHY HIERARCHY (obsessively precise):
1. "${businessName}" — top strip, small caps, tracked out widely, separated by thin rule
2. "NOBAR PIALA DUNIA 2026" — stacked, each word on its own line, alternating weights (bold/light/bold)
3. "${matchText}" — DOMINANT ELEMENT, split across 2-3 lines, letters almost touching the edges, ultra-compressed
4. "${match.jam_wib} WIB" — bottom strip, monospace font, matching top element

DESIGN DETAILS:
- Thick horizontal rules as section dividers (not decorative, structural)
- One oversized background character (a number or letter, opacity 5%) as texture
- Precise kerning on all text — nothing should feel accidental
- The composition should feel like it belongs on a gallery wall AND an Instagram feed

${textBlock}`,

    poster_cartoon: `You are a professional illustrator creating a vibrant Indonesian pop art poster.

CONCEPT: Joyful, loud, celebratory — the energy of Indonesian warung culture and neighborhood watch parties. Inspired by Indonesian komik culture and modern flat illustration. Should feel like it was made by a local artist who loves football.

VISUAL COMPOSITION:
- Bold flat illustration style with thick black outlines (like Indonesian street signage art)
- Main scene: a group of stylized cartoon Indonesian people (diverse, fun, expressive) watching football together
- Setting: ${nicheVisual} rendered as bold flat illustration
- A cartoon football flies through the scene with motion lines
- Radial sunburst or starburst pattern in background (classic Indonesian retro poster style)
- Each character has a distinct personality — one screaming at the screen, one covering eyes, one celebrating

TYPOGRAPHY:
- Headline in a bold bubble or blocky display font, outlined in black
- Letters slightly uneven/hand-lettered feel for warmth
- "${matchText}" in a speech bubble or banner ribbon element
- Color blocks behind text for legibility

DESIGN DETAILS:
- Halftone dots in shadow areas (comic book feel)
- Small decorative elements: stars, sparkles, sweat drops (manga-style)
- Each flat color area has a subtle texture or pattern
- The whole poster should feel loud, fun, and unmistakably Indonesian

${textBlock}`,

    jersey_mockup: `You are a cinematic sports photographer and poster designer.

CONCEPT: Dramatic, high-production, magazine-cover quality. Think ESPN Magazine cover meets Nike campaign. The poster commands attention — aspirational, powerful, premium.

VISUAL COMPOSITION:
- Hero element: a dramatic silhouette of a football player mid-action (bicycle kick, powerful strike, or sprint) — silhouette only, no face, no team colors
- The silhouette is backlit by intense stadium floodlights creating a god-ray / halo effect
- Background: stadium bowl packed with crowd, slightly motion-blurred, lights creating bokeh circles
- Ground level fog/smoke at the bottom third of the image
- The player silhouette overlaps with the text — text wraps around the figure dynamically
- Strong vignette on corners drawing eye to center

TYPOGRAPHY:
- "${matchText}" split — one team name left, "VS" center, other team name right — massive, billboard scale
- "${businessName}" in a premium top banner with thin gold/accent rule underneath
- "${match.jam_wib} WIB" in a clean broadcast-style lower-third strip at bottom

DESIGN DETAILS:
- Lens flare from the stadium lights (one strong, a few small)
- Subtle film grain over entire image
- The color theme should feel like a premium sports brand campaign
- No clichéd clipart ball — everything should feel photographically real or at least cinematic

${textBlock}`,

    stadium_vibe: `You are an aerial/drone photographer turned poster designer.

CONCEPT: The overwhelming scale and emotion of a World Cup stadium. Make the viewer feel small against the spectacle. This is about atmosphere, not information — but the information must be there.

VISUAL COMPOSITION:
- Wide establishing shot: a packed World Cup stadium at night, viewed from a slightly elevated angle
- The green pitch glows intensely under powerful floodlights — this is the dominant light source
- 80,000+ people in the stands, a sea of colors, flags, and flares
- Dramatic sky above — either deep night blue with stars, or dramatic storm clouds with light breaking through
- The text floats OVER the stadium like a projection or giant scoreboard
- Atmospheric haze from the crowd and pitch lights creates layers of depth

TYPOGRAPHY:
- "${matchText}" designed to look like a GIANT stadium scoreboard — blocky, LED-inspired font, maybe a subtle scanline effect
- "${businessName}" in a glowing neon or backlit treatment at top
- "${match.jam_wib} WIB" in a broadcast ticker strip at the bottom
- All text feels like it BELONGS in the stadium environment, not pasted on top

DESIGN DETAILS:
- Tiny individual crowd members visible in close sections (shows scale)
- Flare from the four corner floodlights
- Subtle chromatic aberration on text edges for that digital scoreboard feel
- The composition should feel like looking at a real match broadcast

${textBlock}`,

    countdown: `You are a motion graphics designer creating a static key frame of a premium sports countdown animation.

CONCEPT: The tension before kickoff. Clock ticking. Hearts racing. A graphic that feels like it should be animated but hits just as hard as a still image.

VISUAL COMPOSITION:
- Central hero: an enormous typographic countdown — the match time "${match.jam_wib} WIB" displayed like a massive stadium clock
- The numbers should feel HEAVY, metallic, three-dimensional — like carved from steel or illuminated LED
- Radiating light emanating from behind the countdown numbers
- Background: deep dark, with concentric circular elements suggesting a radar or clock face
- Fragmented diagonal lines or sharp geometric shapes suggesting motion and energy
- Small football in orbit around the countdown number composition

TYPOGRAPHY:
- The TIME is the hero — make "${match.jam_wib} WIB" the most visually dominant element
- "${matchText}" directly below the time in a clean sans-serif uppercase strip
- "${businessName}" in a top badge/chip element — clean, minimal
- "NOBAR PIALA DUNIA 2026" in a bottom band, tracked out

DESIGN DETAILS:
- Glow and bloom effects on the numbers
- Subtle grid or dot matrix background (mission control aesthetic)
- Motion blur trails on surrounding graphic elements
- The overall feeling: precision, tension, countdown-to-something-massive

${textBlock}`,

    score_card: `You are a senior broadcast graphics designer at a premium sports network.

CONCEPT: The clean authority of premium sports television. This isn't a grassroots poster — it looks like something you'd see on beIN Sports or ESPN. Professional, trustworthy, sharp.

VISUAL COMPOSITION:
- Clean split layout: top section is atmospheric (dark, moody stadium photo, heavily color-graded), bottom 40% is the "broadcast card" — clean, geometric, data-focused
- The broadcast card section has: team names (or match name) separated by a "VS" badge, time, date
- Network-style graphical elements: thin horizontal rules, small geometric accents, corner bracket details
- The atmospheric top section has a strong gradient fade into the broadcast card below
- Small stadium background visible through the color treatment — present but not dominant

TYPOGRAPHY:
- "${matchText}" in the broadcast card section — clean, bold, ESPN-style sports font
- "VS" in a circular badge with accent color border
- "${businessName}" positioned like a network/channel logo — top right or bottom left, with a clean background chip
- "${match.jam_wib} WIB" in a distinctly different mono/tabular font — like a broadcast timestamp
- "NOBAR PIALA DUNIA 2026" as a lower-third banner strip — exactly like a broadcast lower third

DESIGN DETAILS:
- The broadcast card has a very slight gradient or glass morphism effect
- Thin 1px accent color rules separating sections
- Everything is precisely aligned — no casual/organic elements
- The overall design language says: this is official, this is serious, this is tonight

${textBlock}`,
  }

  return styles[style] || styles.poster_photo
}
