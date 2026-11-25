import {
  getGroupMessages,
  createGroupMessage
} from '../models/GroupMessage.js'

// Hakee ryhmän viestit
const getGroupMessagesController = async (req, res, next) => {
  const groupId = Number(req.params.id)

  
  if (!Number.isInteger(groupId) || groupId < 1) {
    return res.status(400).json({
      error: 'Virheellinen ryhmän ID'
    })
  }

  try {
   
    const result = await getGroupMessages(
      groupId,
      req.user.id
    )

    
    if (result.status === 'not_member') {
      return res.status(403).json({
        error: 'Vain ryhmän jäsenet voivat lukea viestejä'
      })
    }

    
    res.status(200).json(result.messages)

  } catch (error) {
    next(error)
  }
}


// Lähettää uuden viestin ryhmään
const createGroupMessageController = async (req, res, next) => {
  const groupId = Number(req.params.id)
  const message = req.body?.message

 
  if (!Number.isInteger(groupId) || groupId < 1) {
    return res.status(400).json({
      error: 'Virheellinen ryhmän ID'
    })
  }

  
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      error: 'Viesti ei voi olla tyhjä'
    })
  }

  const cleanMessage = message.trim()

  if (cleanMessage.length > 2000) {
    return res.status(400).json({
      error: 'Viesti saa sisältää enintään 2000 merkkiä'
    })
  }

  try {
    // Tallennetaan viesti modelin avulla
    const result = await createGroupMessage(
      groupId,
      req.user.id,
      cleanMessage
    )

    if (result.status === 'not_found') {
      return res.status(404).json({
        error: 'Ryhmää ei löytynyt'
      })
    }

    if (result.status === 'not_member') {
      return res.status(403).json({
        error: 'Vain ryhmän jäsenet voivat lähettää viestejä'
      })
    }

    
    res.status(201).json(result.message)

  } catch (error) {
    next(error)
  }
}


export {
  getGroupMessagesController,
  createGroupMessageController
}