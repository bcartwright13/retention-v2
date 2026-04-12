CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    content TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 5),
    next_review TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_user_id_next_review ON cards(user_id, next_review);
