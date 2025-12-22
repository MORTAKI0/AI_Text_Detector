import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'neutral' | 'ai' | 'human' | 'info' | 'muted';
};

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  neutral: 'bg-slate-100 text-slate-800 border border-slate-200',
  ai: 'bg-rose-100 text-rose-700 border border-rose-200',
  human: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-100',
  muted: 'bg-slate-50 text-slate-700 border border-slate-200',
};

const Badge = ({ variant = 'neutral', className, ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
      variantClasses[variant],
      className
    )}
    {...props}
  />
);

export default Badge;
