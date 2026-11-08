
import { useState, useEffect } from 'react'
import axios from 'axios'

import MovieList from '../components/MovieList'

function Etusivu({ movies }) {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div className="main-content">

     /* <MovieList movies={movies} hasSearched={hasSearched} /> */

      <h1>Docker Sample testi 1234</h1>
      <p>Docker test</p>

      <div className="card">

        {loading && <p>Loading...</p>}

        {!loading && !error && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            background: '#f0f0f0'
          }}>

            <h3>Data from Backend:</h3>

            <ul style={{
              textAlign: 'left',
              margin: '10px 0'
            }}>

              {data.map((item) => (
                <li
                  key={item.id}
                  style={{ marginBottom: '10px' }}
                >
                  {`ID: ${item.id} - ${item.description}`}
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

    </div>
  )
}

export default Etusivu
