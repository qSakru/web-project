import { Router } from "express"
import getPopularMovies, { searchMovies, getTopRatedMovies, getSuggestions, getMovieDetails } from "../controllers/tmdbController.js"

const router = Router()

router.get('/search', searchMovies)
router.get('/popular', getPopularMovies)
router.get('/suggestions', getSuggestions)
router.get('/top_rated', getTopRatedMovies)
router.get('/movie/:id', getMovieDetails)

export default router