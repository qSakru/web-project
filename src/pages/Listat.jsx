
import MovieCard from "../components/MovieCard"
import "../App.css"

function Listat({ wishlist = [], removeMovie }) {

    return (
        <>
            <h1>Toivelista</h1>

            <div className="wishlist">
                {wishlist.length === 0 ? (
                    <p>Toivelistasi on tyhjä.</p>
                ) : (
                    wishlist.map(movie => (
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
