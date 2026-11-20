
import { useState, useEffect } from 'react'
import axios from 'axios'
import MovieList from '../components/MovieList'

function Etusivu({ movies, hasSearched, currentPage, totalPages, onPageChange, addMovie, removeMovie }) {
  const [dataPopular, setDataPopular] = useState([])
  const [dataTopRated, setDataTopRated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const popular = await axios.get('/api/popular')
        setDataPopular(popular.data.results || [])

        const topRated = await axios.get('/api/top_rated')
        setDataTopRated(topRated.data.results || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading && !hasSearched) {
    return <div className="main-content"><p>Ladataan...</p></div>
  }

  return (
    <div className="main-content">
      {hasSearched ? (
        <>
          <h2 style={{ textAlign: 'left', marginBottom: '1rem' }}>Hakutulokset</h2>
          <MovieList movies={movies} hasSearched={true} style="default" addMovie={addMovie} removeMovie={removeMovie} />

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                ← Edellinen
              </button>
              <span>Sivu {currentPage} / {Math.min(totalPages, 500)}</span>
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Seuraava →
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <section className="movie-section">
            <h2>Suosituimmat tänään</h2>
            <MovieList movies={dataPopular} hasSearched={true} style="side-scroll" addMovie={addMovie} removeMovie={removeMovie} />
          </section>

          <section className="movie-section">
            <h2>Kriitikkojen suosimat</h2>
            <MovieList movies={dataTopRated} hasSearched={true} style="side-scroll"  addMovie={addMovie} removeMovie={removeMovie} />
          </section>
        </>
      )}
    </div>
  )
}

export default Etusivu