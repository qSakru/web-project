function MovieCard({ movie }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/300x450/142030/8097b2?text=Ei+kuvaa+saatavilla'

  const year = movie.release_date ? movie.release_date.slice(0, 4) : ''

  return (
    <div className="movie-card">
      <div className="poster-wrapper">
        <img
          src={posterUrl}
          alt={movie.title}
          className="movie-poster"
        />
        <div className="movie-overlay">
          <span className="movie-title">{movie.title}</span>
          {year && <span className="movie-year">{year}</span>}
        </div>
      </div>
    </div>
  )
}

export default MovieCard