import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const TableContainer = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]',
      className
    )}
    {...props}
  />
);

export const Table = ({ className, ...props }: HTMLAttributes<HTMLTableElement>) => (
  <table
    className={cn('w-full border-collapse text-sm text-slate-800', className)}
    {...props}
  />
);

export const TableHead = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-600', className)} {...props} />
);

export const TableBody = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('divide-y divide-slate-200', className)} {...props} />
);

export const TableRow = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      'transition duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
      className
    )}
    {...props}
  />
);

export const TableHeaderCell = ({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('px-4 py-3 text-left font-semibold', className)} {...props} />
);

export const TableCell = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-4 align-middle text-slate-800', className)} {...props} />
);
