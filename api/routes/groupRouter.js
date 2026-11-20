import { Router } from 'express'
import { getGroup,
     getGroups,
      postGroup,
       getGroupMembersController,
    joinGroupController,
leaveGroupController,
transferAdminController,
removeGroupMemberController } from '../controllers/GroupController.js'
import { authenticate } from '../middleware/auth.js'


const router = Router()

router.get('/', getGroups)
router.get('/:id', getGroup)
router.get('/:id/members', getGroupMembersController)


router.post('/', authenticate, postGroup)
router.post('/:id/join', authenticate, joinGroupController)

router.delete('/:id/leave', authenticate, leaveGroupController)
router.delete('/:id/members/:memberId', authenticate, removeGroupMemberController)

router.put('/:id/admin', authenticate, transferAdminController)

export default router