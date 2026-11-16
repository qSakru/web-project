import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Client } = pg
const migrationsDirectory = fileURLToPath(new URL('../../migrations/', import.meta.url))
const lockKey = [1870030194, 1]

function getDatabaseConfig() {
  const database = process.env.DB_NAME || process.env.DBNAME
  const requiredVariables = {
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: database,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_PORT: process.env.DB_PORT,
  }
  const missingVariables = Object.entries(requiredVariables)
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missingVariables.length > 0) {
    throw new Error(`Missing database environment variables: ${missingVariables.join(', ')}`)
  }

  const port = Number(process.env.DB_PORT)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535')
  }

  return {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database,
    password: process.env.DB_PASSWORD,
    port,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }
}

async function getMigrationFiles() {
  const entries = await readdir(migrationsDirectory, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
}

async function runMigrations(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      migration_name text PRIMARY KEY,
      executed_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  const { rows } = await client.query(
    'SELECT migration_name FROM public.schema_migrations',
  )
  const completedMigrations = new Set(rows.map((row) => row.migration_name))
  const migrationFiles = await getMigrationFiles()

  for (const migrationName of migrationFiles) {
    if (completedMigrations.has(migrationName)) {
      console.log(`Skipping already applied migration: ${migrationName}`)
      continue
    }

    const migrationPath = path.join(migrationsDirectory, migrationName)
    const sql = await readFile(migrationPath, 'utf8')
    if (!sql.trim()) {
      throw new Error(`Migration file is empty: ${migrationName}`)
    }

    await client.query('BEGIN')
    try {
      await client.query(sql)
      await client.query(
        'INSERT INTO public.schema_migrations (migration_name) VALUES ($1)',
        [migrationName],
      )
      await client.query('COMMIT')
      completedMigrations.add(migrationName)
      console.log(`Applied migration: ${migrationName}`)
    } catch (error) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        throw new Error(
          `Migration ${migrationName} failed and rollback also failed: ${rollbackError.message}`,
          { cause: error },
        )
      }

      throw new Error(`Migration failed: ${migrationName}`, { cause: error })
    }
  }

  if (migrationFiles.length === 0) {
    console.log('No SQL migrations found.')
  }
}

async function main() {
  const client = new Client(getDatabaseConfig())
  let lockAcquired = false

  try {
    await client.connect()
    await client.query('SELECT pg_advisory_lock($1, $2)', lockKey)
    lockAcquired = true
    await runMigrations(client)
  } finally {
    try {
      if (lockAcquired) {
        await client.query('SELECT pg_advisory_unlock($1, $2)', lockKey)
      }
    } finally {
      await client.end()
    }
  }
}

main().catch((error) => {
  console.error('Database migration failed:', error)
  process.exitCode = 1
})
