'use client'

import { ThemeProvider } from '@/src/app/lib/theme'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}