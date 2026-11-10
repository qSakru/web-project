import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../models/db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

export const register = async (req, res, next) => {
  const { username, password } = req.body

  if (!username?.trim() || !password || password.length < 6) {
    return res.status(400).json({ error: 'Käyttäjätunnus ja salasana (vähintään 6 merkkiä) vaaditaan' })
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username.trim()]
    )
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Käyttäjätunnus on jo käytössä' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      [username.trim(), password_hash]
    )

    res.status(201).json({ message: 'Rekisteröityminen onnistui' })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  const { username, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username?.trim()]
    )
    const user = result.rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Väärä käyttäjätunnus tai salasana' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ user: { id: user.id, username: user.username } })
  } catch (error) {
    next(error)
  }
}

export const logout = (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Kirjauduttu ulos' })
}