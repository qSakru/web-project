import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

export const authenticate = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Ei kirjautunut' })

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Virheellinen tai vanhentunut token' })
  }
}