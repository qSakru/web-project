import { useState } from 'react';
import SearchBar from './SearchBar';
import {NavLink} from "react-router-dom"

function Navbar({ searchQuery, setSearchQuery, handleSearch,resetSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">Elokuvasovellus</div>

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          resetSearch={resetSearch}
        />

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><NavLink to="/">Etusivu</NavLink></li>
          <li><NavLink to="/ryhmät">Ryhmät</NavLink></li>
          <li><NavLink to="/listat">Toivelistat</NavLink></li>
          <li><NavLink to="/kirjaudu">Kirjaudu</NavLink></li>
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
  );
}

export default Navbar;