import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function Ryhmäsivu() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [members, setMembers] = useState([])
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [notice, setNotice] = useState(null)

  const fetchGroupData = useCallback(async () => {
    const [groupResponse, membersResponse] = await Promise.all([
      api.get(`/groups/${id}`),
      api.get(`/groups/${id}/members`)
    ])

    return {
      group: groupResponse.data,
      members: membersResponse.data
    }
  }, [id])

  useEffect(() => {
    let active = true

    const loadGroup = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchGroupData()
        if (active) {
          setGroup(data.group)
          setMembers(data.members)
        }
      } catch (err) {
        console.error('Ryhmätietojen haku epäonnistui:', err.response?.data || err.message)
        if (active) {
          setError(
            err.response?.status === 404
              ? 'Ryhmää ei löytynyt.'
              : 'Ryhmätietojen hakeminen epäonnistui.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadGroup()
    return () => {
      active = false
    }
  }, [fetchGroupData])

  useEffect(() => {
    let active = true

    const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      if (active) {
        setUser(response.data.user)
        setAuthError(null)
      }
    } catch (err) {
      if (active && err.response?.status === 401) {
        setUser(null)
        setAuthError(null)
      } else if (active) {
        console.error('Kirjautumistilan haku epäonnistui:', err.response?.data || err.message)
        setAuthError('Kirjautumistilan tarkistaminen epäonnistui.')
      }
    } finally {
      if (active) {
        setAuthLoading(false)
      }
    }
    }

    fetchUser()
    return () => {
    active = false
    }
  }, [])

  const handleMembershipAction = async (action) => {
    setActionLoading(true)
    setActionError(null)
    setNotice(null)

    let response
    try {
    response = action === 'join'
      ? await api.post(`/groups/${id}/join`)
      : await api.delete(`/groups/${id}/leave`)
    } catch (err) {
    console.error('Ryhmän jäsenyyden muuttaminen epäonnistui:', err.response?.data || err.message)
    setActionError(err.response?.data?.error || 'Ryhmän jäsenyyden muuttaminen epäonnistui.')
    setActionLoading(false)
    return
    }

    if (response.data.status === 'group_deleted') {
    navigate('/Ryhmät', { replace: true })
    return
    }

    setNotice(response.data.message)

    try {
    const data = await fetchGroupData()
    setGroup(data.group)
    setMembers(data.members)
    } catch (err) {
    console.error('Ryhmätietojen päivitys epäonnistui:', err.response?.data || err.message)
    setActionError('Toiminto onnistui, mutta ryhmätietojen päivittäminen epäonnistui. Päivitä sivu.')
    } finally {
    setActionLoading(false)
    }
  }

  const currentMembership = user
    ? members.find((member) => String(member.id) === String(user.id))
    : null

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
      {authLoading && <p>Tarkistetaan kirjautumistilaa...</p>}
      {authError && <p role="alert">{authError}</p>}
      {!authLoading && !authError && !user && (
        <p>
          <Link to="/Kirjaudu">Kirjaudu sisään liittyäksesi ryhmään.</Link>
        </p>
      )}
      {!authLoading && !authError && user && !currentMembership && (
        <button
          type="button"
          onClick={() => handleMembershipAction('join')}
          disabled={actionLoading || loading || Boolean(error)}
        >
          {actionLoading ? 'Liitytään...' : 'Liity ryhmään'}
        </button>
      )}
      {!authLoading && !authError && user && currentMembership?.role === 'member' && (
        <button
          type="button"
          onClick={() => handleMembershipAction('leave')}
          disabled={actionLoading || loading || Boolean(error)}
        >
          {actionLoading ? 'Poistutaan...' : 'Poistu ryhmästä'}
        </button>
      )}
      {!authLoading && !authError && user && currentMembership?.role === 'admin' && members.length > 1 && (
        <p>Ylläpitäjä ei voi poistua, kun ryhmässä on muita jäseniä.</p>
      )}
      {!authLoading && !authError && user && currentMembership?.role === 'admin' && members.length === 1 && (
        <button
          type="button"
          onClick={() => handleMembershipAction('leave')}
          disabled={actionLoading || loading || Boolean(error)}
        >
          {actionLoading ? 'Poistetaan ryhmää...' : 'Poistu ja poista ryhmä'}
        </button>
      )}
      {actionError && <p role="alert">{actionError}</p>}
      {notice && <p role="status">{notice}</p>}
      {members.length > 0 && !loading && !error && (
        <div>
          <h3>Jäsenet</h3>
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                {member.username} ({member.role})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
