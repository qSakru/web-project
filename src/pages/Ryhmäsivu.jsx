import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import GroupMembers from '../components/groups/GroupMembers'
import GroupMembershipActions from '../components/groups/GroupMembershipActions'
import './Ryhmäsivu.css'
import GroupChat from '../components/groups/GroupChat'

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
  const [joinRequestStatus, setJoinRequestStatus] = useState(null)
  const [joinRequests, setJoinRequests] = useState([])
  const [joinRequestError, setJoinRequestError] = useState(null)

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

  const handlePromoteMember = async (newAdminId) => {
    setActionLoading(true)
    setActionError(null)
    setNotice(null)

    let response
    try {
      response = await api.put(`/groups/${id}/admin`, { newAdminId })
    } catch (err) {
      console.error('Ylläpitäjän oikeuksien antaminen epäonnistui:', err.response?.data || err.message)
      const error = err.response?.data?.error
      setActionError(
        (typeof error === 'string' ? error : error?.message) ||
        'Ylläpitäjän oikeuksien antaminen epäonnistui.'
      )
      setActionLoading(false)
      return false
    }

    setNotice(response.data.message)

    try {
      const data = await fetchGroupData()
      setGroup(data.group)
      setMembers(data.members)
    } catch (err) {
      console.error('Ryhmätietojen päivitys siirron jälkeen epäonnistui:', err.response?.data || err.message)
      setActionError('Ylläpitäjän siirto onnistui, mutta tietojen päivitys epäonnistui. Päivitä sivu.')
    } finally {
      setActionLoading(false)
    }

    return true
  }

  const handleRemoveMember = async (memberId) => {
    setActionLoading(true)
    setActionError(null)
    setNotice(null)

    let response
    try {
      response = await api.delete(`/groups/${id}/members/${memberId}`)
    } catch (err) {
      console.error('Jäsenen poistaminen epäonnistui:', err.response?.data || err.message)
      const error = err.response?.data?.error
      setActionError(
        (typeof error === 'string' ? error : error?.message) ||
        'Jäsenen poistaminen ryhmästä epäonnistui.'
      )
      setActionLoading(false)
      return false
    }

    setNotice(response.data.message)

    try {
      const data = await fetchGroupData()
      setGroup(data.group)
      setMembers(data.members)
    } catch (err) {
      console.error('Ryhmätietojen päivitys jäsenen poiston jälkeen epäonnistui:', err.response?.data || err.message)
      setActionError('Jäsen poistettiin, mutta ryhmätietojen päivitys epäonnistui. Päivitä sivu.')
    } finally {
      setActionLoading(false)
    }

    return true
  }

  const currentMembership = user
    ? members.find((member) => String(member.id) === String(user.id))
    : null

  useEffect(() => {
    let active = true

    if (!user || loading || error) {
      setJoinRequestStatus(null)
      setJoinRequests([])
      setJoinRequestError(null)
      return () => {
        active = false
      }
    }

    const fetchJoinRequestData = async () => {
      try {
        const statusResponse = await api.get(`/groups/${id}/join-request`)
        if (active) {
          setJoinRequestStatus(statusResponse.data.status)
          setJoinRequestError(null)
        }

        if (currentMembership?.role === 'admin') {
          const requestsResponse = await api.get(`/groups/${id}/join-requests`)
          if (active) {
            setJoinRequests(requestsResponse.data)
          }
        } else if (active) {
          setJoinRequests([])
        }
      } catch (err) {
        console.error('Liittymispyyntöjen haku epäonnistui:', err.response?.data || err.message)
        if (active) {
          setJoinRequestError('Liittymispyyntötietojen hakeminen epäonnistui.')
        }
      }
    }

    fetchJoinRequestData()
    return () => {
      active = false
    }
  }, [id, user, currentMembership?.role, members, loading, error])

  const handleRequestJoin = async () => {
    setActionLoading(true)
    setActionError(null)
    setNotice(null)

    try {
      const response = await api.post(`/groups/${id}/join-requests`)
      setJoinRequestStatus(response.data.status)
      setNotice(response.data.message)
    } catch (err) {
      console.error('Liittymispyynnön lähettäminen epäonnistui:', err.response?.data || err.message)
      setActionError(err.response?.data?.error || 'Liittymispyynnön lähettäminen epäonnistui.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReviewJoinRequest = async (requesterId, decision) => {
    setActionLoading(true)
    setActionError(null)
    setNotice(null)

    let response
    try {
      response = await api.put(
        `/groups/${id}/join-requests/${requesterId}`,
        { decision }
      )
    } catch (err) {
      console.error('Liittymispyynnön käsittely epäonnistui:', err.response?.data || err.message)
      setActionError(err.response?.data?.error || 'Liittymispyynnön käsittely epäonnistui.')
      setActionLoading(false)
      return
    }

    setNotice(response.data.message)
    try {
      const [groupData, requestsResponse] = await Promise.all([
        fetchGroupData(),
        api.get(`/groups/${id}/join-requests`)
      ])
      setGroup(groupData.group)
      setMembers(groupData.members)
      setJoinRequests(requestsResponse.data)
    } catch (err) {
      console.error('Tiedot eivät päivittyneet liittymispyynnön käsittelyn jälkeen:', err.response?.data || err.message)
      setActionError('Pyyntö käsiteltiin, mutta ryhmätietojen päivitys epäonnistui. Päivitä sivu.')
    } finally {
      setActionLoading(false)
    }
  }

  const membershipActionsDisabled = actionLoading || loading || Boolean(error)
  const hasOtherAdmin = members.some(
    (member) => member.role === 'admin' && String(member.id) !== String(user?.id)
  )

  return (
    <main className="group-page">
      <header className="group-page__header">
        <h1>Ryhmäsivu</h1>
        <p>ID: {id}</p>
        {loading && <p>Ladataan ryhmää...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && group && (
          <>
            <h2>{group.name}</h2>
            <p>{group.description || 'Ei kuvausta.'}</p>
          </>
        )}
      </header>

      <div className="group-page__actions">
        <GroupMembershipActions
          user={user}
          membership={currentMembership}
          groupIsPrivate={Boolean(group?.is_private)}
          joinRequestStatus={joinRequestStatus}
          memberCount={members.length}
          hasOtherAdmin={hasOtherAdmin}
          authLoading={authLoading}
          authError={authError}
          actionLoading={actionLoading}
          actionError={actionError}
          notice={notice}
          disabled={membershipActionsDisabled}
          onJoin={() => handleMembershipAction('join')}
          onRequestJoin={handleRequestJoin}
          onLeave={() => handleMembershipAction('leave')}
        />
        {joinRequestError && <p role="alert">{joinRequestError}</p>}
      </div>

      {!loading && !error && (
        <div className="group-layout">
          <aside className="group-panel group-layout__members" aria-label="Ryhmän jäsenet">
            <GroupMembers
              members={members}
              currentUserId={user?.id}
              currentUserRole={currentMembership?.role}
              actionLoading={membershipActionsDisabled}
              onPromoteMember={handlePromoteMember}
              onRemoveMember={handleRemoveMember}
              joinRequests={joinRequests}
              onReviewJoinRequest={handleReviewJoinRequest}
            />
          </aside>

          <section className="group-panel group-layout__chat">
  {currentMembership ? (
    <GroupChat
      groupId={id}
      currentUserId={user?.id}
    />
  ) : (
    <>
      <h2>Ryhmächat</h2>
      <p>Liity ryhmään nähdäksesi keskustelun.</p>
    </>
  )}
</section>

          <aside className="group-panel group-layout__reviews" aria-labelledby="group-reviews-title">
            <h2 id="group-reviews-title">Elokuva-arvostelut ja muu sisältö</h2>
            <p>Arvostelujen ja muiden ryhmäsisältöjen toteutus tulee myöhemmin.</p>
          </aside>
        </div>
      )}
    </main>
  )
}
