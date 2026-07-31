'use client';

import Link from 'next/link';
import { cn, getDeckColorClass } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, BookOpen, MoreVertical, Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Deck } from '@/types';

interface DeckCardProps {
  deck: Deck;
  username?: string;
  onShare: (deck: Deck) => void;
  onDelete: (deckId: string) => void;
}

export function DeckCard({ deck, username, onShare, onDelete }: DeckCardProps) {
  return (
    <Card className={cn("flex flex-col relative", getDeckColorClass(deck.properties?.color))}>
      <CardHeader>
        <CardTitle className="pr-8">{deck.name}</CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="-mr-2 h-8 w-8" />}>
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onShare(deck)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(deck.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground capitalize">{deck.privacy} Deck</p>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        <Link href={`/${username}/${deck.slug}`} className="flex-1">
          <Button className="w-full" variant="default">
            <BookOpen className="w-4 h-4 mr-2" /> Learn
          </Button>
        </Link>
        <Link href={`/${username}/${deck.slug}?edit=true`} className="flex-1">
          <Button className="w-full" variant="outline">
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
