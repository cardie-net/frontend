import { useState, useEffect, useCallback, useRef } from 'react';
import { FlashCard, CardProgress } from '@/types';
import { apiFetch } from '@/lib/api';

const BATCH_SIZE = 5;

export function useLearningSession(deckId: string) {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // The queue of progress updates to sync
  const updateQueueRef = useRef<CardProgress[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionCards, setSessionCards] = useState<FlashCard[]>([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchSessionData = useCallback(async () => {
    if (!deckId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Fetch cards
      const cardsRes = await apiFetch(`/api/v1/decks/${deckId}/cards`);
      if (!cardsRes.ok) throw new Error('Failed to fetch cards');
      const cardsData: FlashCard[] = await cardsRes.json();
      
      // Fetch progress
      const progressRes = await apiFetch(`/api/v1/decks/${deckId}/progress`);
      if (!progressRes.ok) throw new Error('Failed to fetch progress');
      const progressData: CardProgress[] = await progressRes.json();
      
      const pMap: Record<string, number> = {};
      for (const p of progressData) {
        pMap[p.card_id] = p.box;
      }
      setProgressMap(pMap);
      setCards(cardsData);
      
      // Filter out Box 3 (mastered) cards
      const availableCards = cardsData.filter(card => (pMap[card.id] || 1) < 3);
      
      if (availableCards.length === 0) {
        setSessionCompleted(true);
      } else {
        // Shuffle available cards
        const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
        setSessionCards(shuffled);
        setCurrentCardIndex(0);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const syncProgress = useCallback(async (updates: CardProgress[], isUnload: boolean = false) => {
    if (updates.length === 0) return;
    
    // Deduplicate updates: only keep the latest update for each card
    const latestUpdatesMap = new Map<string, CardProgress>();
    for (const update of updates) {
      latestUpdatesMap.set(update.card_id, update);
    }
    const deduplicatedUpdates = Array.from(latestUpdatesMap.values());

    try {
      await apiFetch(`/api/v1/decks/${deckId}/progress`, {
        method: 'POST',
        body: JSON.stringify({ progress: deduplicatedUpdates }),
        keepalive: isUnload,
      });
    } catch (err) {
      console.error('Failed to sync progress:', err);
    }
  }, [deckId]);

  // Sync on unmount or tab close
  useEffect(() => {
    const handleUnload = () => {
      if (updateQueueRef.current.length > 0) {
        syncProgress([...updateQueueRef.current], true);
        updateQueueRef.current = []; // Clear to prevent double sync
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };

    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      handleUnload();
    };
  }, [syncProgress]);

  const handleAnswer = (knewIt: boolean) => {
    if (!sessionCards[currentCardIndex]) return;
    
    const cardId = sessionCards[currentCardIndex].id;
    const currentBox = progressMap[cardId] || 1;
    let nextBox = knewIt ? currentBox + 1 : 1;
    if (nextBox > 3) nextBox = 3;
    
    // Update local state
    setProgressMap(prev => ({ ...prev, [cardId]: nextBox }));
    
    // Add to sync queue
    updateQueueRef.current.push({ card_id: cardId, box: nextBox });
    
    // Flush if needed
    if (updateQueueRef.current.length >= BATCH_SIZE) {
      syncProgress([...updateQueueRef.current]);
      updateQueueRef.current = [];
    }
    
    // Move to next card
    if (currentCardIndex + 1 < sessionCards.length) {
      setIsFlipped(false);
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Re-evaluate session cards based on new progress
      const remainingCards = sessionCards.filter(c => {
        const box = progressMap[c.id] || 1;
        // if this card was just answered, we need to use its nextBox
        const actualBox = c.id === cardId ? nextBox : box;
        return actualBox < 3;
      });
      
      if (remainingCards.length === 0) {
        setSessionCompleted(true);
        // Instantly flush queue since the session is done, use keepalive=true so it survives quick navigation
        if (updateQueueRef.current.length > 0) {
          syncProgress([...updateQueueRef.current], true);
          updateQueueRef.current = [];
        }
      } else {
        const shuffled = [...remainingCards].sort(() => Math.random() - 0.5);
        setSessionCards(shuffled);
        setCurrentCardIndex(0);
        setIsFlipped(false);
      }
    }
  };

  const getProgressStats = () => {
    let box1 = 0;
    let box2 = 0;
    let box3 = 0;
    
    cards.forEach(card => {
      const box = progressMap[card.id] || 1;
      if (box === 1) box1++;
      else if (box === 2) box2++;
      else if (box === 3) box3++;
    });
    
    return { box1, box2, box3, total: cards.length };
  };

  return {
    loading,
    error,
    sessionCompleted,
    currentCard: sessionCards[currentCardIndex],
    isFlipped,
    setIsFlipped,
    handleAnswer,
    stats: getProgressStats(),
  };
}
