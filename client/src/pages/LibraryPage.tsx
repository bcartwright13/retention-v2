import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import { useToastStore } from '../stores/toastStore';
import { formatRelativeDate } from '../lib/scheduler';
import { highlightMatches } from '../lib/highlight';
import { cn } from '../lib/cn';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { LevelIndicator } from '../components/ui/LevelIndicator';
import { Rule } from '../components/ui/Rule';
import { StreakWidget } from '../components/stats/StreakWidget';

const ALL = 'all';

export default function LibraryPage() {
  const { cards, isLoading, error, deleteCard } = useCards();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);
  const [cardToDelete, setCardToDelete] = useState<{ id: string; title: string } | null>(null);

  // Build an index of category → count
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    return counts;
  }, [cards]);

  const categories = useMemo(
    () => [ALL, ...Array.from(categoryCounts.keys()).sort()],
    [categoryCounts],
  );

  const filteredCards = useMemo(() => {
    let result = cards;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.content.toLowerCase().includes(q),
      );
    }
    if (selectedCategory !== ALL) {
      result = result.filter((c) => c.category === selectedCategory);
    }
    return result;
  }, [cards, searchQuery, selectedCategory]);

  const handleDelete = async () => {
    if (!cardToDelete) return;
    await deleteCard(cardToDelete.id);
    setCardToDelete(null);
    addToast('Card removed from the shelf.');
  };

  if (isLoading) {
    return (
      <Container className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <EmptyState icon="§" title="Something went wrong." description={error} />
      </Container>
    );
  }

  if (cards.length === 0) {
    return (
      <Container className="py-8">
        <EmptyState
          icon="⁂"
          title="The shelf stands empty."
          description="Write your first card — a definition, a quote, a fragment of code — and begin."
          action={
            <Button variant="primary" onClick={() => navigate('/cards/new')}>
              write first card
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="pb-28 md:pb-16">
      {/* ── Running head ─────────────────────────────────────────────── */}
      <header className="mb-10 md:mb-14">
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-4">
            <h1 className="font-display text-5xl md:text-6xl text-ink leading-none">
              Library
            </h1>
            <span className="small-caps text-ink-muted tabular">
              {cards.length} card{cards.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/cards/new')}
            className="small-caps hidden md:inline-flex items-center gap-2 text-ochre hover:text-ochre-ink transition-colors"
          >
            <span aria-hidden="true" className="font-serif text-base leading-none">+</span>
            new card
          </button>
        </div>

        <p className="font-serif-body italic text-ink-soft mb-6">
          — an index of everything worth remembering.
        </p>

        <div className="flex items-center justify-between gap-4">
          <Rule className="flex-1" />
          <StreakWidget />
        </div>
      </header>

      {/* ── Search (underlined inline input, no box) ──────────────────── */}
      <div className="mb-8">
        <label htmlFor="library-search" className="small-caps block text-ink-muted mb-2">
          search
        </label>
        <input
          id="library-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="title or content…"
          className={cn(
            'w-full bg-transparent border-0 border-b border-rule',
            'font-serif-body text-xl md:text-2xl text-ink placeholder:text-ink-muted/60 italic',
            'py-3 px-0 focus:outline-none focus:border-b-ochre focus:[border-bottom-width:2px]',
            'transition-colors duration-300 [transition-timing-function:var(--ease-editorial)]',
          )}
        />
      </div>

      {/* ── Category filter — small-caps with counts, middot separators ── */}
      <nav aria-label="Filter by category" className="mb-10">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          {categories.map((cat, idx) => {
            const isActive = selectedCategory === cat;
            const count = cat === ALL ? cards.length : (categoryCounts.get(cat) ?? 0);
            return (
              <span key={cat} className="flex items-baseline gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'small-caps relative inline-flex items-baseline gap-1.5 py-1 transition-colors duration-300',
                    isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                  )}
                >
                  <span>{cat}</span>
                  <span className="tabular text-[0.625rem] opacity-70">{count}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute left-0 right-0 -bottom-px h-px bg-ochre origin-left transition-transform duration-500 [transition-timing-function:var(--ease-editorial)]',
                      isActive ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </button>
                {idx < categories.length - 1 && (
                  <span aria-hidden="true" className="text-ink-muted/40 font-serif">
                    ·
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </nav>

      {/* ── Card list (rule-bounded passages) ─────────────────────────── */}
      {filteredCards.length === 0 ? (
        <EmptyState
          icon="§"
          title="No matches found."
          description="Try a different search term, or loosen the category filter."
        />
      ) : (
        <ul className="border-t border-rule">
          {filteredCards.map((card, idx) => (
            <li
              key={card.id}
              className="border-b border-rule group hover:bg-paper-alt transition-colors duration-300 [transition-timing-function:var(--ease-editorial)]"
              style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }}
            >
              <div className="py-6 md:py-7 px-1 md:px-2">
                {/* Top line: category metadata + level */}
                <div className="flex items-baseline justify-between mb-3">
                  <div className="flex items-baseline gap-3">
                    <span className="small-caps text-ochre">{card.category}</span>
                    <span className="small-caps-sm text-ink-muted tabular">
                      {formatRelativeDate(card.nextReview).toLowerCase()}
                    </span>
                  </div>
                  <LevelIndicator level={card.level} />
                </div>

                {/* Title */}
                <button
                  type="button"
                  onClick={() => navigate(`/cards/${card.id}/edit`)}
                  className="text-left block w-full focus-visible:outline-none"
                >
                  <h3 className="font-display-md text-2xl md:text-3xl text-ink leading-tight mb-2 group-hover:text-ochre-ink transition-colors duration-300">
                    {highlightMatches(card.title, searchQuery)}
                  </h3>
                </button>

                {/* Content excerpt */}
                <p className="font-serif-body text-base text-ink-muted max-w-[62ch] line-clamp-2 mb-4">
                  {highlightMatches(card.content, searchQuery)}
                </p>

                {/* Actions — small-caps text links */}
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => navigate(`/cards/${card.id}/edit`)}
                    className="small-caps text-ink-muted hover:text-ink transition-colors"
                  >
                    edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardToDelete({ id: card.id, title: card.title })}
                    className="small-caps text-ink-muted hover:text-forgot transition-colors"
                  >
                    remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Delete confirmation ────────────────────────────────────────── */}
      <Modal
        open={cardToDelete !== null}
        onClose={() => setCardToDelete(null)}
        title="Remove card"
      >
        <p className="font-serif-body text-ink-soft mb-8">
          Remove &ldquo;<span className="italic">{cardToDelete?.title}</span>&rdquo; from your
          library? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setCardToDelete(null)}>
            keep
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            remove
          </Button>
        </div>
      </Modal>
    </Container>
  );
}
