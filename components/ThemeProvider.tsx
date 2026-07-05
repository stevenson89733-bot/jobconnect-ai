'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ReactNode } from 'react'

/**
 * App-wide theme provider (next-themes).
 * - attribute="class": toggles the `dark` class on <html> for Tailwind darkMode.
 * - defaultTheme="system" + enableSystem: auto-follow OS until the user overrides.
 * - next-themes injects its inline anti-flash script automatically.
 * Persistence: the manual choice is also mirrored to a `theme` cookie (see
 * ThemeToggle) so the root layout can read it server-side.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  )
}
