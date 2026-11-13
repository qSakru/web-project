import { useState, useEffect } from 'react'
import SearchBar from './SearchBar'
import { NavLink, useLocation } from 'react-router-dom'
import api from '../services/api'

function Navbar({ searchQuery, setSearchQuery, handleSearch, resetSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data.user)
      } catch {
        setUser(null)
      }
    }
    checkUser()
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      setUser(null)
      setIsMenuOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => { resetSearch?.(); closeMenu() }} style={{ cursor: 'pointer' }}>
          Elokuvasovellus
        </div>

        {/* Desktop-haku */}
        <div className="desktop-search">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {/* Mobiili-haku */}
          <li className="mobile-search">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
            />
          </li>

          <li><NavLink to="/" onClick={() => { resetSearch?.(); closeMenu() }}>Etusivu</NavLink></li>
          <li><NavLink to="/ryhmät" onClick={closeMenu}>Ryhmät</NavLink></li>
          <li><NavLink to="/listat" onClick={closeMenu}>Toivelistat</NavLink></li>

          {user ? (
            <>
              <li className="user-info">
                <span className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <span className="user-name">{user.username}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Kirjaudu ulos
                </button>
              </li>
            </>
          ) : (
            <li><NavLink to="/kirjaudu" className="logout-btn" onClick={closeMenu}>Kirjaudu</NavLink></li>
          )}
        </ul>

        <div
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar