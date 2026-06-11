export type Tier = 'basic' | 'pro' | 'max'

export interface TierConfig {
  name: string
  harga: number
  caption_variants: number
  image_feed_limit: number   // total image feed yang bisa di-generate
  image_story_limit: number  // total image story
  image_prompt_detail: 'basic' | 'detail'
  logo_inject: boolean
  features: string[]
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  basic: {
    name: 'Basic',
    harga: 49000,
    caption_variants: 2,
    image_feed_limit: 0,
    image_story_limit: 0,
    image_prompt_detail: 'basic',
    logo_inject: false,
    features: [
      '2 alternatif caption per hari',
      'Caption otomatis 38 hari World Cup',
      'Disesuaikan jadwal pertandingan real',
      'Personalisasi nama & niche bisnis',
      'Image prompt generik (buat sendiri di ChatGPT)',
    ]
  },
  pro: {
    name: 'Pro',
    harga: 99000,
    caption_variants: 3,
    image_feed_limit: 38,    // 1 image feed per hari
    image_story_limit: 0,
    image_prompt_detail: 'detail',
    logo_inject: true,
    features: [
      '3 alternatif caption per hari',
      'Caption otomatis 38 hari World Cup',
      '38 image feed siap posting (include logo)',
      'Image prompt detail untuk generate sendiri',
      'Personalisasi nama, niche & logo bisnis',
      'Jadwal pertandingan real-time WIB',
    ]
  },
  max: {
    name: 'Max',
    harga: 199000,
    caption_variants: 5,
    image_feed_limit: 76,    // 2 image feed per hari
    image_story_limit: 38,   // 1 image story per hari
    image_prompt_detail: 'detail',
    logo_inject: true,
    features: [
      '5 alternatif caption per hari',
      'Caption otomatis 38 hari World Cup',
      '76 image feed (2 pilihan per hari)',
      '38 image story (1 per hari)',
      'Include logo bisnis di semua image',
      'Image prompt detail untuk semua format',
      'Personalisasi penuh: nama, niche, logo, kota',
    ]
  }
}

// Scalev product codes — isi sesuai setup ScaleV kamu
export const SCALEV_CODES: Record<Tier, string> = {
  basic: 'KICKOFF-BASIC',
  pro: 'KICKOFF-PRO',
  max: 'KICKOFF-MAX',
}
