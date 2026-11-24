
import { pool } from './db.js'

// luo ryhmän ja lisää luojan ylläpitäjäksi, dollarimerkit suojaavat SQL-injektioilta
const createGroup = async (name, description, isPrivate, userId) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // luo ryhmä
    const groupResult = await client.query(
      `INSERT INTO movie_groups (name, description, created_by, is_private)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, userId, isPrivate]
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
      `SELECT id, is_private FROM movie_groups WHERE id = $1 FOR UPDATE`,
      [groupId]
    )
    if (groupResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'not_found' }
    }

    const memberResult = await client.query(
      `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    )
    if (memberResult.rows.length > 0) {
      await client.query('COMMIT')
      return { status: 'already_member' }
    }

    if (groupResult.rows[0].is_private) {
      await client.query('COMMIT')
      return { status: 'private_group' }
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

const createGroupJoinRequest = async (groupId, userId) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const groupResult = await client.query(
      `SELECT id, is_private FROM movie_groups WHERE id = $1 FOR UPDATE`,
      [groupId]
    )
    if (groupResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'not_found' }
    }

    if (!groupResult.rows[0].is_private) {
      await client.query('COMMIT')
      return { status: 'public_group' }
    }

    const memberResult = await client.query(
      `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    )
    if (memberResult.rows.length > 0) {
      await client.query('COMMIT')
      return { status: 'already_member' }
    }

    const result = await client.query(
      `INSERT INTO group_join_requests (group_id, user_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (group_id, user_id)
       DO UPDATE SET status = 'pending', requested_at = NOW()
       WHERE group_join_requests.status <> 'pending'
       RETURNING user_id`,
      [groupId, userId]
    )

    await client.query('COMMIT')
    return result.rows.length > 0
      ? { status: 'requested' }
      : { status: 'already_pending' }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

const getGroupJoinRequest = async (groupId, userId) => {
  const result = await pool.query(
    `SELECT status
     FROM group_join_requests
     WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  )
  return result.rows[0] || null
}

const getGroupJoinRequests = async (groupId, currentUserId) => {
  const result = await pool.query(
    `SELECT
       group_join_requests.user_id AS id,
       users.username,
       group_join_requests.requested_at
     FROM group_join_requests
     JOIN users ON users.id = group_join_requests.user_id
     JOIN group_members
       ON group_members.group_id = group_join_requests.group_id
      AND group_members.user_id = $2
      AND group_members.role = 'admin'
     WHERE group_join_requests.group_id = $1
       AND group_join_requests.status = 'pending'
     ORDER BY group_join_requests.requested_at`,
    [groupId, currentUserId]
  )
  return result.rows
}

const reviewGroupJoinRequest = async (groupId, currentUserId, requesterId, decision) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const groupResult = await client.query(
      `SELECT id, is_private FROM movie_groups WHERE id = $1 FOR UPDATE`,
      [groupId]
    )
    if (groupResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'not_found' }
    }

    const adminResult = await client.query(
      `SELECT role
       FROM group_members
       WHERE group_id = $1 AND user_id = $2
       FOR UPDATE`,
      [groupId, currentUserId]
    )
    if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 'admin') {
      await client.query('COMMIT')
      return { status: 'not_admin' }
    }

    const requestResult = await client.query(
      `SELECT status
       FROM group_join_requests
       WHERE group_id = $1 AND user_id = $2
       FOR UPDATE`,
      [groupId, requesterId]
    )
    if (requestResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'request_not_found' }
    }
    if (requestResult.rows[0].status !== 'pending') {
      await client.query('COMMIT')
      return { status: 'request_already_reviewed' }
    }

    if (decision === 'approve') {
      await client.query(
        `INSERT INTO group_members (group_id, user_id, role)
         VALUES ($1, $2, 'member')
         ON CONFLICT (group_id, user_id) DO NOTHING`,
        [groupId, requesterId]
      )
    }

    await client.query(
      `UPDATE group_join_requests
       SET status = $3
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, requesterId, decision === 'approve' ? 'approved' : 'rejected']
    )

    await client.query('COMMIT')
    return { status: decision === 'approve' ? 'approved' : 'rejected' }
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

    // Ylläpitäjä voi poistua vain, jos ryhmään jää toinen ylläpitäjä.
    if (role === 'admin' && memberCount > 1) {
      const otherAdminsResult = await client.query(
        `SELECT COUNT(*)
         FROM group_members
         WHERE group_id = $1 AND role = 'admin' AND user_id <> $2`,
        [groupId, userId]
      )

      if (Number(otherAdminsResult.rows[0].count) === 0) {
        await client.query('COMMIT')
        return { status: 'admin_must_transfer' }
      }
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

// Antaa ylläpitäjän oikeudet ryhmän jäsenelle.
const promoteMemberToAdmin = async (groupId, currentUserId, newAdminId) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Lukitaan ryhmä siirron ajaksi
    const groupResult = await client.query(
      `SELECT id FROM movie_groups WHERE id = $1 FOR UPDATE`,
      [groupId]
    )

    if (groupResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'not_found' }
    }

    // Tarkistetaan, että pyynnön tekijä on ylläpitäjä
    const currentAdminResult = await client.query(
      `SELECT role
       FROM group_members
       WHERE group_id = $1 AND user_id = $2
       FOR UPDATE`,
      [groupId, currentUserId]
    )

    if (
      currentAdminResult.rows.length === 0 ||
      currentAdminResult.rows[0].role !== 'admin'
    ) {
      await client.query('COMMIT')
      return { status: 'not_admin' }
    }

    // Ylläpitäjä ei voi siirtää oikeuksia itselleen
    if (Number(currentUserId) === Number(newAdminId)) {
      await client.query('COMMIT')
      return { status: 'same_user' }
    }

    // Tarkistetaan, että uusi ylläpitäjä kuuluu ryhmään
    const newAdminResult = await client.query(
      `SELECT role
       FROM group_members
       WHERE group_id = $1 AND user_id = $2
       FOR UPDATE`,
      [groupId, newAdminId]
    )

    if (newAdminResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'target_not_member' }
    }

    if (newAdminResult.rows[0].role === 'admin') {
      await client.query('COMMIT')
      return { status: 'already_admin' }
    }

    await client.query(
      `UPDATE group_members
       SET role = 'admin'
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, newAdminId]
    )

    await client.query('COMMIT')

    return { status: 'promoted' }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

const removeGroupMember = async (groupId, currentUserId, memberId) => {
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

    const adminResult = await client.query(
      `SELECT role
       FROM group_members
       WHERE group_id = $1 AND user_id = $2
       FOR UPDATE`,
      [groupId, currentUserId]
    )

    if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 'admin') {
      await client.query('COMMIT')
      return { status: 'not_admin' }
    }

    const memberResult = await client.query(
      `SELECT role
       FROM group_members
       WHERE group_id = $1 AND user_id = $2
       FOR UPDATE`,
      [groupId, memberId]
    )

    if (memberResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'target_not_member' }
    }

    if (memberResult.rows[0].role !== 'member') {
      await client.query('COMMIT')
      return { status: 'target_not_regular_member' }
    }

    await client.query(
      `DELETE FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, memberId]
    )

    await client.query('COMMIT')
    return { status: 'removed' }
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
  createGroupJoinRequest,
  getGroupJoinRequest,
  getGroupJoinRequests,
  reviewGroupJoinRequest,
  leaveGroup,
  promoteMemberToAdmin,
  removeGroupMember
}
