import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDeckColorClass(color?: string | null): string {
  if (!color || color === 'default') return '';
  const colorMap: Record<string, string> = {
    red: 'border-t-red-500',
    orange: 'border-t-orange-500',
    amber: 'border-t-amber-500',
    green: 'border-t-green-500',
    emerald: 'border-t-emerald-500',
    teal: 'border-t-teal-500',
    cyan: 'border-t-cyan-500',
    blue: 'border-t-blue-500',
    indigo: 'border-t-indigo-500',
    violet: 'border-t-violet-500',
    purple: 'border-t-purple-500',
    fuchsia: 'border-t-fuchsia-500',
    pink: 'border-t-pink-500',
    rose: 'border-t-rose-500',
  };
  const colorClass = colorMap[color];
  return colorClass ? `border-t-4 ${colorClass}` : '';
}
