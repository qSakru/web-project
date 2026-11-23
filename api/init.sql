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
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
    group_id INTEGER REFERENCES movie_groups(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

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