import type { Metadata } from 'next'
import Providers from './providers'
// @ts-ignore
import './globals.css'

export const metadata: Metadata = {
  title: 'Ward',
  description:
    'Complete and up-to-date information about League of Legends champions, items, runes, and more.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}