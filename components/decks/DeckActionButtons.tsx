'use client';

import Link from 'next/link';
import { Eye, GraduationCap, Clock, FileCheck, LayoutGrid } from 'lucide-react';
import { useDeck, useDeckMatchTime, useClearDeckMatchTime } from '@/hooks/useDecks';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";

export const ACTION_BUTTONS = [
  {
    label: 'Overview',
    icon: Eye,
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
  const { data: deck } = useDeck(username, deckSlug);
  const { data: matchTime } = useDeckMatchTime(deck?.id);
  const clearMatchTime = useClearDeckMatchTime();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    const msStr = Math.floor((ms % 1000) / 100).toString()
    if (m > 0) return `${m}:${s.toString().padStart(2, "0")}.${msStr}s`
    return `${s}.${msStr}s`
  }

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
            <div className={cn("flex items-center justify-center", isOverview ? "sm:h-10" : "h-10")}>
              <span className="text-sm font-medium text-center leading-tight">
                {action.label}
              </span>
            </div>
            {action.href === 'match' && matchTime?.best_time_ms != null && (
              <span className="absolute bottom-3 sm:bottom-4 text-[10px] sm:text-xs text-muted-foreground mt-1">
                Best: {formatTime(matchTime.best_time_ms)}
              </span>
            )}
          </div>
        );

        if (action.href === 'match') {
          return (
            <Dialog key={action.href}>
              <DialogTrigger className="block text-left w-full h-full text-foreground hover:no-underline p-0 m-0 border-none bg-transparent focus:outline-none">
                {cardContent}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
                  <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <DialogTitle className="text-base font-semibold">Match Mode</DialogTitle>
                </DialogHeader>
                <DialogDescription className="sr-only">
                  Match the front and back of the cards as quickly as possible.
                </DialogDescription>
                <div className="text-sm text-muted-foreground">
                  <p>Match the front and back of the cards as quickly as possible. Up to 10 cards will be randomly selected.</p>
                  {matchTime?.best_time_ms != null && (
                    <div className="mt-4 flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-foreground">Best Time</p>
                        <p className="text-xl font-mono font-bold text-primary">{formatTime(matchTime.best_time_ms)}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => deck?.id && clearMatchTime.mutate(deck.id)} disabled={clearMatchTime.isPending}>
                        Clear Best
                      </Button>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose type="button" className={buttonVariants({ variant: "outline" })}>
                    Cancel
                  </DialogClose>
                  <Link href={`/${username}/${deckSlug}/match`} tabIndex={-1} className={buttonVariants({ className: "w-full sm:w-auto" })}>
                    Start Game
                  </Link>
                </DialogFooter>
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
