import { useRef, useEffect } from 'react'
import MovieCard from './MovieCard'

function MovieList({ movies, hasSearched, style = "default" }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || style !== "side-scroll") return

    const handleWheel = (e) => {
      if (e.deltaY === 0) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [style])

  if (!hasSearched) {
    return null   // ei näytä mitään ennen ekaa hakua
  }

  if (!movies || movies.length === 0) {
    return <p className="no-results">Elokuvia ei löytynyt.</p>
  }

  return (
    <div 
      ref={scrollRef}
      className={`movie-list ${style}`}
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default MovieList