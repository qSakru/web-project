import { Router } from "express"
import getPopularMovies, { searchMovies, getTopRatedMovies, getSuggestions } from "../controllers/tmdbController.js"

const router = Router()

router.get('/search', searchMovies)
router.get('/popular', getPopularMovies)
router.get('/suggestions', getSuggestions)
router.get('/top_rated', getTopRatedMovies)

export default router