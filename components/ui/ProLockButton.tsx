'use client'
import { useRouter } from 'next/navigation'

interface ProLockButtonProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProLockButton({
  label = 'Unlock Pro',
  size = 'sm',
  className = ''
}: ProLockButtonProps) {
  const router = useRouter()

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1',
    md: 'text-sm px-4 py-2 gap-1.5',
    lg: 'text-base px-5 py-2.5 gap-2',
  }

  return (
    <button
      onClick={() => router.push('/pricing')}
      className={`inline-flex items-center font-bold rounded-full bg-[#F0663A] text-white shadow-md hover:bg-[#d4522a] hover:shadow-lg active:scale-95 transition-all duration-150 whitespace-nowrap ${sizeClasses[size]} ${className}`}
    >
      🔒 {label}
    </button>
  )
}
// ProLockButton wired - Sat Sep 19 20:05:11 +07 2026
