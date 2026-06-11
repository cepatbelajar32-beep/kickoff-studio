import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KickOff Studio — World Cup 2026 Content Generator',
  description: 'Generate caption dan image siap posting untuk bisnis kamu selama World Cup 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0a' }}>
        {children}
      </body>
    </html>
  )
}
