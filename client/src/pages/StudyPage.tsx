import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ReviewPerformance } from '../types/card';
import { useDueCards } from '../hooks/useDueCards';
import { useCards } from '../hooks/useCards';
import { getIntervalHint, formatRelativeDate } from '../lib/scheduler';
import { cn } from '../lib/cn';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CardSurface } from '../components/ui/CardSurface';
import { Spinner } from '../components/ui/Spinner';
import { Container } from '../components/layout/Container';

const ASSESSMENTS: {
  performance: ReviewPerformance;
  label: string;
  bg: string;
  hover: string;
}[] = [
  { performance: 'forgot', label: 'Forgot', bg: 'bg-forgot', hover: 'hover:bg-forgot-hover' },
  { performance: 'struggled', label: 'Struggled', bg: 'bg-struggled', hover: 'hover:bg-struggled-hover' },
  { performance: 'gotit', label: 'Got it!', bg: 'bg-gotit', hover: 'hover:bg-gotit-hover' },
  { performance: 'mastered', label: 'Mastered', bg: 'bg-mastered', hover: 'hover:bg-mastered-hover' },
];

function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-16 w-16', className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="32" className="fill-gotit" />
      <path
        d="M20 33l8 8 16-16"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LevelDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Level ${level} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            i < level ? 'bg-primary-500' : 'bg-surface-hover',
          )}
        />
      ))}
    </div>
  );
}

function useNextReviewInfo(cards: { nextReview: string }[]) {
  const now = new Date();
  const futureCards = cards.filter((c) => new Date(c.nextReview) > now);
  if (futureCards.length === 0) return null;
  futureCards.sort(
    (a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime(),
  );
  return formatRelativeDate(futureCards[0].nextReview);
}

export default function StudyPage() {
  const { dueCards, isLoading, reviewCard } = useDueCards();
  const { cards } = useCards();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Key used to trigger card transition animation
  const [cardKey, setCardKey] = useState(0);

  const nextReviewText = useNextReviewInfo(cards);

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleAssessment = useCallback(
    async (performance: ReviewPerformance) => {
      const card = dueCards[currentIndex];
      if (!card || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await reviewCard(card.id, performance);
      } finally {
        setIsSubmitting(false);
        setIsRevealed(false);
        setCurrentIndex((prev) => prev + 1);
        setCardKey((prev) => prev + 1);
      }
    },
    [currentIndex, dueCards, isSubmitting, reviewCard],
  );

  // Loading state
  if (isLoading) {
    return (
      <Container className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </Container>
    );
  }

  // Empty state — no due cards at all
  if (dueCards.length === 0) {
    return (
      <Container className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="mb-4">
            <CheckmarkIcon />
          </div>
          <h2 className="text-lg font-semibold text-text mb-1">You're all caught up!</h2>
          <p className="text-sm text-text-muted mb-2 max-w-sm">
            No cards due for review right now.
          </p>
          <p className="text-sm text-text-muted mb-6 max-w-sm">
            {cards.length > 0 ? (
              <>
                {cards.length} card{cards.length !== 1 ? 's' : ''} in your library
                {nextReviewText && <> &middot; Next review: {nextReviewText}</>}
              </>
            ) : (
              'Add some cards to get started.'
            )}
          </p>
          <Link to="/">
            <Button variant="primary">Back to Library</Button>
          </Link>
        </div>
      </Container>
    );
  }

  // Completion state — all due cards reviewed
  if (currentIndex >= dueCards.length) {
    return (
      <Container className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="mb-4">
            <CheckmarkIcon />
          </div>
          <h2 className="text-lg font-semibold text-text mb-1">You're all caught up!</h2>
          <p className="text-sm text-text-muted mb-2 max-w-sm">
            You reviewed {dueCards.length} card{dueCards.length !== 1 ? 's' : ''}. Great work!
          </p>
          <p className="text-sm text-text-muted mb-6 max-w-sm">
            {cards.length} card{cards.length !== 1 ? 's' : ''} in your library
            {nextReviewText && <> &middot; Next review: {nextReviewText}</>}
          </p>
          <Link to="/">
            <Button variant="primary">Back to Library</Button>
          </Link>
        </div>
      </Container>
    );
  }

  // Active study
  const card = dueCards[currentIndex];
  const progress = ((currentIndex) / dueCards.length) * 100;

  return (
    <Container className="py-6">
      {/* Progress indicator */}
      <div className="mb-6">
        <p className="text-sm text-text-muted mb-2">
          Card {currentIndex + 1} of {dueCards.length}
        </p>
        <div className="h-1 w-full rounded-full bg-surface-hover overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card with transition */}
      <div
        key={cardKey}
        className={cn(
          'max-w-xl mx-auto',
          'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2',
        )}
        style={{
          animation: 'studyCardIn 250ms ease-out both',
        }}
      >
        <CardSurface className="p-6">
          {/* Top row: category badge + level dots */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="primary">{card.category}</Badge>
            <LevelDots level={card.level} />
          </div>

          {/* Title — always visible */}
          <h2 className="text-xl font-semibold text-text">{card.title}</h2>

          {/* Content — only when revealed */}
          {isRevealed && (
            <div className="motion-safe:animate-in motion-safe:fade-in">
              <div className="border-t border-border my-4" />
              <p className="text-text leading-relaxed whitespace-pre-wrap">{card.content}</p>
            </div>
          )}
        </CardSurface>

        {/* Actions below card */}
        <div className="mt-6">
          {!isRevealed ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleReveal}
            >
              Show Answer
            </Button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ASSESSMENTS.map(({ performance, label, bg, hover }) => (
                <button
                  key={performance}
                  onClick={() => handleAssessment(performance)}
                  disabled={isSubmitting}
                  className={cn(
                    bg,
                    hover,
                    'text-white font-medium rounded-md min-h-[56px] px-3 py-2',
                    'flex flex-col items-center justify-center gap-0.5',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'disabled:opacity-50 disabled:pointer-events-none',
                  )}
                >
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs opacity-90">
                    {getIntervalHint(performance, card.level)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline keyframes for card entrance animation (respects prefers-reduced-motion) */}
      <style>{`
        @keyframes studyCardIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes studyCardIn {
            from { opacity: 1; transform: none; }
            to { opacity: 1; transform: none; }
          }
        }
      `}</style>
    </Container>
  );
}
