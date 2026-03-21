import React from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  className?: string;
  valueClass?: string;
}

export default function MetricCard({ label, value, sub, icon, className, valueClass }: MetricCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className={cn('mt-1 text-3xl font-bold text-slate-900', valueClass)}>{value}</p>
          {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
        </div>
        {icon && (
          <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
