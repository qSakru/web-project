import { Router } from 'express'
import { getGroup,
     getGroups,
      postGroup,
       getGroupMembersController,
    joinGroupController,
leaveGroupController,
transferAdminController,
removeGroupMemberController,
createGroupJoinRequestController,
getGroupJoinRequestController,
getGroupJoinRequestsController,
reviewGroupJoinRequestController, } from '../controllers/GroupController.js'
import { authenticate } from '../middleware/auth.js'
import { getGroupMessagesController, createGroupMessageController } from '../controllers/GroupMessagesController.js'


const router = Router()

router.get('/', getGroups)
router.get('/:id', getGroup)
router.get('/:id/members', getGroupMembersController)

router.get('/:id/messages', authenticate, getGroupMessagesController)
router.post('/:id/messages', authenticate, createGroupMessageController)


router.post('/', authenticate, postGroup)
router.post('/:id/join', authenticate, joinGroupController)
router.post('/:id/join-requests', authenticate, createGroupJoinRequestController)
router.get('/:id/join-request', authenticate, getGroupJoinRequestController)
router.get('/:id/join-requests', authenticate, getGroupJoinRequestsController)
router.put('/:id/join-requests/:userId', authenticate, reviewGroupJoinRequestController)

router.delete('/:id/leave', authenticate, leaveGroupController)
router.delete('/:id/members/:memberId', authenticate, removeGroupMemberController)

router.put('/:id/admin', authenticate, transferAdminController)


export default router