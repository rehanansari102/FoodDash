'use client'

import { useState, useTransition } from 'react'
import { submitReview } from '@/app/actions/restaurant'
import { getMyOrders } from '@/app/actions/order'
import type { Review, Order } from '@/app/lib/api'

interface Props {
  restaurantId: string
  initialReviews: Review[]
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={`text-base ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className={`text-3xl transition-colors leading-none ${(hovered || value) >= star ? 'text-amber-400' : 'text-gray-200'} hover:scale-110`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ReviewsSection({ restaurantId, initialReviews }: Props) {
  const [reviews] = useState<Review[]>(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersLoaded, setOrdersLoaded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  async function loadOrders() {
    if (ordersLoaded) return
    setLoadingOrders(true)
    try {
      const orders = await getMyOrders()
      const eligible = (orders ?? []).filter(
        (o: Order) => o.status === 'DELIVERED' && o.restaurantId === restaurantId,
      )
      setDeliveredOrders(eligible)
      if (eligible.length > 0) setSelectedOrderId(eligible[0]._id)
    } catch {
      // Not logged in — deliveredOrders stays empty
    }
    setLoadingOrders(false)
    setOrdersLoaded(true)
  }

  function handleOpen() {
    setShowForm(true)
    loadOrders()
  }

  function handleSubmit() {
    if (!selectedOrderId) return setError('Please select an order.')
    if (rating === 0) return setError('Please pick a star rating.')
    if (!description.trim()) return setError('Please write a short review.')

    setError(null)
    startTransition(async () => {
      const result = await submitReview(restaurantId, {
        orderId: selectedOrderId,
        rating,
        description: description.trim(),
        ...(title.trim() && { title: title.trim() }),
      })
      if (result?.success) {
        setSubmitted(true)
        setShowForm(false)
      } else {
        setError(result?.message ?? 'Something went wrong.')
      }
    })
  }

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="mt-8 pb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
          Reviews
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
            {reviews.length}
          </span>
        </h2>
        {submitted ? (
          <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
            ✓ Review submitted!
          </span>
        ) : (
          <button
            onClick={handleOpen}
            className="text-sm font-bold px-4 py-2 rounded-xl text-white shadow-md shadow-orange-200/60 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && !submitted && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-black text-gray-900 mb-4">Share your experience</h3>

          {loadingOrders && (
            <p className="text-sm text-gray-400 text-center py-6">Loading your orders...</p>
          )}

          {ordersLoaded && deliveredOrders.length === 0 && (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">🛍️</p>
              <p className="text-sm text-gray-600 font-medium">No delivered orders found.</p>
              <p className="text-xs text-gray-400 mt-1">
                You can only review after a delivered order from this restaurant.
              </p>
            </div>
          )}

          {ordersLoaded && deliveredOrders.length > 0 && (
            <div className="space-y-4">
              {/* Order selector */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Order
                </label>
                <select
                  value={selectedOrderId}
                  onChange={e => setSelectedOrderId(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                >
                  {deliveredOrders.map(o => (
                    <option key={o._id} value={o._id}>
                      Order #{o._id.slice(-6).toUpperCase()} —{' '}
                      {new Date(o.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star rating */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Rating
                </label>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Title{' '}
                  <span className="font-normal text-gray-400 normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. Great food, fast delivery!"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Review
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="What did you think about the food and service?"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
              </div>

              {error && (
                <p className="text-xs text-red-600 font-semibold">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-200/60 disabled:opacity-60 hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
                >
                  {isPending ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-gray-500 font-medium">No reviews yet.</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to leave a review!</p>
        </div>
      ) : (
        <>
          {/* Rating summary */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <StarDisplay rating={Math.round(avg)} />
            <span className="text-sm font-black text-gray-800">{avg.toFixed(1)}</span>
            <span className="text-xs text-gray-400">
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {reviews.map((review, idx) => (
              <div
                key={review._id}
                className={`px-5 py-4 ${idx !== 0 ? 'border-t border-gray-50' : ''}`}
                style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StarDisplay rating={review.rating} />
                      {review.title && (
                        <span className="text-sm font-bold text-gray-900">{review.title}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
