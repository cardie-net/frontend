'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  GraduationCap,
  Gamepad2,
  BarChart2,
  Info,
} from 'lucide-react';
import { TabbedLayout, TabItem } from '@/components/TabbedLayout';

interface CardElement {
  type: 'text';
  content: string;
}

interface Card {
  id: string;
  front: CardElement[];
  back: CardElement[];
}

interface Deck {
  id: string;
  name: string;
  slug: string;
}

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: deckId } = use(params);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      try {
        const deckRes = await apiFetch(`/api/v1/decks/${deckId}`);
        if (!deckRes.ok) {
          if (deckRes.status === 404) router.push('/decks');
          throw new Error('Failed to fetch deck');
        }
        setDeck(await deckRes.json());

        const cardsRes = await apiFetch(`/api/v1/decks/${deckId}/cards`);
        if (cardsRes.ok) {
          setCards(await cardsRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeckAndCards();
  }, [deckId, router]);

  if (loading)
    return (
      <div className="p-8 text-foreground flex-1 flex items-center justify-center font-bold">
        Loading deck...
      </div>
    );
  if (!deck)
    return (
      <div className="p-8 text-foreground flex-1 flex items-center justify-center font-bold">
        Deck not found.
      </div>
    );

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard size={20} />,
      content: (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2">Deck Overview</h2>
          <div className="opacity-80">
            <p>Total Cards: {cards.length}</p>
            <p className="mt-2">
              Welcome to {deck.name}. Select a mode on the left to start learning!
            </p>
          </div>
        </div>
      ),
      activeBgClass: 'bg-green',
      activeTextClass: 'text-green-text',
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: <BookOpen size={20} />,
      content: (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2">Learn Mode</h2>
          <div className="opacity-80">
            <p>Start a basic learning session here.</p>
          </div>
        </div>
      ),
      activeBgClass: 'bg-success',
      activeTextClass: 'text-success-text',
    },
    {
      id: 'spaced-repetition',
      label: 'Spaced Repetition',
      icon: <Brain size={20} />,
      content: (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2">Spaced Repetition</h2>
          <div className="opacity-80">
            <p>Smart review based on your memory retention.</p>
          </div>
        </div>
      ),
      activeBgClass: 'bg-purple',
      activeTextClass: 'text-purple-text',
    },
    {
      id: 'exam',
      label: 'Exam',
      icon: <GraduationCap size={20} />,
      content: (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2">Exam Mode</h2>
          <div className="opacity-80">
            <p>Test your knowledge with an exam.</p>
          </div>
        </div>
      ),
      activeBgClass: 'bg-error',
      activeTextClass: 'text-error-text',
    },
    {
      id: 'match',
      label: 'Match',
      icon: <Gamepad2 size={20} />,
      content: (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2">Match Game</h2>
          <div className="opacity-80">
            <p>Match terms with their definitions.</p>
          </div>
        </div>
      ),
      activeBgClass: 'bg-warning',
      activeTextClass: 'text-warning-text',
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: <BarChart2 size={20} />,
      content: (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2">Statistics</h2>
          <div className="opacity-80">
            <p>View your progress and learning stats.</p>
          </div>
        </div>
      ),
      activeBgClass: 'bg-info',
      activeTextClass: 'text-info-text',
    },
    {
      id: 'help',
      label: 'Help',
      icon: <Info size={20} />,
      content: (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2">Help Center</h2>
          <div className="opacity-80">
            <p>Learn how to use this deck and its features.</p>
          </div>
        </div>
      ),
      activeBgClass: 'bg-info',
      activeTextClass: 'text-info-text',
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 h-[calc(100dvh-46px)] md:h-auto overflow-hidden md:overflow-visible">
      <div className="max-w-6xl mx-auto w-full mb-6 shrink-0">
        <div className="flex items-center justify-between mb-4 gap-4">
          <Link
            href="/decks"
            className="text-sm font-bold text-foreground/70 hover:text-foreground transition-colors flex items-center gap-2 shrink-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Decks
          </Link>

          <h1 className="hidden md:block text-2xl font-extrabold truncate text-center flex-1">
            {deck.name}
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            <button className="text-sm font-bold bg-foreground/10 hover:bg-foreground/20 p-2 md:px-4 md:py-2 rounded-lg transition-colors flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span className="hidden md:inline">Share</span>
            </button>

            <Link
              href={`/decks/${deckId}/edit`}
              className="text-sm font-bold bg-foreground/10 hover:bg-foreground/20 p-2 md:px-4 md:py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              <span className="hidden md:inline">Edit Deck</span>
            </Link>
          </div>
        </div>

        <h1 className="md:hidden text-2xl font-extrabold mb-2 break-words">{deck.name}</h1>
      </div>

      <TabbedLayout tabs={tabs} defaultTabId="overview" />
    </div>
  );
}
