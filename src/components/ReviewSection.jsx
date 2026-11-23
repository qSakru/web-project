import { useState, useEffect } from 'react'
import axios from 'axios'

function ReviewSection({ movieId }) {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get('/api/auth/me', { withCredentials: true })
        setUser(res.data.user)
      } catch {
        setUser(null)
      }
    }
    checkUser()
    fetchReviews()
  }, [movieId])

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/reviews/${movieId}`)
      setReviews(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return alert('Valitse tähtiarvosana')

    setSubmitting(true)
    try {
      await axios.post('/api/reviews', 
        { movieId, rating, comment },
        { withCredentials: true }
      )
      setComment('')
      setRating(0)
      fetchReviews()
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Virhe arvostelun lähettämisessä'
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const fullStars = Math.round(averageRating)

  return (
    <div className="review-section">
      <h2>
        Elokuvasovelluksen keskiarvo:{' '}
        {reviews.length > 0 && (
          <span className="average-stars">
            {'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)}
            <span className="average-number"> ({averageRating.toFixed(1)})</span>
          </span>
        )}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Kommentoi (valinnainen)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Lähetetään...' : 'Lähetä arvostelu'}
          </button>
        </form>
      ) : (
        <p className="login-prompt">Kirjaudu sisään arvostellaksesi</p>
      )}

      <div className="reviews-list">
        {loading ? (
          <p>Ladataan arvosteluja...</p>
        ) : reviews.length === 0 ? (
          <p>Ei vielä arvosteluja</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <strong>{review.username}</strong>
                <span className="review-stars">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              </div>
              {review.comment && <p className="review-comment">{review.comment}</p>}
              <small className="review-date">
                {new Date(review.created_at).toLocaleDateString('fi-FI')}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ReviewSection