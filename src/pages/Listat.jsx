
import MovieCard from "../components/MovieCard"
import "../App.css"

function Listat({ list = [], removeMovie }) {

    return (
        <>
            <h1>Toivelista</h1>

            <div className="wishlist">
                {list.length === 0 ? (
                    <p>Toivelistasi on tyhjä.</p>
                ) : (
                    list.map(movie => (
                        <MovieCard 
                            key={movie.id}
                            movie={movie}
                            removeMovie={removeMovie}
                        />
                    ))
                )}
            </div>
        </>
    )
}

export default Listat
