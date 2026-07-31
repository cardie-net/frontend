'use client';

import Link from 'next/link';
import { BarChart3, GraduationCap, Clock, FileCheck, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ACTION_BUTTONS = [
  {
    label: 'Overview',
    icon: BarChart3,
    href: 'overview',
    gradient: 'from-violet-500/15 to-purple-500/15',
    hoverGradient: 'from-violet-500/25 to-purple-500/25',
    iconColor: 'text-violet-500',
  },
  {
    label: 'Learn',
    icon: GraduationCap,
    href: 'learn',
    gradient: 'from-blue-500/15 to-cyan-500/15',
    hoverGradient: 'from-blue-500/25 to-cyan-500/25',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Spaced Repetition',
    icon: Clock,
    href: 'spaced-repetition',
    gradient: 'from-emerald-500/15 to-teal-500/15',
    hoverGradient: 'from-emerald-500/25 to-teal-500/25',
    iconColor: 'text-emerald-500',
  },
  {
    label: 'Exam',
    icon: FileCheck,
    href: 'exam',
    gradient: 'from-amber-500/15 to-orange-500/15',
    hoverGradient: 'from-amber-500/25 to-orange-500/25',
    iconColor: 'text-amber-500',
  },
  {
    label: 'Match',
    icon: Layers,
    href: 'match',
    gradient: 'from-pink-500/15 to-rose-500/15',
    hoverGradient: 'from-pink-500/25 to-rose-500/25',
    iconColor: 'text-pink-500',
  },
];

interface DeckActionButtonsProps {
  username: string;
  deckSlug: string;
}

export function DeckActionButtons({ username, deckSlug }: DeckActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
      {ACTION_BUTTONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={`/${username}/${deckSlug}/${action.href}`}
            className="block"
          >
            <div
              className={cn(
                'group relative flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 aspect-square transition-all duration-300',
                'bg-gradient-to-br hover:shadow-lg hover:-translate-y-0.5',
                action.gradient,
                `hover:${action.hoverGradient}`
              )}
            >
              <div
                className={cn(
                  'rounded-xl p-3 transition-transform duration-300 group-hover:scale-110',
                  action.iconColor
                )}
              >
                <Icon className="w-7 h-7" strokeWidth={1.75} />
              </div>
              <span className="text-sm font-medium text-center leading-tight">
                {action.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
