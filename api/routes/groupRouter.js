import { Router } from 'express'
import { getGroups, postGroup } from '../controllers/GroupController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', getGroups)
router.post('/', authenticate, postGroup)

export default router