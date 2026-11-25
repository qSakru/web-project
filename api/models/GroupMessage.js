import { pool } from '../models/db.js'

const getGroupMessages = async (groupId, userId, limit = 50) => {

    const memberShipResult = await pool.query(
        'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, userId]
    );

    if (memberShipResult.rows.length === 0) {
        return {status: 'not_member'};
    }

    //hakee uusimmat viestit ja lähettäjien käyttäjänimet
    const result = await pool.query(
       `SELECT
       gm.id,
       gm.group_id,
       gm.user_id,
       u.username,
       gm.message,
       gm.created_at
     FROM group_messages gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1
     ORDER BY gm.created_at DESC, gm.id DESC
     LIMIT $2`,
    [groupId, limit]
  )
  return {
    status: 'ok',
    messages: result.rows.reverse()
  }

}

const createGroupMessage = async (groupId, userId, message) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');


     // Tarkistaa onko ryhmä olemassa
    const groupResult = await client.query(
      `SELECT id
       FROM movie_groups
       WHERE id = $1
       FOR SHARE`,
      [groupId]
    )

     if (groupResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'not_found' }
    }
 const membershipResult = await client.query(
      `SELECT 1
       FROM group_members
       WHERE group_id = $1 AND user_id = $2
       FOR SHARE`,
      [groupId, userId]
    )

    if (membershipResult.rows.length === 0) {
      await client.query('COMMIT')
      return { status: 'not_member' }
    }

    // viestin tallennus
 const insertResult = await client.query(
      `INSERT INTO group_messages
         (group_id, user_id, message)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [groupId, userId, message]
    )

     const messageResult = await client.query(
      `SELECT
         gm.id,
         gm.group_id,
         gm.user_id,
         u.username,
         gm.message,
         gm.created_at
       FROM group_messages gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.id = $1`,
      [insertResult.rows[0].id]
    )
    await client.query('COMMIT')
    return { status: 'ok', message: messageResult.rows[0] }

    } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}


export {
  getGroupMessages,
  createGroupMessage
}

