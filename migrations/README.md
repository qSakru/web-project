# Database migrations

Add forward-only SQL migrations here using names that sort in the intended
execution order, for example `001_add_movie_rating.sql`. Applied files are
recorded in `public.schema_migrations`; do not edit or rename a migration after
it has been applied. Add a new migration for each subsequent change.

The runner wraps each file in a transaction. Do not put `BEGIN`, `COMMIT`, or
`ROLLBACK` statements in migration files.

Do not add destructive statements such as `DROP TABLE`, `DROP DATABASE`, or
`TRUNCATE`.

The existing Azure database is adopted without replaying its schema: the first
run creates only the migration tracking table, and this directory intentionally
contains no initial schema migration. Do not copy `api/init.sql` here. Check
that a migration is appropriate for both the existing database and its data
before merging it to `main`.
