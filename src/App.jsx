import { useState, useEffect } from 'react'
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

  const [notification, setNotification] = useState("")
  const [list, setList] = useState(()=> {
    const savedLists = localStorage.getItem("lists")

    if (savedLists) {
      return JSON.parse(savedLists)
    } else {
      return []
    }
  })
    
  /*
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
  */

 
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

  function addMovie(movie){
    const checkList = list.some(
      item => item.id === movie.id
    )

    if (checkList){
      setNotification("ELokuva on jo listalla")
      return
    }

    setList([...list, movie])
    setNotification("Elokuva lisätty")
  }

  function removeMovie(id){
    setList(list.filter(movie => movie.id !== id))
    setNotification("Elokuva poistettu listalta")
  }


  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(list));
}, [list]);

  useEffect(() => {
    if (!notification) return

    const timer = setTimeout(()=>{
      setNotification("")
    }, 2000)

      return () => clearTimeout(timer)
  }, [notification])


  return (
    <>

      {notification && (
          <div className="notification">
            {notification}
          </div>
        )}
      

      {/* KONTENTTI */}
      {/*
        <div className="main-content">
         <MovieList movies={movies} hasSearched={hasSearched} />

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
    */}
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
              addMovie={addMovie}
            />
          } 
        />
        <Route path="/Ryhmät" element={<Ryhmät />} />
        <Route path="/Ryhmät/:id" element={<Ryhmäsivu />} />
        <Route path="/Listat" element={<Listat list={list} removeMovie={removeMovie}/>} />
        <Route path="/Kirjaudu" element={<Kirjaudu />} />
        <Route path="/elokuva/:id" element={<Elokuvasivu />} />
      </Routes>
    </>
  )
}

export default App
