export interface Card {
  id: string;
  userId: string;
  title: string;
  category: string;
  content: string;
  level: number;
  nextReview: string;
  lastReviewed: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewPerformance = 'forgot' | 'struggled' | 'gotit' | 'mastered';

export interface CardCreateInput {
  title: string;
  category: string;
  content: string;
}

export interface CardUpdateInput {
  title?: string;
  category?: string;
  content?: string;
}

export interface ReviewInput {
  performance: ReviewPerformance;
}
