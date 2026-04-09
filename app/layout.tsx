import type { Metadata } from 'next'
import { Cinzel, Inter, Lora } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '600', '700', '900'],
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Archivist — The DM Toolkit',
  description: 'AI-powered session chronicle tool for Dungeon Masters. Transform raw session notes into beautifully organized campaign records.',
  keywords: ['DnD', 'D&D', 'Dungeon Master', 'session notes', 'campaign chronicle', 'TTRPG'],
  openGraph: {
    title: 'The Archivist — The DM Toolkit',
    description: 'Transform raw session notes into beautifully organized campaign records.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable} ${lora.variable}`}>
      <body className="bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  )
}
