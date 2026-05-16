import { query } from './pool';
import { User } from '../types';

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  google_id: string;
  created_at: Date;
}

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at.toISOString(),
  };
}

const MAX_DISPLAY_NAME_LENGTH = 100;

export async function findOrCreateByGoogle(
  googleId: string,
  email: string,
  displayName: string
): Promise<User> {
  // M4: Cap display_name length defensively — Google has no documented
  // upper bound and we don't want unbounded data hitting the DB.
  const safeDisplayName = displayName.slice(0, MAX_DISPLAY_NAME_LENGTH);

  // M4: Only fire DO UPDATE when something actually changed. Otherwise every
  // login produces a no-op UPDATE that bumps xmin and wastes WAL.
  const result = await query<UserRow>(
    `INSERT INTO users (google_id, email, display_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (google_id) DO UPDATE
       SET email = EXCLUDED.email, display_name = EXCLUDED.display_name
       WHERE users.email <> EXCLUDED.email
          OR users.display_name <> EXCLUDED.display_name
     RETURNING *`,
    [googleId, email, safeDisplayName]
  );

  // When the WHERE clause skips the update we get no RETURNING row; fall
  // back to a SELECT so the caller always gets the canonical user.
  if (result.rows.length === 0) {
    const existing = await query<UserRow>(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return mapRow(existing.rows[0]);
  }

  return mapRow(result.rows[0]);
}

export async function findById(id: string): Promise<User | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}
