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
      const response = await api.post('/auth/register', { username, password })
      console.log('Register response:', response.data)
      
      alert('Rekisteröityminen onnistui! Voit nyt kirjautua.')
      setIsLogin(true)
      setUsername('')
      setPassword('')
    }
  } catch (err) {
    console.error('Auth error:', err)
    setError(err.response?.data?.error || err.message || 'Jokin meni pieleen')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0b1622',
      padding: '1rem'
    }}>
      <div style={{
        background: '#142030',
        padding: '2.5rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        marginTop: '-25vh',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        border: '1px solid #20334d'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#e8f0f7' }}>
          {isLogin ? 'Kirjaudu' : 'Rekisteröidy'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a0b1c5' }}>
              Käyttäjätunnus
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '6px',
                border: '1px solid #20334d',
                background: '#101925',
                color: '#e8f0f7',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a0b1c5' }}>
              Salasana
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '6px',
                border: '1px solid #20334d',
                background: '#101925',
                color: '#e8f0f7',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              background: '#26A3D6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Odota...' : isLogin ? 'Kirjaudu' : 'Rekisteröidy'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#a0b1c5' }}>
          {isLogin ? 'Eikö sinulla ole tiliä?' : 'Onko sinulla jo tili?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#26A3D6',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {isLogin ? 'Rekisteröidy' : 'Kirjaudu'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Kirjaudu