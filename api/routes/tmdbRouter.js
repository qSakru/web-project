import {Router} from "express"
import getMovies from "../controllers/tmdbController.js"

const router = Router()


router.get('/movies', getMovies)


export default router