import {Router} from "express"
import getPopularMovies from "../controllers/tmdbController.js"
import { searchMovies } from "../controllers/tmdbController.js"
import { getTopRatedMovies } from "../controllers/tmdbController.js"

const router = Router()

router.get('/search', searchMovies);
router.get('/popular', getPopularMovies)
router.get('/top_rated', getTopRatedMovies)


export default router