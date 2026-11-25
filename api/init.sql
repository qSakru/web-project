-- Database is automatically created from POSTGRES_DB environment variable
-- No need to create database manually since PostgreSQL container handles this

DROP TABLE IF EXISTS test;
--DROP TABLE IF EXISTS users;

CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    description TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE movie_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
    group_id INTEGER REFERENCES movie_groups(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE group_join_requests (
    group_id INTEGER REFERENCES movie_groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);
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


CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, movie_id)
);

INSERT INTO test (description) VALUES ('bar'), ('baz'), ('qux');