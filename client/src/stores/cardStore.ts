import { create } from 'zustand';
import type { Card, CardCreateInput, CardUpdateInput, ReviewPerformance } from '../types/card';
import { api } from '../lib/api';
import { useAuthStore } from './authStore';

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
  reset: () => void;
}

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  dueCards: [],
  isLoading: false,
  error: null,

  fetchCards: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');
    set({ isLoading: true, error: null });
    try {
      const cards = await api.get<Card[]>(`/api/users/${userId}/cards`);
      set({ cards, isLoading: false });
    } catch (e) {
      set({ error: (e as { message?: string }).message || 'Failed to fetch cards', isLoading: false });
    }
  },

  fetchDueCards: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');
    set({ isLoading: true, error: null });
    try {
      const dueCards = await api.get<Card[]>(`/api/users/${userId}/cards/due`);
      set({ dueCards, isLoading: false });
    } catch (e) {
      set({ error: (e as { message?: string }).message || 'Failed to fetch due cards', isLoading: false });
    }
  },

  createCard: async (input) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');
    const card = await api.post<Card>(`/api/users/${userId}/cards`, input);
    set({ cards: [...get().cards, card] });
    return card;
  },

  updateCard: async (id, input) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');
    const updated = await api.put<Card>(`/api/users/${userId}/cards/${id}`, input);
    set({
      cards: get().cards.map(c => c.id === id ? updated : c),
      dueCards: get().dueCards.map(c => c.id === id ? updated : c),
    });
    return updated;
  },

  deleteCard: async (id) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');
    await api.del(`/api/users/${userId}/cards/${id}`);
    set({
      cards: get().cards.filter(c => c.id !== id),
      dueCards: get().dueCards.filter(c => c.id !== id),
    });
  },

  reviewCard: async (id, performance) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not authenticated');
    const updated = await api.patch<Card>(`/api/users/${userId}/cards/${id}/review`, { performance });
    set({
      cards: get().cards.map(c => c.id === id ? updated : c),
      dueCards: get().dueCards.filter(c => c.id !== id),
    });
    return updated;
  },

  reset: () => {
    set({ cards: [], dueCards: [], isLoading: false, error: null });
  },
}));
