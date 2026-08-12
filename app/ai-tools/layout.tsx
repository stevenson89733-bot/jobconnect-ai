import { AIToolsProvider } from '@/lib/ai/aiToolsContext'
import type { ReactNode } from 'react'

export default function AIToolsLayout({ children }: { children: ReactNode }) {
  return <AIToolsProvider>{children}</AIToolsProvider>
}
