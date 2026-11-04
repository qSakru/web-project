

const url = `https://api.themoviedb.org/3/movie/popular`
const options = {
    method: 'get',
    headers: {
        accept: 'applications/json',
        Authorization: `Bearer ${process.env.TMDB_API_RAT}`
    }
}

const getMovies = async (req, res, next) => {
        /*
        res.json({
            message: "TMDB Route Works"
        })
        */

    try {
        const response = await fetch(url, options)

        if (!response.ok) {
            throw new Error("Failed to fetch API data")
        }

        const data = await response.json()
        res.json(data)

    } catch (error){
        next(error)
    }
}

export default getMovies