import MovieCard from './MovieCard'

function MovieList({ movies, hasSearched, style="default" }) {
  if (!hasSearched) {
    return null   // ei näytä mitään enne ekaa hakua
  }
  if (!movies || movies.length === 0) {
    return <p className="no-results">Elokuvia ei löytynyt.</p>
  }

  return (
    <div className={`movie-list ${style}`}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default MovieList