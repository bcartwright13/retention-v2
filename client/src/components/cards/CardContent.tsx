import { Fragment, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardContentProps {
  content: string;
  className?: string;
}

/**
 * Minimal, dependency-free markdown-lite renderer tuned for single-idea
 * cards. Supports:
 *   - Fenced code blocks ```lang ... ```
 *   - Inline `code`
 *   - **bold** and *italic* / _italic_
 *   - Blank-line separated paragraphs with preserved newlines
 *
 * Intentionally limited — card content is short; headings and lists
 * would encourage long-form writing that fights the one-idea discipline.
 */
export function CardContent({ content, className }: CardContentProps) {
  const blocks = useBlocks(content);

  return (
    <div className={cn('font-serif-body text-lg md:text-xl text-ink-soft leading-[1.65] space-y-5 max-w-[62ch]', className)}>
      {blocks.map((block, i) =>
        block.type === 'code' ? (
          <figure key={i} className="not-italic">
            {block.lang && (
              <figcaption className="small-caps-sm text-ink-muted mb-2">
                {block.lang}
              </figcaption>
            )}
            <pre className="overflow-x-auto border-y border-rule bg-paper-alt/60 px-4 md:px-5 py-4">
              <code className="font-mono-code text-[0.875rem] leading-relaxed text-ink">
                {block.text}
              </code>
            </pre>
          </figure>
        ) : (
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(block.text)}
          </p>
        ),
      )}
    </div>
  );
}

// ─── Block parser ─────────────────────────────────────────────────────
type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'code'; text: string; lang?: string };

function useBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.split('\n');
  let i = 0;
  let buffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length === 0) return;
    const text = buffer.join('\n').replace(/\n{3,}/g, '\n\n');
    // Split on blank lines into sub-paragraphs
    for (const chunk of text.split(/\n\s*\n/)) {
      const t = chunk.trim();
      if (t) blocks.push({ type: 'paragraph', text: t });
    }
    buffer = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    // Invariant: lang capture is strictly \w+ (alnum + underscore) — used as a label only, never executed.
    const fenceMatch = line.match(/^```(\w+)?\s*$/);
    if (fenceMatch) {
      flushParagraph();
      const lang = fenceMatch[1];
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', text: codeLines.join('\n'), lang });
      i++; // skip closing fence
      continue;
    }
    buffer.push(line);
    i++;
  }
  flushParagraph();

  return blocks;
}

// ─── Inline parser (code, bold, italic) ───────────────────────────────
function renderInline(text: string): ReactNode {
  // Bounded surface to neutralize any pathological backtracking on the alternation below.
  if (text.length > 5000) return text;
  const tokens: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > last) tokens.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('`')) {
      tokens.push(
        <code
          key={key++}
          className="font-mono-code text-[0.85em] bg-paper-alt px-1.5 py-0.5 rounded-sm border border-rule text-ink"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**')) {
      tokens.push(
        <strong key={key++} className="font-medium text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      tokens.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return <Fragment>{tokens}</Fragment>;
}
