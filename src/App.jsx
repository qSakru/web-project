import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/tests')
      setData(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      alert(`Haku: ${searchQuery}`) // tää täytyy muuttaa myöhemmin oikeaksi hakutoiminnoksi
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      {/* ========== NAVBAR ========== */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">Elokuvasovellus</div>

          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Hae elokuvia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Hae</button>
          </form>

          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li><a href="#etusivu">Etusivu</a></li>
            <li><a href="#ryhmät">Ryhmät</a></li>
            <li><a href="#listat">Toivelistat</a></li>
            <li><a href="#kirjaudu">Kirjaudu</a></li>
          </ul>

          <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>

      {/* KONTENTTI */}
        <div className="main-content">
         <h1>Docker Sample testi 1234</h1>
         <p>Docker test</p>

        <div className="card">
          {loading && <p>Loading...</p>}

          {!loading && !error && (
            <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
              <h3>Data from Backend:</h3>
              <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                {data.map((item) => (
                  <li key={item.id} style={{ marginBottom: '10px' }}>
                    {`ID: ${item.id} - ${item.description}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '60px', padding: '10px', background: '#ffebee', color: 'red' }}>
              <h3>Error:</h3>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App