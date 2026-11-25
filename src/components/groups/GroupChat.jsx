import { useEffect, useState } from 'react'
import api from '../../services/api'
import './GroupChat.css'

export default function GroupChat({ groupId, currentUserId }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  // Haetaan viestit ja päivitetään keskustelua automaattisesti.
  useEffect(() => {
    let active = true

    const fetchMessages = async () => {
      try {
        const response = await api.get(
          `/groups/${groupId}/messages`
        )

        if (active) {
          setMessages(response.data)
          setError(null)
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.error ||
            'Viestien hakeminen epäonnistui.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchMessages()

    // Haetaan uudet viestit kolmen sekunnin välein.
    const interval = setInterval(fetchMessages, 3000)

    // Siivotaan ajastin, kun komponentti poistuu sivulta.
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [groupId])

  // Lähetetään uusi viesti.
  const handleSendMessage = async (event) => {
    event.preventDefault()

    const message = newMessage.trim()

    if (!message || sending) return

    setSending(true)
    setError(null)

    try {
      const response = await api.post(
        `/groups/${groupId}/messages`,
        { message }
      )

      // Lisätään juuri tallennettu viesti keskusteluun.
      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (item) => item.id === response.data.id
        )

        if (alreadyExists) return currentMessages

        return [...currentMessages, response.data]
      })

      setNewMessage('')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Viestin lähettäminen epäonnistui.'
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="group-chat">
      <h2>Ryhmächat</h2>

      <div className="group-chat__messages">
        {loading ? (
          <p>Ladataan viestejä...</p>
        ) : messages.length === 0 ? (
          <p>Ei vielä viestejä. Aloita keskustelu!</p>
        ) : (
          messages.map((message) => {
            const isOwnMessage =
              String(message.user_id) === String(currentUserId)

            return (
              <div
                key={message.id}
                className={`group-chat__message ${
                  isOwnMessage ? 'group-chat__message--own' : ''
                }`}
              >
                <div className="group-chat__message-header">
                  <strong>{message.username}</strong>

                  <small>
                    {new Date(message.created_at).toLocaleString('fi-FI')}
                  </small>
                </div>

                <p>{message.message}</p>
              </div>
            )
          })
        )}
      </div>

      {error && (
        <p className="group-chat__error" role="alert">
          {error}
        </p>
      )}

      <form
        className="group-chat__form"
        onSubmit={handleSendMessage}
      >
        <textarea
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="Kirjoita viesti..."
          maxLength={2000}
          rows={2}
          disabled={sending}
        />

        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
        >
          {sending ? 'Lähetetään...' : 'Lähetä'}
        </button>
      </form>
    </div>
  )
}