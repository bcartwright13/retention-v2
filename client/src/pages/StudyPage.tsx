import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { ReviewPerformance } from '../types/card';
import { useDueCards } from '../hooks/useDueCards';
import { useCards } from '../hooks/useCards';
import { getIntervalHint, formatRelativeDate } from '../lib/scheduler';
import { cn } from '../lib/cn';
import { Button } from '../components/ui/Button';
import { LevelIndicator } from '../components/ui/LevelIndicator';
import { Rule } from '../components/ui/Rule';
import { Spinner } from '../components/ui/Spinner';
import { StatLine } from '../components/ui/StatLine';
import { Container } from '../components/layout/Container';
import { CardContent } from '../components/cards/CardContent';
import { useStreakStore } from '../stores/streakStore';

// ─────────────────────────────────────────────────────────────────────────
// Assessments — ordered left-to-right as 1/2/3/4.
// "Got it!" is marked `emphasized` and rendered larger / filled.
// ─────────────────────────────────────────────────────────────────────────
type Tone = 'forgot' | 'struggled' | 'gotit' | 'mastered';

const ASSESSMENTS: {
  performance: ReviewPerformance;
  key: string;
  label: string;
  tone: Tone;
  emphasized?: boolean;
}[] = [
  { performance: 'forgot', key: '1', label: 'forgot', tone: 'forgot' },
  { performance: 'struggled', key: '2', label: 'struggled', tone: 'struggled' },
  { performance: 'gotit', key: '3', label: 'got it', tone: 'gotit', emphasized: true },
  { performance: 'mastered', key: '4', label: 'mastered', tone: 'mastered' },
];

const toneText: Record<Tone, string> = {
  forgot: 'text-forgot',
  struggled: 'text-struggled',
  gotit: 'text-gotit',
  mastered: 'text-mastered',
};
const toneBorder: Record<Tone, string> = {
  forgot: 'border-forgot/40 hover:border-forgot',
  struggled: 'border-struggled/40 hover:border-struggled',
  gotit: 'border-gotit hover:border-gotit',
  mastered: 'border-mastered/40 hover:border-mastered',
};

// ─────────────────────────────────────────────────────────────────────────
// CheckmarkStroke — animated stroke-drawn serif-style check on completion.
// ─────────────────────────────────────────────────────────────────────────
function CheckmarkStroke() {
  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      fill="none"
      className="text-ochre"
      aria-hidden="true"
    >
      <circle
        cx="44"
        cy="44"
        r="42"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="264"
        strokeDashoffset="264"
        className="motion-safe:animate-[editorial-stroke-draw_720ms_var(--ease-editorial)_both]"
        style={{ ['--stroke-length' as string]: '264' }}
      />
      <path
        d="M26 46 L40 58 L62 32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="80"
        strokeDashoffset="80"
        className="motion-safe:animate-[editorial-stroke-draw_520ms_var(--ease-editorial)_both]"
        style={{ ['--stroke-length' as string]: '80', animationDelay: '400ms' }}
      />
    </svg>
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

// ─────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────
export default function StudyPage() {
  const { dueCards, isLoading, reviewCard } = useDueCards();
  const { cards } = useCards();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [sessionTally, setSessionTally] = useState<Record<ReviewPerformance, number>>({
    forgot: 0,
    struggled: 0,
    gotit: 0,
    mastered: 0,
  });
  const recordReview = useStreakStore((s) => s.recordReview);

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
        setSessionTally((t) => ({ ...t, [performance]: t[performance] + 1 }));
        recordReview();
      } finally {
        setIsSubmitting(false);
        setIsRevealed(false);
        setCurrentIndex((prev) => prev + 1);
        setCardKey((prev) => prev + 1);
      }
    },
    [currentIndex, dueCards, isSubmitting, reviewCard, recordReview],
  );

  // ── Keyboard shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    if (dueCards.length === 0 || currentIndex >= dueCards.length) return;

    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (!isRevealed) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleReveal();
        }
        return;
      }
      const map: Record<string, ReviewPerformance> = {
        '1': 'forgot',
        '2': 'struggled',
        '3': 'gotit',
        '4': 'mastered',
      };
      const perf = map[e.key];
      if (perf) {
        e.preventDefault();
        handleAssessment(perf);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRevealed, handleReveal, handleAssessment, isLoading, dueCards.length, currentIndex]);

  const sessionReviewed = useMemo(
    () => Object.values(sessionTally).reduce((a, b) => a + b, 0),
    [sessionTally],
  );

  // ── Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Container className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </Container>
    );
  }

  // ── Empty — nothing due ──────────────────────────────────────────────
  if (dueCards.length === 0) {
    return (
      <Container className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center py-16 text-center motion-safe:animate-[editorial-fade-up_560ms_var(--ease-editorial)_both]">
          <div className="mb-8"><CheckmarkStroke /></div>
          <p className="small-caps text-ink-muted mb-4">all caught up</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink mb-4">
            Nothing due, just yet.
          </h2>
          <p className="font-serif-body italic text-ink-soft max-w-md mb-10">
            {cards.length > 0
              ? <>Your library holds <span className="tabular not-italic">{cards.length}</span> card{cards.length !== 1 ? 's' : ''}{nextReviewText && <> — the next will surface {nextReviewText.toLowerCase()}.</>}</>
              : 'Begin by writing your first card.'}
          </p>
          <Link to="/">
            <Button variant="secondary">back to library</Button>
          </Link>
        </div>
      </Container>
    );
  }

  // ── Completion — all done ────────────────────────────────────────────
  if (currentIndex >= dueCards.length) {
    return (
      <Container className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center py-16 text-center motion-safe:animate-[editorial-fade-up_560ms_var(--ease-editorial)_both]">
          <div className="mb-8"><CheckmarkStroke /></div>
          <p className="small-caps text-ochre mb-4">§ &nbsp; session complete</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink mb-8">
            {dueCards.length} card{dueCards.length !== 1 ? 's' : ''} reviewed.
          </h2>

          <Rule className="w-24 mb-8" />

          <StatLine
            stats={[
              { label: 'forgot', value: sessionTally.forgot, tone: 'forgot' },
              { label: 'struggled', value: sessionTally.struggled, tone: 'struggled' },
              { label: 'got it', value: sessionTally.gotit, tone: 'gotit' },
              { label: 'mastered', value: sessionTally.mastered, tone: 'mastered' },
            ]}
            className="mb-10"
          />

          {nextReviewText && (
            <p className="font-serif-body italic text-ink-soft mb-8">
              next review {nextReviewText.toLowerCase()}
            </p>
          )}

          <Link to="/">
            <Button variant="secondary">back to library</Button>
          </Link>
        </div>
      </Container>
    );
  }

  // ── Active study ─────────────────────────────────────────────────────
  const card = dueCards[currentIndex];
  const progress = (currentIndex / dueCards.length) * 100;

  return (
    <Container className="py-8 md:py-12">
      {/* Running head: page counter + progress hairline */}
      <div className="mb-10 md:mb-14">
        <div className="flex items-baseline justify-between mb-3">
          <p className="small-caps text-ink-muted">
            <span className="tabular">{String(currentIndex + 1).padStart(2, '0')}</span>
            &nbsp;/&nbsp;
            <span className="tabular">{String(dueCards.length).padStart(2, '0')}</span>
            &nbsp;&middot;&nbsp;study
          </p>
          {sessionReviewed > 0 && (
            <p className="small-caps-sm text-ink-muted tabular">
              {sessionReviewed} reviewed
            </p>
          )}
        </div>
        <div className="h-px w-full bg-rule relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-ochre transition-all duration-[520ms] [transition-timing-function:var(--ease-editorial)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <article
        key={cardKey}
        className="motion-safe:animate-[editorial-fade-up_440ms_var(--ease-editorial)_both]"
      >
        {/* Category + level, set on a baseline */}
        <header className="flex items-center justify-between mb-8">
          <span className="small-caps text-ochre">{card.category}</span>
          <LevelIndicator level={card.level} />
        </header>

        {/* Title — the front of the card, always visible */}
        <h1 className="font-display text-[2.5rem] md:text-[4rem] leading-[1.02] text-ink mb-10 md:mb-14 [text-wrap:balance]">
          {card.title}
        </h1>

        {/* Answer region */}
        {isRevealed ? (
          <div
            key={`reveal-${cardKey}`}
            className="mb-10 motion-safe:animate-[editorial-settle_480ms_var(--ease-editorial)_both]"
          >
            <Rule label="answer" animated className="mb-8" />
            <CardContent content={card.content} />
          </div>
        ) : (
          <div className="mb-10">
            <Rule className="mb-8" />
            <p className="font-serif italic text-ink-muted">
              — press{' '}
              <kbd className="small-caps inline-block px-2 py-0.5 border border-rule-strong rounded-sm text-ink">
                space
              </kbd>{' '}
              or tap reveal to see the answer
            </p>
          </div>
        )}

        {/* Actions */}
        {!isRevealed ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleReveal}
            className="w-full md:w-auto md:min-w-[240px]"
          >
            reveal answer
          </Button>
        ) : (
          <AssessmentRow
            onSelect={handleAssessment}
            disabled={isSubmitting}
            cardLevel={card.level}
          />
        )}
      </article>
    </Container>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// AssessmentRow — "Got it" is emphasized (larger, filled ink). Others are
// quieter outlined buttons. Each shows: numeral · label · interval.
// ─────────────────────────────────────────────────────────────────────────
interface AssessmentRowProps {
  onSelect: (p: ReviewPerformance) => void;
  disabled: boolean;
  cardLevel: number;
}

function AssessmentRow({ onSelect, disabled, cardLevel }: AssessmentRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ASSESSMENTS.map(({ performance, key, label, tone, emphasized }) => (
        <button
          key={performance}
          type="button"
          onClick={() => onSelect(performance)}
          disabled={disabled}
          className={cn(
            'group relative flex flex-col items-start justify-between text-left',
            'min-h-[88px] px-4 py-3 border bg-paper rounded-sm',
            'transition-all duration-300 [transition-timing-function:var(--ease-editorial)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
            'disabled:opacity-40 disabled:pointer-events-none',
            'hover:-translate-y-px',
            toneBorder[tone],
            emphasized && 'md:col-span-1 md:scale-[1.02] ring-0 [border-width:1.5px]',
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span
              className={cn(
                'font-display text-xl tabular leading-none',
                emphasized ? toneText[tone] : 'text-ink-muted',
              )}
            >
              {key}
            </span>
            <span className="small-caps-sm text-ink-muted tabular">
              {getIntervalHint(performance, cardLevel)}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={cn(
                'font-serif text-lg md:text-xl leading-none',
                emphasized ? cn('italic', toneText[tone]) : 'text-ink',
              )}
            >
              {label}
            </span>
            {emphasized && (
              <span aria-hidden="true" className={cn('text-xs', toneText[tone])}>
                ●
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
