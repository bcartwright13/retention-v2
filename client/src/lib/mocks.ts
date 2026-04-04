import type { Card, CardCreateInput, CardUpdateInput, ReviewPerformance } from '../types/card';
import type { User } from '../types/user';

// Mock user
export const mockUser: User = {
  id: 'user-1',
  email: 'demo@recall.app',
  displayName: 'Demo User',
  createdAt: '2024-01-01T00:00:00.000Z',
};

// Helper to create dates relative to now
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

// Seed cards — mix of categories, levels, and review states
let mockCards: Card[] = [
  {
    id: 'card-1',
    userId: 'user-1',
    title: 'Java: String to Int',
    category: 'Programming',
    content: 'Integer.parseInt(str) — throws NumberFormatException if not valid.',
    level: 2,
    nextReview: daysFromNow(-1), // due yesterday
    lastReviewed: daysAgo(7),
    createdAt: daysAgo(30),
    updatedAt: daysAgo(7),
  },
  {
    id: 'card-2',
    userId: 'user-1',
    title: 'Python: List Comprehension',
    category: 'Programming',
    content: '[expr for item in iterable if condition] — concise way to create lists.',
    level: 4,
    nextReview: daysFromNow(-2), // due 2 days ago
    lastReviewed: daysAgo(21),
    createdAt: daysAgo(60),
    updatedAt: daysAgo(21),
  },
  {
    id: 'card-3',
    userId: 'user-1',
    title: 'Ephemeral',
    category: 'Vocabulary',
    content: 'Lasting for a very short time. "The ephemeral nature of fame."',
    level: 1,
    nextReview: daysFromNow(0), // due today
    lastReviewed: daysAgo(3),
    createdAt: daysAgo(14),
    updatedAt: daysAgo(3),
  },
  {
    id: 'card-4',
    userId: 'user-1',
    title: 'Sonder',
    category: 'Vocabulary',
    content: 'The realization that each passerby has a life as vivid and complex as your own.',
    level: 0,
    nextReview: daysFromNow(-3), // due 3 days ago
    lastReviewed: daysAgo(1),
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: 'card-5',
    userId: 'user-1',
    title: 'Stoicism: Dichotomy of Control',
    category: 'Quotes',
    content: '"Some things are within our power, while others are not." — Epictetus, Enchiridion',
    level: 5,
    nextReview: daysFromNow(10), // not due yet
    lastReviewed: daysAgo(30),
    createdAt: daysAgo(90),
    updatedAt: daysAgo(30),
  },
  {
    id: 'card-6',
    userId: 'user-1',
    title: 'TypeScript: Utility Types',
    category: 'Programming',
    content: 'Partial<T>, Required<T>, Pick<T,K>, Omit<T,K>, Record<K,V> — built-in mapped types.',
    level: 3,
    nextReview: daysFromNow(0), // due today
    lastReviewed: daysAgo(14),
    createdAt: daysAgo(45),
    updatedAt: daysAgo(14),
  },
  {
    id: 'card-7',
    userId: 'user-1',
    title: 'Mitochondria Function',
    category: 'Science',
    content: 'Powerhouse of the cell. Generates ATP through oxidative phosphorylation.',
    level: 3,
    nextReview: daysFromNow(5), // not due yet
    lastReviewed: daysAgo(14),
    createdAt: daysAgo(50),
    updatedAt: daysAgo(14),
  },
  {
    id: 'card-8',
    userId: 'user-1',
    title: 'Newton\'s Third Law',
    category: 'Science',
    content: 'For every action, there is an equal and opposite reaction.',
    level: 5,
    nextReview: daysFromNow(20), // not due yet
    lastReviewed: daysAgo(30),
    createdAt: daysAgo(120),
    updatedAt: daysAgo(30),
  },
  {
    id: 'card-9',
    userId: 'user-1',
    title: 'Ubiquitous',
    category: 'Vocabulary',
    content: 'Present, appearing, or found everywhere. "Smartphones have become ubiquitous."',
    level: 2,
    nextReview: daysFromNow(-1), // due yesterday
    lastReviewed: daysAgo(7),
    createdAt: daysAgo(20),
    updatedAt: daysAgo(7),
  },
  {
    id: 'card-10',
    userId: 'user-1',
    title: 'Marcus Aurelius on Change',
    category: 'Quotes',
    content: '"The universe is change; our life is what our thoughts make it." — Meditations',
    level: 1,
    nextReview: daysFromNow(0), // due today
    lastReviewed: daysAgo(3),
    createdAt: daysAgo(10),
    updatedAt: daysAgo(3),
  },
];

// Level-to-interval mapping for "Got it!" (in days)
const LEVEL_INTERVALS = [1, 3, 7, 14, 21, 30];

function computeNextReview(level: number, performance: ReviewPerformance): { newLevel: number; nextReview: string } {
  let newLevel = level;
  let intervalDays: number;

  switch (performance) {
    case 'forgot':
      newLevel = 0;
      intervalDays = 1;
      break;
    case 'struggled':
      intervalDays = 3;
      break;
    case 'gotit':
      newLevel = Math.min(level + 1, 5);
      intervalDays = LEVEL_INTERVALS[newLevel];
      break;
    case 'mastered':
      newLevel = Math.min(level + 2, 5);
      intervalDays = 30;
      break;
  }

  return { newLevel, nextReview: daysFromNow(intervalDays) };
}

let nextId = 11;

// Simulate async delay
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions matching the real API signatures
export const mockApi = {
  async getUser(): Promise<User> {
    await delay();
    return mockUser;
  },

  async getCards(): Promise<Card[]> {
    await delay();
    return [...mockCards];
  },

  async getDueCards(): Promise<Card[]> {
    await delay();
    const now = new Date().toISOString();
    return mockCards.filter(c => c.nextReview <= now);
  },

  async createCard(input: CardCreateInput): Promise<Card> {
    await delay();
    const now = new Date().toISOString();
    const card: Card = {
      id: `card-${nextId++}`,
      userId: 'user-1',
      title: input.title,
      category: input.category || 'General',
      content: input.content,
      level: 0,
      nextReview: now,
      lastReviewed: now,
      createdAt: now,
      updatedAt: now,
    };
    mockCards.push(card);
    return card;
  },

  async updateCard(id: string, input: CardUpdateInput): Promise<Card> {
    await delay();
    const idx = mockCards.findIndex(c => c.id === id);
    if (idx === -1) throw { message: 'Card not found', status: 404 };
    mockCards[idx] = {
      ...mockCards[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return mockCards[idx];
  },

  async deleteCard(id: string): Promise<void> {
    await delay();
    mockCards = mockCards.filter(c => c.id !== id);
  },

  async reviewCard(id: string, performance: ReviewPerformance): Promise<Card> {
    await delay();
    const idx = mockCards.findIndex(c => c.id === id);
    if (idx === -1) throw { message: 'Card not found', status: 404 };
    const { newLevel, nextReview } = computeNextReview(mockCards[idx].level, performance);
    mockCards[idx] = {
      ...mockCards[idx],
      level: newLevel,
      nextReview,
      lastReviewed: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockCards[idx];
  },
};
