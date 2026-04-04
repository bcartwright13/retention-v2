import { useEffect } from 'react';
import { useCardStore } from '../stores/cardStore';

export function useCards() {
  const { cards, isLoading, error, fetchCards, createCard, updateCard, deleteCard } = useCardStore();

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, isLoading, error, createCard, updateCard, deleteCard };
}
