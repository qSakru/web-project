import { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

function Ryhmät() {

    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [newGroupName, setNewGroupName] = useState('')
    const [description, setDescription] = useState('')
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

        const res = await api.post('/groups', { name: newGroupName.trim(), description: description.trim() })
        console.log("ryhmä luotu onnistuneesti:", res.data)

        setGroups([...groups, res.data])
        setNewGroupName('')
        setDescription('')

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

      {!loading && !error && ( groups.length === 0 && (
        <p>Et kuulu vielä mihinkään ryhmään. Luo uusi ryhmä tai liity olemassa olevaan.</p>
      ))}

      <h2>Luo uusi ryhmä</h2>
      <form onSubmit={handleCreateGroup}>
        <input
        id="groupName"
        type="text"
        placeholder="Ryhmän nimi"
        value={newGroupName}
        onChange={(e) => setNewGroupName(e.target.value)}
      />
      <input
        id="description"
        type="text"
        placeholder="Kuvaus"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit" disabled={creatingGroup}>
        {creatingGroup ? 'Luodaan ryhmä...' : 'Luo ryhmä'}
      </button>
      </form>

      {!loading && !error && groups.length > 0 && (
        <ul>
          {groups.map(group => (
            <li key={group.id}>{group.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Ryhmät