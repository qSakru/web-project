CREATE TABLE group_messages (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES movie_groups(id)
        ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,
    message TEXT NOT NULL CHECK (
        char_length(btrim(message)) > 0
        AND char_length(message) <= 2000
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX group_messages_group_created_at_idx
ON group_messages(group_id, created_at, id);