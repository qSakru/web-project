import { createGroup, getAllGroups } from '../models/Group.js'

const getGroups = async (req, res, next) => {
  try {
    const groups = await getAllGroups()
    res.status(200).json(groups)
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

export { getGroups, postGroup }