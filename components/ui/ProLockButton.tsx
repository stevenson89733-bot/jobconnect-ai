'use client'
import Link from 'next/link'

interface ProLockButtonProps {
  label?: string
  size?: 'sm' | 'md'
}

export default function ProLockButton({ label = 'Unlock with Pro', size = 'sm' }: ProLockButtonProps) {
  return (
    <Link
      href="/pricing"
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border border-[#F0663A] text-[#F0663A] hover:bg-[#F0663A] hover:text-white transition-colors whitespace-nowrap
        ${size === 'sm' ? 'text-[11px] px-3 py-1' : 'text-sm px-4 py-2'}`}
    >
      🔒 {label}
    </Link>
  )
}
