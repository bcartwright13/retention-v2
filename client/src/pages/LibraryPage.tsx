import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import { useToastStore } from '../stores/toastStore';
import { formatRelativeDate } from '../lib/scheduler';
import { cn } from '../lib/cn';
import { Container } from '../components/layout/Container';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { CardSurface } from '../components/ui/CardSurface';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';

const MAX_LEVEL = 5;

function LevelDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Level ${level} of ${MAX_LEVEL}`}>
      {Array.from({ length: MAX_LEVEL }, (_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            i < level ? 'bg-primary-500' : 'bg-border',
          )}
        />
      ))}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5 text-text-muted"
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-6 w-6"
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-10 w-10"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

export default function LibraryPage() {
  const { cards, isLoading, error, deleteCard } = useCards();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cardToDelete, setCardToDelete] = useState<{ id: string; title: string } | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(cards.map((c) => c.category))).sort();
    return ['All', ...unique];
  }, [cards]);

  const filteredCards = useMemo(() => {
    let result = cards;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(query));
    }

    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    return result;
  }, [cards, searchQuery, selectedCategory]);

  const handleDelete = async () => {
    if (!cardToDelete) return;
    await deleteCard(cardToDelete.id);
    setCardToDelete(null);
    addToast('Card deleted');
  };

  // Loading
  if (isLoading) {
    return (
      <Container className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </Container>
    );
  }

  // Error
  if (error) {
    return (
      <Container className="py-8">
        <EmptyState
          title="Something went wrong"
          description={error}
        />
      </Container>
    );
  }

  // No cards at all
  if (cards.length === 0) {
    return (
      <Container className="py-8">
        <EmptyState
          icon={<BookIcon />}
          title="No cards yet"
          description="Create your first card to start learning"
          action={
            <Button onClick={() => navigate('/cards/new')}>
              Add Card
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-6 pb-28 md:pb-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Library</h1>
        <Button
          className="hidden md:inline-flex"
          size="sm"
          onClick={() => navigate('/cards/new')}
        >
          <PlusIcon />
          <span className="ml-1">Add Card</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <SearchIcon />
        </div>
        <Input
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category filter chips */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              selectedCategory === cat
                ? 'bg-primary-600 text-text-inverse'
                : 'bg-surface-hover text-text-muted hover:text-text',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Card grid or filtered empty state */}
      {filteredCards.length === 0 ? (
        <EmptyState
          title="No matching cards"
          description="Try a different search or category"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredCards.map((card) => (
            <CardSurface
              key={card.id}
              hoverable
              className="relative cursor-pointer p-4"
              onClick={() => navigate(`/cards/${card.id}/edit`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/cards/${card.id}/edit`);
                }
              }}
            >
              {/* Top row: title + actions */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-medium text-text line-clamp-2">{card.title}</h3>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label="Edit card"
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cards/${card.id}/edit`);
                    }}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete card"
                    className="rounded-md p-1.5 text-text-muted hover:bg-forgot/10 hover:text-forgot transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCardToDelete({ id: card.id, title: card.title });
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              {/* Category badge */}
              <div className="mb-3">
                <Badge variant="primary">{card.category}</Badge>
              </div>

              {/* Bottom row: level + next review */}
              <div className="flex items-center justify-between">
                <LevelDots level={card.level} />
                <span className="text-xs text-text-muted">
                  {formatRelativeDate(card.nextReview)}
                </span>
              </div>
            </CardSurface>
          ))}
        </div>
      )}

      {/* Floating Action Button — mobile only */}
      <button
        type="button"
        aria-label="Add card"
        className={cn(
          'fixed bottom-20 right-4 z-40 md:hidden',
          'flex h-14 w-14 items-center justify-center rounded-full',
          'bg-primary-600 text-text-inverse shadow-lg',
          'hover:bg-primary-700 active:scale-95 transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        )}
        onClick={() => navigate('/cards/new')}
      >
        <PlusIcon />
      </button>

      {/* Delete confirmation modal */}
      <Modal
        open={cardToDelete !== null}
        onClose={() => setCardToDelete(null)}
        title="Delete Card"
      >
        <p className="mb-6 text-sm text-text-muted">
          Are you sure you want to delete &lsquo;{cardToDelete?.title}&rsquo;? This cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setCardToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </Container>
  );
}
