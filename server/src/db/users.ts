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

export async function findOrCreateByGoogle(
  googleId: string,
  email: string,
  displayName: string
): Promise<User> {
  const result = await query<UserRow>(
    `INSERT INTO users (google_id, email, display_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (google_id) DO UPDATE SET email = $2, display_name = $3
     RETURNING *`,
    [googleId, email, displayName]
  );
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
