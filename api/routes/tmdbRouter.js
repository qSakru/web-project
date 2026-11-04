import {Router} from "express"
import getMovies from "../controllers/tmdbController.js"
import { searchMovies } from "../controllers/tmdbController.js"

const router = Router()

router.get('/search', searchMovies);
router.get('/movies', getMovies)


export default router