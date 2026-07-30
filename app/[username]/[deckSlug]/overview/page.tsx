'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OverviewPage() {
  const params = useParams();
  const username = params.username as string;
  const deckSlug = params.deckSlug as string;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <Link href={`/${username}/${deckSlug}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center py-12">
          <CardHeader className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <BarChart3 className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-base">
              Deck analytics and progress overview coming soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
