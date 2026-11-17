import { createGroup, getAllGroups, getGroupById } from '../models/Group.js'

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

export { getGroup, getGroups, postGroup }