import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import Navbar from './components/Navbar'
import Etusivu from './pages/Etusivu'
import Elokuvasivu from './pages/Elokuvasivu'
import Kirjaudu from './pages/Kirjaudu'
import Listat from './pages/Listat'
import Ryhmät from './pages/Ryhmät'
import Ryhmäsivu from './pages/Ryhmäsivu'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  const handleSearch = async (event, page = 1) => {
    if (event) event.preventDefault()
    if (!searchQuery.trim()) return

    setHasSearched(true)
    setCurrentPage(page)

    try {
      const res = await axios.get(`/api/search?query=${encodeURIComponent(searchQuery)}&page=${page}`)
      setMovies(res.data.results || [])
      setTotalPages(res.data.total_pages || 1)
    } catch (error) {
      console.error('Search failed:', error)
      setMovies([])
      setTotalPages(1)
    }

    navigate('/')
  }

  const handlePageChange = (newPage) => {
    handleSearch(null, newPage)
  }

  const resetSearch = () => {
    setHasSearched(false)
    setMovies([])
    setSearchQuery('')
    setCurrentPage(1)
    setTotalPages(1)
  }

  return (
    <>
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        resetSearch={resetSearch}
      />

      <Routes>
        <Route 
          path="/" 
          element={
            <Etusivu 
              movies={movies} 
              hasSearched={hasSearched}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          } 
        />
        <Route path="/Ryhmät" element={<Ryhmät />} />
        <Route path="/Ryhmät/:id" element={<Ryhmäsivu />} />
        <Route path="/Listat" element={<Listat />} />
        <Route path="/Kirjaudu" element={<Kirjaudu />} />
        <Route path="/elokuva/:id" element={<Elokuvasivu />} />
      </Routes>
    </>
  )
}

export default App