import { create } from 'zustand';
import type { Card, CardCreateInput, CardUpdateInput, ReviewPerformance } from '../types/card';
import { mockApi } from '../lib/mocks';

interface CardState {
  cards: Card[];
  dueCards: Card[];
  isLoading: boolean;
  error: string | null;
  fetchCards: () => Promise<void>;
  fetchDueCards: () => Promise<void>;
  createCard: (input: CardCreateInput) => Promise<Card>;
  updateCard: (id: string, input: CardUpdateInput) => Promise<Card>;
  deleteCard: (id: string) => Promise<void>;
  reviewCard: (id: string, performance: ReviewPerformance) => Promise<Card>;
}

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  dueCards: [],
  isLoading: false,
  error: null,

  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with api.get<Card[]>(`/api/users/${userId}/cards`)
      const cards = await mockApi.getCards();
      set({ cards, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message || 'Failed to fetch cards', isLoading: false });
    }
  },

  fetchDueCards: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with api.get<Card[]>(`/api/users/${userId}/cards/due`)
      const dueCards = await mockApi.getDueCards();
      set({ dueCards, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message || 'Failed to fetch due cards', isLoading: false });
    }
  },

  createCard: async (input) => {
    // TODO: Replace with api.post<Card>(`/api/users/${userId}/cards`, input)
    const card = await mockApi.createCard(input);
    set({ cards: [...get().cards, card] });
    return card;
  },

  updateCard: async (id, input) => {
    // TODO: Replace with api.put<Card>(`/api/users/${userId}/cards/${id}`, input)
    const updated = await mockApi.updateCard(id, input);
    set({
      cards: get().cards.map(c => c.id === id ? updated : c),
      dueCards: get().dueCards.map(c => c.id === id ? updated : c),
    });
    return updated;
  },

  deleteCard: async (id) => {
    // TODO: Replace with api.del(`/api/users/${userId}/cards/${id}`)
    await mockApi.deleteCard(id);
    set({
      cards: get().cards.filter(c => c.id !== id),
      dueCards: get().dueCards.filter(c => c.id !== id),
    });
  },

  reviewCard: async (id, performance) => {
    // TODO: Replace with api.patch<Card>(`/api/users/${userId}/cards/${id}/review`, { performance })
    const updated = await mockApi.reviewCard(id, performance);
    set({
      cards: get().cards.map(c => c.id === id ? updated : c),
      dueCards: get().dueCards.filter(c => c.id !== id),
    });
    return updated;
  },
}));
