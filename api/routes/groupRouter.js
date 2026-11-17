import { Router } from 'express'
import { getGroup, getGroups, postGroup } from '../controllers/GroupController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', getGroups)
router.get('/:id', getGroup)
router.post('/', authenticate, postGroup)

export default router