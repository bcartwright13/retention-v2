import { query } from './pool';
import { Card } from '../types';

interface CardRow {
  id: string;
  user_id: string;
  title: string;
  category: string;
  content: string;
  level: number;
  next_review: Date;
  last_reviewed: Date;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: CardRow): Card {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    content: row.content,
    level: row.level,
    nextReview: row.next_review.toISOString(),
    lastReviewed: row.last_reviewed.toISOString(),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function findAllByUserId(userId: string): Promise<Card[]> {
  const result = await query<CardRow>(
    'SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows.map(mapRow);
}

export async function findDueByUserId(userId: string): Promise<Card[]> {
  const result = await query<CardRow>(
    'SELECT * FROM cards WHERE user_id = $1 AND next_review <= NOW() ORDER BY next_review ASC',
    [userId]
  );
  return result.rows.map(mapRow);
}

export async function create(
  userId: string,
  data: { title: string; category?: string; content: string }
): Promise<Card> {
  const result = await query<CardRow>(
    `INSERT INTO cards (user_id, title, category, content)
     VALUES ($1, $2, COALESCE($3, 'General'), $4)
     RETURNING *`,
    [userId, data.title, data.category || null, data.content]
  );
  return mapRow(result.rows[0]);
}

export async function update(
  id: string,
  userId: string,
  data: { title?: string; category?: string; content?: string }
): Promise<Card | null> {
  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    setClauses.push(`title = $${paramIndex++}`);
    params.push(data.title);
  }
  if (data.category !== undefined) {
    setClauses.push(`category = $${paramIndex++}`);
    params.push(data.category);
  }
  if (data.content !== undefined) {
    setClauses.push(`content = $${paramIndex++}`);
    params.push(data.content);
  }

  setClauses.push(`updated_at = NOW()`);

  params.push(id);
  const idIndex = paramIndex++;
  params.push(userId);
  const userIdIndex = paramIndex;

  const result = await query<CardRow>(
    `UPDATE cards SET ${setClauses.join(', ')} WHERE id = $${idIndex} AND user_id = $${userIdIndex} RETURNING *`,
    params
  );

  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function remove(id: string, userId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM cards WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function findById(id: string, userId: string): Promise<Card | null> {
  const result = await query<CardRow>(
    'SELECT * FROM cards WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function updateReview(
  id: string,
  userId: string,
  level: number,
  nextReview: Date
): Promise<Card | null> {
  const result = await query<CardRow>(
    `UPDATE cards
     SET level = $1, next_review = $2, last_reviewed = NOW(), updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [level, nextReview.toISOString(), id, userId]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}
