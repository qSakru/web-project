import axios from 'axios';

 const searchMovies = async (query) => {
    const response = await axios.get(
        `/api/tmdb/search?query=${encodeURIComponent(query)}`
    );

    return response.data.results;
};

export default searchMovies;