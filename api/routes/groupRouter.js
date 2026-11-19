import { Router } from 'express'
import { getGroup,
     getGroups,
      postGroup,
       getGroupMembersController,
    joinGroupController,
leaveGroupController } from '../controllers/GroupController.js'
import { authenticate } from '../middleware/auth.js'


const router = Router()

router.get('/', getGroups)
router.get('/:id', getGroup)
router.get('/:id/members', getGroupMembersController)

router.post('/', authenticate, postGroup)
router.post('/:id/join', authenticate, joinGroupController)

router.delete('/:id/leave', authenticate, leaveGroupController)

export default router