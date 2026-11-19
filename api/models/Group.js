
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

const getGroupById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM movie_groups WHERE id = $1',
    [id]
  )

  return result.rows[0] || null
}
const getGroupMembers = async(groupId) => {
  const result = await pool.query (
    `SELECT
    users.id,
    users.username,
    group_members.role
FROM group_members
JOIN users
    ON group_members.user_id = users.id
WHERE group_members.group_id = $1`,
    [groupId]
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
const joinGroup = async (groupId, userId) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const groupResult = await client.query(
      `SELECT id FROM movie_groups WHERE id = $1 FOR UPDATE`,
      [groupId]
    )
    if (groupResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'not_found' }
    }
    // lisää käyttäjän jäseneksi
    const result = await client.query (
      `INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, 'member')
      ON CONFLICT (group_id, user_id) DO NOTHING
      RETURNING *`,
      [groupId, userId]
    )
    await client.query('COMMIT')
    if (result.rows.length === 0) {
      return { status: 'already_member' }
    }
    return { status: 'joined' }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// poistaa käyttäjän ryhmästä
const leaveGroup = async (groupId, userId) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const groupResult = await client.query(
      `SELECT id FROM movie_groups WHERE id = $1 FOR UPDATE`,
      [groupId]
    )
    if (groupResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'not_found' }
    }
    // tarkistetaan käyttäjän rooli ryhmässä
    const memberResult = await client.query(
      `SELECT role
      FROM group_members
      WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    )
    if (memberResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'not_member' }
    }
    const role = memberResult.rows[0].role

    //ryhmän jäsenmäärän selvitys
    const countResult = await client.query(
      `SELECT COUNT(*) FROM group_members WHERE group_id = $1`,
      [groupId]
    )
    const memberCount = Number(countResult.rows[0].count)

    // ylläpitäjä ei voi poistua, jos on muita jäseniä
    if (role === 'admin' && memberCount > 1) {
      await client.query('COMMIT')
      return { status: 'admin_must_transfer'}
    }
    // jos ylläpitäjä on ainoa jäsen poistuessa ryhmästä, ryhmä poistetaan
    if (role === 'admin' && memberCount === 1) {
      await client.query(
        `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      )
      await client.query(
        `DELETE FROM movie_groups WHERE id = $1`,
        [groupId]
      )
      await client.query('COMMIT')
      return { status: 'group_deleted'}
    }
    // tavallinen jäsen voi poistua ryhmästä
    await client.query(
      `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    )
    await client.query('COMMIT')
    return { status: 'left'}
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()

  }
}


export {
  createGroup,
  getGroupsByUser,
  getAllGroups,
  getGroupById,
  getGroupMembers,
  joinGroup,
  leaveGroup
}
