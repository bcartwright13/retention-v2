import { useState, useMemo, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import { useToastStore } from '../stores/toastStore';
import { Container } from '../components/layout/Container';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CardSurface } from '../components/ui/CardSurface';
import { Spinner } from '../components/ui/Spinner';

export default function CardFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cards, isLoading, createCard, updateCard } = useCards();
  const addToast = useToastStore((s) => s.addToast);

  const isEditMode = Boolean(id);
  const existingCard = useMemo(
    () => (id ? cards.find((c) => c.id === id) : undefined),
    [id, cards],
  );

  // Form state
  const [title, setTitle] = useState(existingCard?.title ?? '');
  const [category, setCategory] = useState(existingCard?.category ?? '');
  const [content, setContent] = useState(existingCard?.content ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  // Sync form when card loads in edit mode
  const [syncedCardId, setSyncedCardId] = useState<string | null>(null);
  if (existingCard && syncedCardId !== existingCard.id) {
    setTitle(existingCard.title);
    setCategory(existingCard.category);
    setContent(existingCard.content);
    setSyncedCardId(existingCard.id);
  }

  // Unique categories for datalist autocomplete
  const uniqueCategories = useMemo(() => {
    const cats = new Set(cards.map((c) => c.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [cards]);

  function validate(): boolean {
    const next: { title?: string; content?: string } = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!content.trim()) next.content = 'Content is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const input = {
      title: title.trim(),
      category: category.trim() || 'General',
      content: content.trim(),
    };

    setIsSaving(true);
    try {
      if (isEditMode && id) {
        await updateCard(id, input);
        addToast('Card updated');
      } else {
        await createCard(input);
        addToast('Card created');
      }
      navigate('/');
    } catch {
      // Error is surfaced via the store
      setIsSaving(false);
    }
  }

  // --- Edge case: edit mode, cards loaded, but card not found ---
  if (isEditMode && !isLoading && cards.length > 0 && !existingCard) {
    return (
      <Container className="py-8">
        <CardSurface className="p-8 text-center">
          <h2 className="text-lg font-semibold text-text mb-2">Card not found</h2>
          <p className="text-sm text-text-muted mb-4">
            The card you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Back to Library
          </Link>
        </CardSurface>
      </Container>
    );
  }

  // --- Loading state for edit mode ---
  if (isEditMode && isLoading && !existingCard) {
    return (
      <Container className="py-8 flex justify-center">
        <Spinner size="lg" />
      </Container>
    );
  }

  const resolvedCategory = category.trim() || 'General';

  return (
    <>
      <Container className="py-8 pb-28">
        <h1 className="text-2xl font-bold text-text mb-6">
          {isEditMode ? 'Edit Card' : 'New Card'}
        </h1>

        {isPreviewing ? (
          /* ---- Preview mode ---- */
          <div className="space-y-4">
            <CardSurface className="p-6">
              <h2 className="text-lg font-semibold text-text mb-2">
                {title.trim() || 'Untitled'}
              </h2>
              <Badge variant="primary">{resolvedCategory}</Badge>
              <hr className="my-4 border-border" />
              <p className="text-sm text-text whitespace-pre-wrap">
                {content.trim() || 'No content yet.'}
              </p>
            </CardSurface>

            <button
              type="button"
              onClick={() => setIsPreviewing(false)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Back to editing
            </button>
          </div>
        ) : (
          /* ---- Form mode ---- */
          <form id="card-form" onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Title"
              placeholder="e.g., Java: String to Int"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
              }}
              error={errors.title}
              required
            />

            <div>
              <Input
                label="Category"
                placeholder="e.g., Programming"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-options"
              />
              <datalist id="category-options">
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <Textarea
              label="Content"
              placeholder="The answer or detail you want to remember..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors((p) => ({ ...p, content: undefined }));
              }}
              error={errors.content}
              required
              className="min-h-[200px]"
            />

            <button
              type="button"
              onClick={() => setIsPreviewing(true)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Preview card
            </button>
          </form>
        )}
      </Container>

      {/* ---- Sticky footer ---- */}
      <div className="fixed bottom-0 inset-x-0 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <Container className="flex items-center justify-end gap-3 py-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="card-form"
            variant="primary"
            disabled={isSaving || isPreviewing}
            onClick={isPreviewing ? undefined : undefined}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="text-text-inverse" />
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </Button>
        </Container>
      </div>
    </>
  );
}
