import { Fragment, type ReactNode } from 'react';

/**
 * Wraps substrings of `text` that match `query` (case-insensitive) in a
 * <mark> element. Returns a React node ready for rendering.
 */
export function highlightMatches(text: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const needle = trimmed.toLowerCase();
  const haystack = text.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const idx = haystack.indexOf(needle, cursor);
    if (idx === -1) {
      parts.push(text.slice(cursor));
      break;
    }
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(<mark key={idx}>{text.slice(idx, idx + trimmed.length)}</mark>);
    cursor = idx + trimmed.length;
  }

  return <Fragment>{parts}</Fragment>;
}
