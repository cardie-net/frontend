'use client';

import Link from 'next/link';
import { BarChart3, GraduationCap, Clock, FileCheck, LayoutGrid } from 'lucide-react';
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
    bgClasses: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 hover:from-violet-500/20 hover:to-purple-500/20 dark:hover:from-violet-500/30 dark:hover:to-purple-500/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-500/20 dark:border-violet-400/20 hover:border-violet-500/40 dark:hover:border-violet-400/40',
  },
  {
    label: 'Learn',
    icon: GraduationCap,
    href: 'learn',
    bgClasses: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 hover:from-blue-500/20 hover:to-cyan-500/20 dark:hover:from-blue-500/30 dark:hover:to-cyan-500/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/20 dark:border-blue-400/20 hover:border-blue-500/40 dark:hover:border-blue-400/40',
  },
  {
    label: 'Spaced Repetition',
    icon: Clock,
    href: 'spaced-repetition',
    bgClasses: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 hover:from-emerald-500/20 hover:to-teal-500/20 dark:hover:from-emerald-500/30 dark:hover:to-teal-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/20 dark:border-emerald-400/20 hover:border-emerald-500/40 dark:hover:border-emerald-400/40',
  },
  {
    label: 'Exam',
    icon: FileCheck,
    href: 'exam',
    bgClasses: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 hover:from-amber-500/20 hover:to-orange-500/20 dark:hover:from-amber-500/30 dark:hover:to-orange-500/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/20 dark:border-amber-400/20 hover:border-amber-500/40 dark:hover:border-amber-400/40',
  },
  {
    label: 'Match',
    icon: LayoutGrid,
    href: 'match',
    bgClasses: 'bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 hover:from-pink-500/20 hover:to-rose-500/20 dark:hover:from-pink-500/30 dark:hover:to-rose-500/30',
    iconColor: 'text-pink-600 dark:text-pink-400',
    borderColor: 'border-pink-500/20 dark:border-pink-400/20 hover:border-pink-500/40 dark:hover:border-pink-400/40',
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
        const isOverview = action.href === 'overview';
        
        const cardContent = (
          <div
            className={cn(
              'group relative flex items-center justify-center gap-3 rounded-2xl border transition-all duration-300',
              'hover:shadow-lg hover:-translate-y-0.5',
              action.bgClasses,
              action.borderColor,
              isOverview ? 'aspect-[4/1] flex-row p-4 sm:aspect-square sm:flex-col sm:p-6' : 'aspect-square flex-col p-6'
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
            className={cn("block", isOverview ? "col-span-2 sm:col-span-1" : "")}
          >
            {cardContent}
          </Link>
        );
      })}
    </div>
  );
}
