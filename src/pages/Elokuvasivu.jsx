import { useState, useEffect } from 'react'
import { useParams, useNavigate} from 'react-router-dom'
import axios from 'axios'
import ReviewSection from '../components/ReviewSection'

function Elokuvasivu() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`/api/movie/${id}`)
        setMovie(res.data)
      } catch (err) {
        setError('Elokuvaa ei löytynyt')
      } finally {
        setLoading(false)
      }
    }
    fetchMovie()
  }, [id])

  if (loading) return <div className="main-content"><p>Ladataan...</p></div>
  if (error) return <div className="main-content"><p>{error}</p></div>
  if (!movie) return null

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null

  const director = movie.credits?.crew?.find(p => p.job === 'Director')
  const cast = movie.credits?.cast?.slice(0, 8) || []

  return (
    <div className="main-content">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Takaisin
      </button>
      <div className="movie-detail">
        {posterUrl && (
          <img src={posterUrl} alt={movie.title} className="movie-detail-poster" />
        )}

        <div className="movie-detail-info">
          <h1>{movie.title}</h1>
          
          <div className="movie-meta">
            {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
            {movie.runtime > 0 && <span>{movie.runtime} min</span>}
            {movie.vote_average > 0 && (
              <span className="rating">★ {movie.vote_average.toFixed(1)}</span>
            )}
          </div>

          {movie.genres?.length > 0 && (
            <p className="genres">{movie.genres.map(g => g.name).join(' • ')}</p>
          )}

          {director && (
            <p><strong>Ohjaaja:</strong> {director.name}</p>
          )}

          <p className="overview">
            {movie.overview || 'Ei kuvausta saatavilla.'}
          </p>

          {cast.length > 0 && (
            <div className="cast">
              <h3>Näyttelijät</h3>
              <div className="cast-list">
                {cast.map(actor => (
                  <div key={actor.id} className="cast-member">
                    {actor.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                        alt={actor.name}
                      />
                    ) : (
                      <div className="no-photo">{actor.name.charAt(0)}</div>
                    )}
                    <span>{actor.name}</span>
                    <small>{actor.character}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ReviewSection movieId={movie.id} />
    </div>
  )
}
export default Elokuvasivu