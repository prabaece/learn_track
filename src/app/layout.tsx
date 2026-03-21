import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/src/app/providers'

export const metadata: Metadata = {
  title: 'LearnTrack — Daily Learning Tracker',
  description: 'Track your daily learning tasks and progress',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}