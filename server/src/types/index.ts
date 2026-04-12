export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

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

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
