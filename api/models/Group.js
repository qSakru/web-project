
import { pool } from './db.js'

// luo ryhmän ja lisää luojan ylläpitäjäksi, dollarimerkit suojaavat SQL-injektioilta
const createGroup = async (name, description, userId) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // luo ryhmä
    const groupResult = await client.query(
      `INSERT INTO movie_groups (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, userId]
    )

    const group = groupResult.rows[0]

    // lisää luoja ryhmän jäseneksi ylläpitäjäroolilla
    await client.query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [group.id, userId, 'admin']
    )

    await client.query('COMMIT')

    return group
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
const getAllGroups = async () => {
    const result = await pool.query (
        `SELECT * FROM movie_groups
        ORDER BY created_at DESC`
    )
    return result.rows
}


// Hae kaikki ryhmät, joihin käyttäjä kuuluu
const getGroupsByUser = async (userId) => {
  const result = await pool.query(
    `SELECT movie_groups.*
     FROM movie_groups
     JOIN group_members
       ON movie_groups.id = group_members.group_id
     WHERE group_members.user_id = $1
     ORDER BY movie_groups.created_at DESC`,
    [userId]
  )

  return result.rows
}

export {
  createGroup,
  getGroupsByUser,
    getAllGroups
}
