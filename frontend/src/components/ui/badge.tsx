import * as React from 'react'
import { cn } from '@/lib/utils'

const Badge = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & {
        variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline'
    }
>(({ className, variant = 'default', ...props }, ref) => {
    const variants: Record<string, string> = {
        default: 'bg-primary/10 text-primary border-primary/30',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        destructive: 'bg-red-500/10 text-red-400 border-red-500/30',
        outline: 'bg-transparent text-slate-400 border-white/20',
    }
    return (
        <span
            ref={ref}
            className={cn(
                'inline-flex items-center rounded-md border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors',
                variants[variant],
                className
            )}
            {...props}
        />
    )
})
Badge.displayName = 'Badge'

export { Badge }
