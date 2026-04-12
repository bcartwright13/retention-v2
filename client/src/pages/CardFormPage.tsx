import { useState, useMemo, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import { useToastStore } from '../stores/toastStore';
import { Container } from '../components/layout/Container';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Rule } from '../components/ui/Rule';
import { CardContent } from '../components/cards/CardContent';

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

  const [title, setTitle] = useState(existingCard?.title ?? '');
  const [category, setCategory] = useState(existingCard?.category ?? '');
  const [content, setContent] = useState(existingCard?.content ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  // Hydrate form when the edit card finally arrives
  const [syncedCardId, setSyncedCardId] = useState<string | null>(null);
  if (existingCard && syncedCardId !== existingCard.id) {
    setTitle(existingCard.title);
    setCategory(existingCard.category);
    setContent(existingCard.content);
    setSyncedCardId(existingCard.id);
  }

  const uniqueCategories = useMemo(() => {
    const cats = new Set(cards.map((c) => c.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [cards]);

  function validate(): boolean {
    const next: { title?: string; content?: string } = {};
    if (!title.trim()) next.title = 'a title is required';
    if (!content.trim()) next.content = 'content is required';
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
        addToast('Card updated.');
      } else {
        await createCard(input);
        addToast('Card added to the library.');
      }
      navigate('/');
    } catch {
      setIsSaving(false);
    }
  }

  // ── Edge: edit mode, card not found ─────────────────────────────────
  if (isEditMode && !isLoading && cards.length > 0 && !existingCard) {
    return (
      <Container className="py-16 text-center">
        <p className="small-caps text-ochre mb-4">§ &nbsp; missing</p>
        <h2 className="font-display text-4xl text-ink mb-4">Card not found.</h2>
        <p className="font-serif-body italic text-ink-soft mb-8">
          This page has been removed, or was never written.
        </p>
        <Link to="/" className="small-caps text-ochre hover:text-ochre-ink transition-colors">
          ← back to library
        </Link>
      </Container>
    );
  }

  if (isEditMode && isLoading && !existingCard) {
    return (
      <Container className="py-16 flex justify-center">
        <Spinner size="lg" />
      </Container>
    );
  }

  const resolvedCategory = category.trim() || 'General';
  const resolvedTitle = title.trim() || 'Untitled';

  return (
    <>
      <Container className="pb-32 md:pb-24">
        {/* Running head */}
        <header className="mb-10">
          <p className="small-caps text-ink-muted mb-2">
            {isEditMode ? '§ editing' : '§ new entry'}
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-ink leading-none">
            {isEditMode ? 'Edit card' : 'New card'}
          </h1>
          <p className="font-serif-body italic text-ink-soft mt-3">
            — one idea, set in its own words.
          </p>
        </header>

        <Rule className="mb-10" />

        {isPreviewing ? (
          // ── Preview ───────────────────────────────────────────────
          <div>
            <p className="small-caps text-ochre mb-6">preview</p>
            <article>
              <header className="flex items-baseline justify-between mb-6">
                <span className="small-caps text-ochre">{resolvedCategory}</span>
              </header>
              <h2 className="font-display text-4xl md:text-5xl text-ink leading-[1.05] mb-8 [text-wrap:balance]">
                {resolvedTitle}
              </h2>
              <Rule label="answer" className="mb-6" />
              <CardContent content={content.trim() || 'No content yet.'} />
            </article>

            <button
              type="button"
              onClick={() => setIsPreviewing(false)}
              className="small-caps mt-12 text-ochre hover:text-ochre-ink transition-colors"
            >
              ← back to editing
            </button>
          </div>
        ) : (
          // ── Form ──────────────────────────────────────────────────
          <form id="card-form" onSubmit={handleSubmit} className="space-y-10">
            <Input
              label="title"
              placeholder="a word, a phrase, a question"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
              }}
              error={errors.title}
              required
              maxLength={200}
            />

            <div>
              <Input
                label="category"
                placeholder="vocabulary · code · quotes · …"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-options"
                maxLength={50}
              />
              <datalist id="category-options">
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <Textarea
              label="content"
              placeholder="the definition, the code, the passage…"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors((p) => ({ ...p, content: undefined }));
              }}
              error={errors.content}
              required
              className="min-h-[200px]"
              maxLength={10000}
            />

            <p className="small-caps-sm text-ink-muted">
              markdown supported: **bold**, *italic*, `code`, and fenced code blocks
            </p>

            <button
              type="button"
              onClick={() => setIsPreviewing(true)}
              className="small-caps text-ochre hover:text-ochre-ink transition-colors"
            >
              preview card →
            </button>
          </form>
        )}
      </Container>

      {/* Sticky footer — hairline rule + text-link actions */}
      <div className="fixed bottom-0 inset-x-0 bg-paper/95 backdrop-blur border-t border-rule z-10">
        <Container className="flex items-center justify-between gap-3 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="small-caps text-ink-muted hover:text-ink transition-colors"
          >
            ← cancel
          </button>
          <Button
            type="submit"
            form="card-form"
            variant="primary"
            disabled={isSaving || isPreviewing}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                saving
              </span>
            ) : isEditMode ? (
              'save changes'
            ) : (
              'add to library'
            )}
          </Button>
        </Container>
      </div>
    </>
  );
}
