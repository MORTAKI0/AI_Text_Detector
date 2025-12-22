import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
};

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--accent)] text-white shadow-sm hover:bg-[#1d4ed8] focus-visible:ring-[var(--accent)] focus-visible:ring-offset-[var(--bg)]',
  secondary:
    'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-white',
  ghost:
    'text-slate-700 hover:bg-slate-100 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-[var(--bg)]',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  md: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-2 text-sm',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
