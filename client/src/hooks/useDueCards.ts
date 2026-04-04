import { useEffect } from 'react';
import { useCardStore } from '../stores/cardStore';

export function useDueCards() {
  const { dueCards, isLoading, error, fetchDueCards, reviewCard } = useCardStore();

  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  return { dueCards, isLoading, error, reviewCard };
}
