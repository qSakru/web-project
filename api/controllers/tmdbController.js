
const options = {
    method: 'get',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_API_RAT}`
    }
}
export const searchMovies = async (req, res, next) => {
const query = req.query.query;
try {
const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`; //välilyönnit toimii haussa

const response = await fetch(url, options)

if (!response.ok) {
    throw new Error("Failed to fetch API data")
}
const data = await response.json()
res.json(data)

} catch(error) {
    next(error);

}
};

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