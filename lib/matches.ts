export interface Match {
  id: string
  date: string // YYYY-MM-DD
  jam_wib: string // HH:MM
  home: string
  away: string
  fase: 'grup' | 'round32' | 'r16' | 'qf' | 'sf' | 'final' | '3rd'
  grup?: string
  venue?: string
  kota?: string
}

export const WORLD_CUP_MATCHES: Match[] = [
  // ===== FASE GRUP =====
  // 12 Juni
  { id: 'g001', date: '2026-06-12', jam_wib: '02:00', home: 'Meksiko', away: 'Afrika Selatan', fase: 'grup', grup: 'A' },
  { id: 'g002', date: '2026-06-12', jam_wib: '09:00', home: 'Korea Selatan', away: 'Republik Ceko', fase: 'grup', grup: 'A' },
  // 13 Juni
  { id: 'g003', date: '2026-06-13', jam_wib: '02:00', home: 'Kanada', away: 'Bosnia & Herzegovina', fase: 'grup', grup: 'B' },
  // 14 Juni
  { id: 'g004', date: '2026-06-14', jam_wib: '02:00', home: 'Qatar', away: 'Swiss', fase: 'grup', grup: 'B' },
  { id: 'g005', date: '2026-06-14', jam_wib: '05:00', home: 'Brasil', away: 'Maroko', fase: 'grup', grup: 'C' },
  { id: 'g006', date: '2026-06-14', jam_wib: '08:00', home: 'Haiti', away: 'Skotlandia', fase: 'grup', grup: 'C' },
  { id: 'g007', date: '2026-06-14', jam_wib: '08:00', home: 'Amerika Serikat', away: 'Paraguay', fase: 'grup', grup: 'D' },
  { id: 'g008', date: '2026-06-14', jam_wib: '11:00', home: 'Australia', away: 'Turki', fase: 'grup', grup: 'D' },
  // 15 Juni
  { id: 'g009', date: '2026-06-15', jam_wib: '00:00', home: 'Jerman', away: 'Curaçao', fase: 'grup', grup: 'E' },
  { id: 'g010', date: '2026-06-15', jam_wib: '03:00', home: 'Belanda', away: 'Jepang', fase: 'grup', grup: 'F' },
  { id: 'g011', date: '2026-06-15', jam_wib: '06:00', home: 'Pantai Gading', away: 'Ekuador', fase: 'grup', grup: 'E' },
  { id: 'g012', date: '2026-06-15', jam_wib: '09:00', home: 'Swedia', away: 'Tunisia', fase: 'grup', grup: 'F' },
  { id: 'g013', date: '2026-06-15', jam_wib: '23:00', home: 'Spanyol', away: 'Tanjung Verde', fase: 'grup', grup: 'H' },
  // 16 Juni
  { id: 'g014', date: '2026-06-16', jam_wib: '02:00', home: 'Belgia', away: 'Mesir', fase: 'grup', grup: 'G' },
  { id: 'g015', date: '2026-06-16', jam_wib: '05:00', home: 'Arab Saudi', away: 'Uruguay', fase: 'grup', grup: 'H' },
  { id: 'g016', date: '2026-06-16', jam_wib: '08:00', home: 'Iran', away: 'Selandia Baru', fase: 'grup', grup: 'G' },
  // 17 Juni
  { id: 'g017', date: '2026-06-17', jam_wib: '02:00', home: 'Prancis', away: 'Senegal', fase: 'grup', grup: 'I' },
  { id: 'g018', date: '2026-06-17', jam_wib: '05:00', home: 'Irak', away: 'Norwegia', fase: 'grup', grup: 'I' },
  { id: 'g019', date: '2026-06-17', jam_wib: '08:00', home: 'Argentina', away: 'Aljazair', fase: 'grup', grup: 'J' },
  { id: 'g020', date: '2026-06-17', jam_wib: '11:00', home: 'Austria', away: 'Yordania', fase: 'grup', grup: 'J' },
  // 18 Juni
  { id: 'g021', date: '2026-06-18', jam_wib: '00:00', home: 'Portugal', away: 'DR Kongo', fase: 'grup', grup: 'K' },
  { id: 'g022', date: '2026-06-18', jam_wib: '03:00', home: 'Inggris', away: 'Kroasia', fase: 'grup', grup: 'L' },
  { id: 'g023', date: '2026-06-18', jam_wib: '06:00', home: 'Ghana', away: 'Panama', fase: 'grup', grup: 'L' },
  { id: 'g024', date: '2026-06-18', jam_wib: '09:00', home: 'Uzbekistan', away: 'Kolombia', fase: 'grup', grup: 'K' },
  { id: 'g025', date: '2026-06-18', jam_wib: '23:00', home: 'Republik Ceko', away: 'Afrika Selatan', fase: 'grup', grup: 'A' },
  // 19 Juni
  { id: 'g026', date: '2026-06-19', jam_wib: '02:00', home: 'Swiss', away: 'Bosnia & Herzegovina', fase: 'grup', grup: 'B' },
  { id: 'g027', date: '2026-06-19', jam_wib: '05:00', home: 'Kanada', away: 'Qatar', fase: 'grup', grup: 'B' },
  { id: 'g028', date: '2026-06-19', jam_wib: '08:00', home: 'Meksiko', away: 'Korea Selatan', fase: 'grup', grup: 'A' },
  // 20 Juni
  { id: 'g029', date: '2026-06-20', jam_wib: '02:00', home: 'Amerika Serikat', away: 'Australia', fase: 'grup', grup: 'D' },
  { id: 'g030', date: '2026-06-20', jam_wib: '05:00', home: 'Skotlandia', away: 'Maroko', fase: 'grup', grup: 'C' },
  { id: 'g031', date: '2026-06-20', jam_wib: '07:30', home: 'Brasil', away: 'Haiti', fase: 'grup', grup: 'C' },
  { id: 'g032', date: '2026-06-20', jam_wib: '10:00', home: 'Turki', away: 'Paraguay', fase: 'grup', grup: 'D' },
  // 21 Juni
  { id: 'g033', date: '2026-06-21', jam_wib: '00:00', home: 'Belanda', away: 'Swedia', fase: 'grup', grup: 'F' },
  { id: 'g034', date: '2026-06-21', jam_wib: '03:00', home: 'Jerman', away: 'Pantai Gading', fase: 'grup', grup: 'E' },
  { id: 'g035', date: '2026-06-21', jam_wib: '07:00', home: 'Ekuador', away: 'Curaçao', fase: 'grup', grup: 'E' },
  { id: 'g036', date: '2026-06-21', jam_wib: '11:00', home: 'Tunisia', away: 'Jepang', fase: 'grup', grup: 'F' },
  { id: 'g037', date: '2026-06-21', jam_wib: '23:00', home: 'Spanyol', away: 'Arab Saudi', fase: 'grup', grup: 'H' },
  // 22 Juni
  { id: 'g038', date: '2026-06-22', jam_wib: '02:00', home: 'Belgia', away: 'Iran', fase: 'grup', grup: 'G' },
  { id: 'g039', date: '2026-06-22', jam_wib: '05:00', home: 'Uruguay', away: 'Tanjung Verde', fase: 'grup', grup: 'H' },
  { id: 'g040', date: '2026-06-22', jam_wib: '08:00', home: 'Selandia Baru', away: 'Mesir', fase: 'grup', grup: 'G' },
  // 23 Juni
  { id: 'g041', date: '2026-06-23', jam_wib: '00:00', home: 'Argentina', away: 'Austria', fase: 'grup', grup: 'J' },
  { id: 'g042', date: '2026-06-23', jam_wib: '04:00', home: 'Prancis', away: 'Irak', fase: 'grup', grup: 'I' },
  { id: 'g043', date: '2026-06-23', jam_wib: '07:00', home: 'Norwegia', away: 'Senegal', fase: 'grup', grup: 'I' },
  { id: 'g044', date: '2026-06-23', jam_wib: '10:00', home: 'Yordania', away: 'Aljazair', fase: 'grup', grup: 'J' },
  // 24 Juni
  { id: 'g045', date: '2026-06-24', jam_wib: '00:00', home: 'Portugal', away: 'Uzbekistan', fase: 'grup', grup: 'K' },
  { id: 'g046', date: '2026-06-24', jam_wib: '03:00', home: 'Inggris', away: 'Ghana', fase: 'grup', grup: 'L' },
  { id: 'g047', date: '2026-06-24', jam_wib: '06:00', home: 'Panama', away: 'Kroasia', fase: 'grup', grup: 'L' },
  { id: 'g048', date: '2026-06-24', jam_wib: '09:00', home: 'Kolombia', away: 'DR Kongo', fase: 'grup', grup: 'K' },
  // 25 Juni
  { id: 'g049', date: '2026-06-25', jam_wib: '02:00', home: 'Swiss', away: 'Kanada', fase: 'grup', grup: 'B' },
  { id: 'g050', date: '2026-06-25', jam_wib: '02:00', home: 'Bosnia & Herzegovina', away: 'Qatar', fase: 'grup', grup: 'B' },
  { id: 'g051', date: '2026-06-25', jam_wib: '05:00', home: 'Maroko', away: 'Haiti', fase: 'grup', grup: 'C' },
  { id: 'g052', date: '2026-06-25', jam_wib: '05:00', home: 'Skotlandia', away: 'Brasil', fase: 'grup', grup: 'C' },
  { id: 'g053', date: '2026-06-25', jam_wib: '08:00', home: 'Afrika Selatan', away: 'Korea Selatan', fase: 'grup', grup: 'A' },
  { id: 'g054', date: '2026-06-25', jam_wib: '08:00', home: 'Republik Ceko', away: 'Meksiko', fase: 'grup', grup: 'A' },
  // 26 Juni
  { id: 'g055', date: '2026-06-26', jam_wib: '03:00', home: 'Curaçao', away: 'Pantai Gading', fase: 'grup', grup: 'E' },
  { id: 'g056', date: '2026-06-26', jam_wib: '03:00', home: 'Ekuador', away: 'Jerman', fase: 'grup', grup: 'E' },
  { id: 'g057', date: '2026-06-26', jam_wib: '06:00', home: 'Tunisia', away: 'Belanda', fase: 'grup', grup: 'F' },
  { id: 'g058', date: '2026-06-26', jam_wib: '06:00', home: 'Jepang', away: 'Swedia', fase: 'grup', grup: 'F' },
  { id: 'g059', date: '2026-06-26', jam_wib: '09:00', home: 'Turki', away: 'Amerika Serikat', fase: 'grup', grup: 'D' },
  { id: 'g060', date: '2026-06-26', jam_wib: '09:00', home: 'Paraguay', away: 'Australia', fase: 'grup', grup: 'D' },
  // 27 Juni
  { id: 'g061', date: '2026-06-27', jam_wib: '02:00', home: 'Norwegia', away: 'Prancis', fase: 'grup', grup: 'I' },
  { id: 'g062', date: '2026-06-27', jam_wib: '02:00', home: 'Senegal', away: 'Irak', fase: 'grup', grup: 'I' },
  { id: 'g063', date: '2026-06-27', jam_wib: '07:00', home: 'Tanjung Verde', away: 'Arab Saudi', fase: 'grup', grup: 'H' },
  { id: 'g064', date: '2026-06-27', jam_wib: '07:00', home: 'Uruguay', away: 'Spanyol', fase: 'grup', grup: 'H' },
  { id: 'g065', date: '2026-06-27', jam_wib: '10:00', home: 'Selandia Baru', away: 'Belgia', fase: 'grup', grup: 'G' },
  { id: 'g066', date: '2026-06-27', jam_wib: '10:00', home: 'Mesir', away: 'Iran', fase: 'grup', grup: 'G' },
  // 28 Juni
  { id: 'g067', date: '2026-06-28', jam_wib: '04:00', home: 'Panama', away: 'Inggris', fase: 'grup', grup: 'L' },
  { id: 'g068', date: '2026-06-28', jam_wib: '04:00', home: 'Kroasia', away: 'Ghana', fase: 'grup', grup: 'L' },
  { id: 'g069', date: '2026-06-28', jam_wib: '06:30', home: 'Kolombia', away: 'Portugal', fase: 'grup', grup: 'K' },
  { id: 'g070', date: '2026-06-28', jam_wib: '06:30', home: 'DR Kongo', away: 'Uzbekistan', fase: 'grup', grup: 'K' },
  { id: 'g071', date: '2026-06-28', jam_wib: '09:00', home: 'Aljazair', away: 'Austria', fase: 'grup', grup: 'J' },
  { id: 'g072', date: '2026-06-28', jam_wib: '09:00', home: 'Yordania', away: 'Argentina', fase: 'grup', grup: 'J' },

  // ===== BABAK 32 BESAR (29 Juni - 4 Juli) =====
  { id: 'r32_01', date: '2026-06-29', jam_wib: '02:00', home: 'Pemenang Grup A', away: 'Runner-up Grup B', fase: 'round32' },
  { id: 'r32_02', date: '2026-06-29', jam_wib: '05:00', home: 'Pemenang Grup C', away: 'Runner-up Grup D', fase: 'round32' },
  { id: 'r32_03', date: '2026-06-29', jam_wib: '08:00', home: 'Pemenang Grup B', away: 'Runner-up Grup A', fase: 'round32' },
  { id: 'r32_04', date: '2026-06-29', jam_wib: '11:00', home: 'Pemenang Grup D', away: 'Runner-up Grup C', fase: 'round32' },
  { id: 'r32_05', date: '2026-06-30', jam_wib: '02:00', home: 'Pemenang Grup E', away: 'Runner-up Grup F', fase: 'round32' },
  { id: 'r32_06', date: '2026-06-30', jam_wib: '05:00', home: 'Pemenang Grup G', away: 'Runner-up Grup H', fase: 'round32' },
  { id: 'r32_07', date: '2026-06-30', jam_wib: '08:00', home: 'Pemenang Grup F', away: 'Runner-up Grup E', fase: 'round32' },
  { id: 'r32_08', date: '2026-06-30', jam_wib: '11:00', home: 'Pemenang Grup H', away: 'Runner-up Grup G', fase: 'round32' },
  { id: 'r32_09', date: '2026-07-01', jam_wib: '02:00', home: 'Pemenang Grup I', away: 'Runner-up Grup J', fase: 'round32' },
  { id: 'r32_10', date: '2026-07-01', jam_wib: '05:00', home: 'Pemenang Grup K', away: 'Runner-up Grup L', fase: 'round32' },
  { id: 'r32_11', date: '2026-07-01', jam_wib: '08:00', home: 'Pemenang Grup J', away: 'Runner-up Grup I', fase: 'round32' },
  { id: 'r32_12', date: '2026-07-01', jam_wib: '11:00', home: 'Pemenang Grup L', away: 'Runner-up Grup K', fase: 'round32' },
  { id: 'r32_13', date: '2026-07-02', jam_wib: '02:00', home: 'Peringkat 3 Terbaik 1', away: 'Peringkat 3 Terbaik 2', fase: 'round32' },
  { id: 'r32_14', date: '2026-07-02', jam_wib: '05:00', home: 'Peringkat 3 Terbaik 3', away: 'Peringkat 3 Terbaik 4', fase: 'round32' },
  { id: 'r32_15', date: '2026-07-03', jam_wib: '02:00', home: 'Peringkat 3 Terbaik 5', away: 'Peringkat 3 Terbaik 6', fase: 'round32' },
  { id: 'r32_16', date: '2026-07-04', jam_wib: '02:00', home: 'Peringkat 3 Terbaik 7', away: 'Peringkat 3 Terbaik 8', fase: 'round32' },

  // ===== BABAK 16 BESAR (5 - 8 Juli) =====
  { id: 'r16_01', date: '2026-07-05', jam_wib: '02:00', home: 'Pemenang R32-1', away: 'Pemenang R32-2', fase: 'r16' },
  { id: 'r16_02', date: '2026-07-05', jam_wib: '06:00', home: 'Pemenang R32-3', away: 'Pemenang R32-4', fase: 'r16' },
  { id: 'r16_03', date: '2026-07-06', jam_wib: '02:00', home: 'Pemenang R32-5', away: 'Pemenang R32-6', fase: 'r16' },
  { id: 'r16_04', date: '2026-07-06', jam_wib: '06:00', home: 'Pemenang R32-7', away: 'Pemenang R32-8', fase: 'r16' },
  { id: 'r16_05', date: '2026-07-07', jam_wib: '02:00', home: 'Pemenang R32-9', away: 'Pemenang R32-10', fase: 'r16' },
  { id: 'r16_06', date: '2026-07-07', jam_wib: '06:00', home: 'Pemenang R32-11', away: 'Pemenang R32-12', fase: 'r16' },
  { id: 'r16_07', date: '2026-07-08', jam_wib: '02:00', home: 'Pemenang R32-13', away: 'Pemenang R32-14', fase: 'r16' },
  { id: 'r16_08', date: '2026-07-08', jam_wib: '06:00', home: 'Pemenang R32-15', away: 'Pemenang R32-16', fase: 'r16' },

  // ===== PEREMPAT FINAL (10 - 12 Juli) =====
  { id: 'qf_01', date: '2026-07-10', jam_wib: '02:00', home: 'Pemenang R16-1', away: 'Pemenang R16-2', fase: 'qf' },
  { id: 'qf_02', date: '2026-07-10', jam_wib: '06:00', home: 'Pemenang R16-3', away: 'Pemenang R16-4', fase: 'qf' },
  { id: 'qf_03', date: '2026-07-11', jam_wib: '02:00', home: 'Pemenang R16-5', away: 'Pemenang R16-6', fase: 'qf' },
  { id: 'qf_04', date: '2026-07-12', jam_wib: '02:00', home: 'Pemenang R16-7', away: 'Pemenang R16-8', fase: 'qf' },

  // ===== SEMIFINAL (15 - 16 Juli) =====
  { id: 'sf_01', date: '2026-07-15', jam_wib: '02:00', home: 'Pemenang QF-1', away: 'Pemenang QF-2', fase: 'sf' },
  { id: 'sf_02', date: '2026-07-16', jam_wib: '02:00', home: 'Pemenang QF-3', away: 'Pemenang QF-4', fase: 'sf' },

  // ===== PEREBUTAN JUARA 3 =====
  { id: '3rd', date: '2026-07-19', jam_wib: '02:00', home: 'Kalah SF-1', away: 'Kalah SF-2', fase: '3rd' },

  // ===== FINAL =====
  { id: 'final', date: '2026-07-20', jam_wib: '02:00', home: 'Pemenang SF-1', away: 'Pemenang SF-2', fase: 'final' },
]

export function getMatchesByDate(date: string): Match[] {
  return WORLD_CUP_MATCHES.filter(m => m.date === date)
}

export function getMatchDates(): string[] {
  return [...new Set(WORLD_CUP_MATCHES.map(m => m.date))].sort()
}

export function getFaseLabel(fase: Match['fase']): string {
  const labels = {
    grup: 'Fase Grup',
    round32: 'Babak 32 Besar',
    r16: 'Babak 16 Besar',
    qf: 'Perempat Final',
    sf: 'Semi Final',
    '3rd': 'Perebutan Juara 3',
    final: 'FINAL'
  }
  return labels[fase]
}

export function hasMatchOnDate(date: string): boolean {
  return WORLD_CUP_MATCHES.some(m => m.date === date)
}
