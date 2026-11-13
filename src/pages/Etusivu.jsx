
import { useState, useEffect } from 'react'
import axios from 'axios'
import "../App.css"

import MovieList from '../components/MovieList'

function Etusivu({ movies, hasSearched}) {

  const [dataPopular, setDataPopular] = useState([])
  const [dataTopRated, setDataTopRated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const popular = await axios.get('/api/popular')
      setDataPopular(popular.data.results || [])

      const topRated = await axios.get('/api/top_rated')
      setDataTopRated(topRated.data.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="main-content">
        <p className="loading-text">Ladataan elokuvia...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="main-content">
        <p className="error-text">Virhe: {error}</p>
      </div>
    )
  }

return (
    <div className="main-content">
      {hasSearched ? (
        <div className="search-results">
          <h1>Hakutulokset</h1>
          <MovieList 
            movies={movies} 
            hasSearched={hasSearched}
            style="default"
          />
        </div>
      ) : (
        <>
          <section className="movie-section">
            <h2>Suosituimmat tänään</h2>
            <MovieList
              movies={dataPopular}
              hasSearched={true}
              style="side-scroll"
            />
          </section>

          <section className="movie-section">
            <h2>Kriitikkojen suosimat</h2>
            <MovieList
              movies={dataTopRated}
              hasSearched={true}
              style="side-scroll"
            />
          </section>
        </>
      )}

      {/*
      <div className="card">

        {loading && <p>Loading...</p>}

        {!loading && !error && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            background: '#f0f0f0'
          }}>

            
            <ul style={{
              textAlign: 'left',
              margin: '10px 0'
            }}>

              {data.map((movie) => (
                <li
                  key={movie.id}
                  style={{ marginBottom: '10px' }}
                >
                  {`${movie.title} ${movie.poster_path}`}
                </li>
              ))}
        
            </ul>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '60px',
            padding: '10px',
            background: '#ffebee',
            color: 'red'
          }}>

            <h3>Error:</h3>
            <p>{error}</p>

          </div>
        )}

      </div>
      */}

    </div>
  )
}

export default Etusivu
