const options = {
  method: 'get',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_API_RAT}`
  }
}

export const searchMovies = async (req, res, next) => {
  const { query, year, page = 1 } = req.query

  if (!query?.trim()) {
    return res.json({ results: [], page: 1, total_pages: 1 })
  }

  try {
    // Tarkistaa onko pelkkä vuosi (4 numeroa) annettu hakusana
    const isYear = /^\d{4}$/.test(query.trim())
    let results = []
    let totalPages = 1

    if (isYear) {
      // vuosihaku + sivutus
      const url = `https://api.themoviedb.org/3/discover/movie?primary_release_year=${query.trim()}&sort_by=popularity.desc&language=fi-FI&page=${page}`
      const response = await fetch(url, options)
      if (!response.ok) throw new Error("Failed to fetch API data")
      const data = await response.json()
      
      results = data.results || []
      totalPages = data.total_pages || 1

    } else {
      // nimihaku + sivutus
      let url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=fi-FI&page=${page}`
      if (year) {
        url += `&primary_release_year=${year}`
      }

      const response = await fetch(url, options)
      if (!response.ok) throw new Error("Failed to fetch API data")
      const data = await response.json()

      results = data.results || []
      totalPages = data.total_pages || 1

      // henkilötulos = hae filmografia
      const multiUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=fi-FI`
      const multiRes = await fetch(multiUrl, options)
      const multiData = await multiRes.json()
      const person = multiData.results?.find(item => item.media_type === 'person')

      if (person && page == 1) {
        const creditsUrl = `https://api.themoviedb.org/3/person/${person.id}/movie_credits?language=fi-FI`
        const creditsRes = await fetch(creditsUrl, options)
        const creditsData = await creditsRes.json()

        results = (creditsData.cast || [])
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        totalPages = 1
      }
    }

    res.json({ results, page: Number(page), total_pages: totalPages })
  } catch (error) {
    next(error)
  }
}

// Ehdotukset hakukenttään kirjoitettaessa
export const getSuggestions = async (req, res, next) => {
  const { query } = req.query

  if (!query?.trim() || query.trim().length < 2) {
    return res.json({ results: [] })
  }

  try {
    const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=fi-FI`
    const response = await fetch(url, options)
    if (!response.ok) throw new Error("Failed to fetch suggestions")

    const data = await response.json()

    const results = (data.results || [])
      .filter(item => item.media_type === 'movie' || item.media_type === 'person')
      .slice(0, 8)

    res.json({ results })
  } catch (error) {
    next(error)
  }
}
// Hakee yksittäisen elokuvan tiedot
export const getMovieDetails = async (req, res, next) => {
  const { id } = req.params

  try {
    const url = `https://api.themoviedb.org/3/movie/${id}?language=fi-FI&append_to_response=credits`
    const response = await fetch(url, options)
    if (!response.ok) throw new Error("Failed to fetch movie details")

    const data = await response.json()
    res.json(data)
  } catch (error) {
    next(error)
  }
}

const urlPopular = 'https://api.themoviedb.org/3/movie/popular'

const getPopularMovies = async (req, res, next) => {
  try {
    const response = await fetch(urlPopular, options)
    if (!response.ok) throw new Error("Failed to fetch API data")
    const data = await response.json()
    res.json(data)
  } catch (error) {
    next(error)
  }
}

const urlTopRated = "https://api.themoviedb.org/3/movie/top_rated"

export const getTopRatedMovies = async (req, res, next) => {
  try {
    const response = await fetch(urlTopRated, options)
    if (!response.ok) throw new Error("Failed to fetch API data")
    const data = await response.json()
    res.json(data)
  } catch (error) {
    next(error)
  }
}

export default getPopularMovies
