import { Link } from 'react-router-dom'

export default function GroupMembershipActions({
  user,
  membership,
  memberCount,
  hasOtherAdmin,
  authLoading,
  authError,
  actionLoading,
  actionError,
  notice,
  disabled,
  onJoin,
  onLeave
}) {
  return (
    <>
      {authLoading && <p>Tarkistetaan kirjautumistilaa...</p>}
      {authError && <p role="alert">{authError}</p>}
      {!authLoading && !authError && !user && (
        <p>
          <Link to="/Kirjaudu">Kirjaudu sisään liittyäksesi ryhmään.</Link>
        </p>
      )}
      {!authLoading && !authError && user && !membership && (
        <button type="button" onClick={onJoin} disabled={disabled}>
          {actionLoading ? 'Liitytään...' : 'Liity ryhmään'}
        </button>
      )}
      {!authLoading && !authError && user && membership?.role === 'member' && (
        <button type="button" onClick={onLeave} disabled={disabled}>
          {actionLoading ? 'Poistutaan...' : 'Poistu ryhmästä'}
        </button>
      )}
      {!authLoading && !authError && user && membership?.role === 'admin' && memberCount > 1 && !hasOtherAdmin && (
        <p>Et voi poistua, ennen kuin ryhmään jää toinen ylläpitäjä.</p>
      )}
      {!authLoading && !authError && user && membership?.role === 'admin' && memberCount > 1 && hasOtherAdmin && (
        <button type="button" onClick={onLeave} disabled={disabled}>
          {actionLoading ? 'Poistutaan...' : 'Poistu ryhmästä'}
        </button>
      )}
      {!authLoading && !authError && user && membership?.role === 'admin' && memberCount === 1 && (
        <button type="button" onClick={onLeave} disabled={disabled}>
          {actionLoading ? 'Poistetaan ryhmää...' : 'Poistu ja poista ryhmä'}
        </button>
      )}
      {actionError && <p role="alert">{actionError}</p>}
      {notice && <p role="status">{notice}</p>}
    </>
  )
}
