import { pool } from '../models/db.js'

export const createReview = async (req, res, next) => {
  const { movieId, rating, comment } = req.body
  const userId = req.user.id

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Arvosana 1–5 vaaditaan' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, movie_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, movie_id)
       DO UPDATE SET rating = $3, comment = $4, created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, movieId, rating, comment]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
}

export const getReviews = async (req, res, next) => {
  const { movieId } = req.params

  try {
    const result = await pool.query(
      `SELECT r.*, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.movie_id = $1
       ORDER BY r.created_at DESC`,
      [movieId]
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
}