import { useNavigate } from 'react-router-dom'

function MovieCard({ movie, addMovie, removeMovie }) {
  //console.log("Movie recieved", movie)
  const navigate = useNavigate()
  
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/300x450/142030/8097b2?text=Ei+kuvaa+saatavilla'

  const year = movie.release_date ? movie.release_date.slice(0, 4) : ''

  return (
    <>
    <div className="movie-card" onClick={() => navigate(`/elokuva/${movie.id}`)}>
      <div className="poster-wrapper">
        <img
          src={posterUrl}
          alt={movie.title}
          className="movie-poster"
        />
        <div className="movie-overlay">
          <div className="list-buttons">
          {addMovie && (
            <button onClick={(e) => {
              e.stopPropagation()
              addMovie(movie)}}>
              Lisää
            </button>
            )}
            
            {removeMovie && (
              <button onClick={(e) => {
                e.stopPropagation()
                removeMovie(movie.id)
              }}>
                Poista
              </button>
              )}
            </div>
            

          <span className="movie-title">{movie.title}</span>
          {year && <span className="movie-year">{year}</span>}
        </div>
      </div>
    </div>
    </>
  )
}

export default MovieCard