import { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

function Ryhmät() {

  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)

  //ryhmien haku käyttäjälle
  useEffect(() => {
    const fetchGroups = async () => {
      try { setLoading(true)
        const res = await api.get('/groups')
        setGroups(res.data)
      }  catch (err) {
        console.error('Ryhmien haku epäonnistui:', err.response?.data || err.message)
        setError('Ryhmien hakeminen epäonnistui')
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  // ryhmän luonti
  const handleCreateGroup = async (e) => {
    e.preventDefault()
    console.log("ryhmän luonti on aloitettu")

    if (!newGroupName.trim()) {
      setError('Ryhmän nimi on pakollinen')
      return
    }

    try {
      setCreatingGroup(true)
      setError(null)
      console.log("lähetetään pyyntö ryhmän luomiseksi:", newGroupName, description)

      const res = await api.post('/groups', {
        name: newGroupName.trim(),
        description: description.trim(),
        isPrivate
      })
      console.log("ryhmä luotu onnistuneesti:", res.data)

      setGroups([...groups, res.data])
      setNewGroupName('')
      setDescription('')
      setIsPrivate(false)

    } catch (err) {
      console.error('Ryhmän luonti epäonnistui:', err.response?.data || err.message)

      if (err.response?.status === 401) {
        setError('Kirjaudu ensin sisään luodaksesi ryhmän.')
      } else {
        setError('Ryhmän luominen epäonnistui')
      }
    } finally {
      setCreatingGroup(false)
    }
  }

  return (
    <div className="page">
      <h1>Ryhmät</h1>
      {loading &&   <p>Ladataan ryhmiä...</p>}

      {error && (
        <div>
          <p>{error}</p>

          {error.includes('Kirjaudu') && (
            <Link to="/Kirjaudu">
              Kirjaudu sisään
              </Link>
          )}
        </div>
      )}

      <div className="groups-layout">
        {/* ryhmät vasen */}
        <div className="groups-list">
          <h2>Elokuvasovelluksen ryhmät</h2>

          {!loading && !error && groups.length === 0 && (
            <p className="empty-text">Et kuulu vielä mihinkään ryhmään. Luo uusi ryhmä tai liity olemassa olevaan.</p>
          )}

          {!loading && !error && groups.length > 0 && (
            <ul>
              {groups.map(group => (
                <li key={group.id}>
                  <Link to={`/Ryhmät/${group.id}`}>
                    {group.name}
                    {group.is_private && (
                      <span className="lock-icon" title="Yksityinen ryhmä">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#26A3D6" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ryhmän luonti oikea */}
        <div className="groups-create">
          <h2>Luo uusi ryhmä</h2>
          <form onSubmit={handleCreateGroup}>
            <input
              type="text"
              placeholder="Ryhmän nimi"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              Yksityinen ryhmä
            </label>
            <input
              type="text"
              placeholder="Kuvaus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit" disabled={creatingGroup}>
              {creatingGroup ? 'Luodaan ryhmä...' : 'Luo ryhmä'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )

}

export default Ryhmät
