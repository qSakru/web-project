import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

function SearchBar({ searchQuery, setSearchQuery, handleSearch }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      try {
        const res = await axios.get(`/api/suggestions?query=${encodeURIComponent(searchQuery)}`)
        setSuggestions(res.data.results || [])
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionClick = (item) => {
    const text = item.media_type === 'movie' ? item.title : item.name
    setSearchQuery(text)
    setShowSuggestions(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1 }}>
      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Hae elokuvia, näyttelijöitä..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        <button type="submit">Hae</button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((item) => (
            <li key={`${item.media_type}-${item.id}`} onClick={() => handleSuggestionClick(item)}>
              {item.media_type === 'movie' ? (
                <>
                  <strong>{item.title}</strong>
                  {item.release_date && (
                    <span> ({item.release_date.slice(0, 4)})</span>
                  )}
                </>
              ) : (
                <>
                  <strong>{item.name}</strong>
                  <span> (Näyttelijä)</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar