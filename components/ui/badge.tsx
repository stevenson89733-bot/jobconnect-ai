import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300',
      primary: 'bg-primary/10 dark:bg-primary/20 text-blue-700 dark:text-blue-400',
      success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      accent: 'bg-orange-100 dark:bg-accent/20 text-orange-700 dark:text-orange-400',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
