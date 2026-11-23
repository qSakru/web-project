import { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

function Kirjaudu() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        await api.post('/auth/login', { username, password })
        navigate('/')
      } else {
        await api.post('/auth/register', { username, password })
        alert('Rekisteröityminen onnistui! Voit nyt kirjautua.')
        setIsLogin(true)
        setUsername('')
        setPassword('')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Jokin meni pieleen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>{isLogin ? 'Kirjaudu' : 'Rekisteröidy'}</h1>

        <form onSubmit={handleSubmit}>
          <label>Käyttäjätunnus</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Salasana</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p style={{ color: '#ff6b6b', textAlign: 'center', margin: '0.5rem 0' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Odota...' : isLogin ? 'Kirjaudu' : 'Rekisteröidy'}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {isLogin ? 'Eikö sinulla ole tiliä?' : 'Onko sinulla jo tili?'}
          </span>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#26A3D6',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            {isLogin ? 'Rekisteröidy' : 'Kirjaudu'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Kirjaudu