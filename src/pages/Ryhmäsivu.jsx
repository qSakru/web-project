import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function Ryhmäsivu() {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    const fetchGroup = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get(`/groups/${id}`)
        if (active) {
          setGroup(response.data)
        }
      } catch (err) {
        console.error('Ryhmän haku epäonnistui:', err.response?.data || err.message)
        if (active) {
          setError(
            err.response?.status === 404
              ? 'Ryhmää ei löytynyt.'
              : 'Ryhmän hakeminen epäonnistui.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchGroup()
    return () => {
      active = false
    }
  }, [id])

  return (
    <div className="page">
      <h1>Ryhmäsivu</h1>
      <p>ID: {id}</p>
      {loading && <p>Ladataan ryhmää...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && group && (
        <>
          <h2>{group.name}</h2>
          <p>{group.description || 'Ei kuvausta.'}</p>
        </>
      )}
    </div>
  )
}
