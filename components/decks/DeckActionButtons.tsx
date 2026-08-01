'use client';

import Link from 'next/link';
import { BarChart3, GraduationCap, Clock, FileCheck, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
        
        const cardContent = (
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
        );

        if (action.href === 'match') {
          return (
            <Dialog key={action.href}>
              <DialogTrigger className="block text-left w-full h-full text-foreground hover:no-underline p-0 m-0 border-none bg-transparent focus:outline-none">
                {cardContent}
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <div className="flex flex-col items-center gap-3 mb-2">
                    <div className="p-4 rounded-full bg-pink-500/10 text-pink-500">
                      <Icon className="h-10 w-10" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">Match Mode</DialogTitle>
                  </div>
                  <DialogDescription className="text-base text-center pt-2">
                    Match the front and back of the cards as quickly as possible. Up to 10 cards will be randomly selected.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 flex justify-end">
                  <Link href={`/${username}/${deckSlug}/match`} className="w-full">
                    <Button size="lg" className="w-full text-lg h-12">
                      Start Game
                    </Button>
                  </Link>
                </div>
              </DialogContent>
            </Dialog>
          );
        }

        return (
          <Link
            key={action.href}
            href={`/${username}/${deckSlug}/${action.href}`}
            className="block"
          >
            {cardContent}
          </Link>
        );
      })}
    </div>
  );
}
