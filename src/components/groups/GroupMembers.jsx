import { useState } from 'react'

export default function GroupMembers({
  members,
  currentUserId,
  currentUserRole,
  actionLoading,
  onPromoteMember,
  onRemoveMember
}) {
  const [openMemberId, setOpenMemberId] = useState(null)

  const canManageMembers = currentUserRole === 'admin'

  const handleMemberAction = async (action, memberId) => {
    const succeeded = action === 'promote'
      ? await onPromoteMember(memberId)
      : await onRemoveMember(memberId)

    if (succeeded) {
      setOpenMemberId(null)
    }
  }

  return (
    <div className="group-members">
      <h3>Jäsenet</h3>
      {members.length === 0 ? (
        <p>Ryhmällä ei ole vielä jäseniä.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {canManageMembers &&
              member.role === 'member' &&
              String(member.id) !== String(currentUserId) ? (
                <>
                  <button
                    className="group-members__name"
                    type="button"
                    aria-expanded={openMemberId === member.id}
                    onClick={() => setOpenMemberId(
                      openMemberId === member.id ? null : member.id
                    )}
                    disabled={actionLoading}
                  >
                    {member.username} ({member.role})
                  </button>
                  {openMemberId === member.id && (
                    <div className="group-members__actions" role="group" aria-label={`${member.username} toiminnot`}>
                      <button
                        type="button"
                        onClick={() => handleMemberAction('remove', member.id)}
                        disabled={actionLoading}
                      >
                        Poista ryhmästä
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMemberAction('promote', member.id)}
                        disabled={actionLoading}
                      >
                        Anna ylläpito-oikeudet
                      </button>
                    </div>
                  )}
                </>
              ) : (
                `${member.username} (${member.role})`
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
