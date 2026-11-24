import { createGroup,
   getAllGroups,
    getGroupById,
     getGroupMembers,
    joinGroup,
    leaveGroup,
     promoteMemberToAdmin,
     removeGroupMember,
     createGroupJoinRequest,
     getGroupJoinRequest,
     getGroupJoinRequests,
     reviewGroupJoinRequest } from '../models/Group.js'

const getGroups = async (req, res, next) => {
  try {
    const groups = await getAllGroups()
    res.status(200).json(groups)
  } catch (error) {
    next(error)
  }
}

const getGroup = async (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Virheellinen ryhmän ID' })
  }

  try {
    const group = await getGroupById(id)
    if (!group) {
      return res.status(404).json({ error: 'Ryhmää ei löytynyt' })
    }

    res.status(200).json(group)
  } catch (error) {
    next(error)
  }
}

const postGroup = async (req, res, next) => {
  try {
    const { name, description, isPrivate = false } = req.body

    // Tarkistetaan, että ryhmällä on nimi
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        error: 'Ryhmän nimi on pakollinen'
      })
    }
    if (typeof isPrivate !== 'boolean') {
      return res.status(400).json({ error: 'Ryhmän yksityisyysvalinta on virheellinen' })
    }

    const userId = req.user.id

    const group = await createGroup(name.trim(), description, isPrivate, userId)

    res.status(201).json(group)
  } catch (error) {
    next(error)
  }
}
const getGroupMembersController = async (req, res, next) => {
  const id = Number(req.params.id)

  // Tarkistetaan ryhmän ID
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Virheellinen ryhmän ID' })
  }

  try {
    // Tarkistetaan, että ryhmä on olemassa
    const group = await getGroupById(id)

    if (!group) {
      return res.status(404).json({ error: 'Ryhmää ei löytynyt' })
    }

    // Haetaan ryhmän jäsenet
    const members = await getGroupMembers(id)

    res.status(200).json(members)

  } catch (error) {
    next(error)
  }
}
const joinGroupController = async (req, res, next) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Virheellinen ryhmän ID' })
  }

  try {
    const result = await joinGroup(id, req.user.id)

    if (result.status === 'not_found') {
      return res.status(404).json({ error: 'Ryhmää ei löytynyt' })
    }

    if (result.status === 'already_member') {
      return res.status(409).json({ error: 'Olet jo ryhmän jäsen' })
    }

    if (result.status === 'private_group') {
      return res.status(409).json({ error: 'Yksityiseen ryhmään liittyminen vaatii ylläpitäjän hyväksynnän' })
    }

    if (result.status === 'joined') {
      return res.status(201).json({
        status: 'joined',
        message: 'Liityit ryhmään onnistuneesti'
      })
    }

    throw new Error(`Unexpected join-group result: ${result.status}`)
  } catch (error) {
    next(error)
  }
}

const createGroupJoinRequestController = async (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Virheellinen ryhmän ID' })
  }

  try {
    const result = await createGroupJoinRequest(id, req.user.id)
    if (result.status === 'not_found') {
      return res.status(404).json({ error: 'Ryhmää ei löytynyt' })
    }
    if (result.status === 'public_group') {
      return res.status(409).json({ error: 'Julkiseen ryhmään voi liittyä suoraan' })
    }
    if (result.status === 'already_member') {
      return res.status(409).json({ error: 'Olet jo ryhmän jäsen' })
    }
    if (result.status === 'already_pending') {
      return res.status(409).json({ error: 'Liittymispyyntösi odottaa jo käsittelyä' })
    }
    if (result.status === 'requested') {
      return res.status(201).json({
        status: 'pending',
        message: 'Liittymispyyntö lähetettiin ylläpitäjälle'
      })
    }
    throw new Error(`Unexpected create-join-request result: ${result.status}`)
  } catch (error) {
    next(error)
  }
}

const getGroupJoinRequestController = async (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Virheellinen ryhmän ID' })
  }

  try {
    const group = await getGroupById(id)
    if (!group) {
      return res.status(404).json({ error: 'Ryhmää ei löytynyt' })
    }
    const request = await getGroupJoinRequest(id, req.user.id)
    res.status(200).json({ status: request?.status || null })
  } catch (error) {
    next(error)
  }
}

const getGroupJoinRequestsController = async (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Virheellinen ryhmän ID' })
  }

  try {
    const group = await getGroupById(id)
    if (!group) {
      return res.status(404).json({ error: 'Ryhmää ei löytynyt' })
    }
    const membership = await getGroupMembers(id)
    if (!membership.some((member) =>
      String(member.id) === String(req.user.id) && member.role === 'admin'
    )) {
      return res.status(403).json({ error: 'Vain ryhmän ylläpitäjä voi nähdä liittymispyynnöt' })
    }
    const requests = await getGroupJoinRequests(id, req.user.id)
    res.status(200).json(requests)
  } catch (error) {
    next(error)
  }
}

const reviewGroupJoinRequestController = async (req, res, next) => {
  const id = Number(req.params.id)
  const requesterId = Number(req.params.userId)
  const decision = req.body?.decision

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Virheellinen ryhmän ID' })
  }
  if (!Number.isInteger(requesterId) || requesterId < 1) {
    return res.status(400).json({ error: 'Virheellinen käyttäjän ID' })
  }
  if (decision !== 'approve' && decision !== 'reject') {
    return res.status(400).json({ error: 'Virheellinen liittymispyynnön päätös' })
  }

  try {
    const result = await reviewGroupJoinRequest(id, req.user.id, requesterId, decision)
    if (result.status === 'not_found') {
      return res.status(404).json({ error: 'Ryhmää ei löytynyt' })
    }
    if (result.status === 'not_admin') {
      return res.status(403).json({ error: 'Vain ryhmän ylläpitäjä voi käsitellä liittymispyyntöjä' })
    }
    if (result.status === 'request_not_found') {
      return res.status(404).json({ error: 'Liittymispyyntöä ei löytynyt' })
    }
    if (result.status === 'request_already_reviewed') {
      return res.status(409).json({ error: 'Liittymispyyntö on jo käsitelty' })
    }
    res.status(200).json({
      status: result.status,
      message: decision === 'approve'
        ? 'Liittymispyyntö hyväksyttiin'
        : 'Liittymispyyntö hylättiin'
    })
  } catch (error) {
    next(error)
  }
}
const leaveGroupController = async (req, res, next) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Virheellinen ryhmän ID' })
  }

  try {
    const result = await leaveGroup(id, req.user.id)

    if (result.status === 'not_found') {
      return res.status(404).json({ error: 'Ryhmää ei löytynyt' })
    }

    if (result.status === 'not_member') {
      return res.status(409).json({ error: 'Et ole ryhmän jäsen' })
    }
    if (result.status === 'admin_must_transfer') {
      return res.status(409).json({ error: 'Et voi poistua ryhmästä, koska olet ainoa ylläpitäjä. Siirrä ylläpitäjän oikeudet toiselle jäsenelle ennen poistumista.' })
    }
    if (result.status === 'group_deleted') {
      return res.status(200).json({
        status: 'group_deleted',
        message: 'Poistuit ryhmästä ja ryhmä poistettiin, koska olit ainoa jäsen.'
      })
    }

    if (result.status === 'left') {
      return res.status(200).json({
        status: 'left',
        message: 'Poistuit ryhmästä onnistuneesti'
      })
    }

    throw new Error(`Unexpected leave-group result: ${result.status}`)
  } catch (error) {
    next(error)
  }
}

const transferAdminController = async (req, res, next) => {
  const id = Number(req.params.id)
  const newAdminId = Number(req.body.newAdminId)

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      error: 'Virheellinen ryhmän ID'
    })
  }

  if (!Number.isInteger(newAdminId) || newAdminId < 1) {
    return res.status(400).json({
      error: 'Virheellinen uuden ylläpitäjän ID'
    })
  }

  try {
    const result = await promoteMemberToAdmin(id, req.user.id, newAdminId)

    if (result.status === 'not_found') {
      return res.status(404).json({
        error: 'Ryhmää ei löytynyt'
      })
    }

    if (result.status === 'not_admin') {
      return res.status(403).json({
        error: 'Vain ryhmän ylläpitäjä voi siirtää ylläpitäjän oikeudet'
      })
    }

    if (result.status === 'same_user') {
      return res.status(400).json({
        error: 'Et voi siirtää ylläpitäjän oikeuksia itsellesi'
      })
    }

    if (result.status === 'target_not_member') {
      return res.status(404).json({
        error: 'Valittu käyttäjä ei ole ryhmän jäsen'
      })
    }

    if (result.status === 'already_admin') {
      return res.status(409).json({
        error: 'Valittu käyttäjä on jo ylläpitäjä'
      })
    }

    if (result.status === 'promoted') {
      return res.status(200).json({
        status: 'promoted',
        message: 'Jäsenelle annettiin ylläpitäjän oikeudet'
      })
    }

    throw new Error(`Unexpected promote-admin result: ${result.status}`)
  } catch (error) {
    next(error)
  }
}

const removeGroupMemberController = async (req, res, next) => {
  const id = Number(req.params.id)
  const memberId = Number(req.params.memberId)

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Virheellinen ryhmän ID' })
  }

  if (!Number.isInteger(memberId) || memberId < 1) {
    return res.status(400).json({ error: 'Virheellinen jäsenen ID' })
  }

  try {
    const result = await removeGroupMember(id, req.user.id, memberId)

    if (result.status === 'not_found') {
      return res.status(404).json({ error: 'Ryhmää ei löytynyt' })
    }

    if (result.status === 'not_admin') {
      return res.status(403).json({ error: 'Vain ylläpitäjä voi poistaa jäseniä' })
    }

    if (result.status === 'target_not_member') {
      return res.status(404).json({ error: 'Käyttäjä ei ole ryhmän jäsen' })
    }

    if (result.status === 'target_not_regular_member') {
      return res.status(409).json({ error: 'Ylläpitäjää ei voi poistaa tällä toiminnolla' })
    }

    if (result.status === 'removed') {
      return res.status(200).json({
        status: 'removed',
        message: 'Jäsen poistettiin ryhmästä'
      })
    }

    throw new Error(`Unexpected remove-member result: ${result.status}`)
  } catch (error) {
    next(error)
  }
}

export { getGroup,
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
          reviewGroupJoinRequestController }