import axios from 'axios';

 const searchMovies = async (query) => {
    const response = await axios.get(
        `/api/search?query=${encodeURIComponent(query)}`
    );

    return response.data.results;
};

export default searchMovies;