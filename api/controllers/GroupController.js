import { createGroup,
   getAllGroups,
    getGroupById,
     getGroupMembers,
    joinGroup,
    leaveGroup } from '../models/Group.js'

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
    const { name, description } = req.body

    // Tarkistetaan, että ryhmällä on nimi
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        error: 'Ryhmän nimi on pakollinen'
      })
    }

    const userId = req.user.id

    const group = await createGroup(name.trim(), description, userId)

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

export { getGroup, getGroups, postGroup, getGroupMembersController, joinGroupController, leaveGroupController }