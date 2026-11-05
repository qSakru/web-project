import { useState } from 'react';
import SearchBar from './SearchBar';

function Navbar({ searchQuery, setSearchQuery, handleSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">Elokuvasovellus</div>

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
        />

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><a href="#etusivu">Etusivu</a></li>
          <li><a href="#ryhmät">Ryhmät</a></li>
          <li><a href="#listat">Toivelistat</a></li>
          <li><a href="#kirjaudu">Kirjaudu</a></li>
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