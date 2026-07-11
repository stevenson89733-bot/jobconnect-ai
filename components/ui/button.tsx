import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Variants mirror the project's existing .btn-primary / .btn-outline classes
// (globals.css) plus a couple of additions (ghost/subtle) for the dashboard.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary hover:bg-blue-700 text-white font-semibold',
        outline:
          'border border-slate-300 dark:border-slate-600 hover:border-slate-400 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
        ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
      },
      size: {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-5 py-2.5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
