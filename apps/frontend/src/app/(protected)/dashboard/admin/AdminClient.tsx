'use client'

import { useState, useTransition } from 'react'
import { approveRestaurant } from '@/app/actions/restaurant'
import { reviewOwnerApplication } from '@/app/actions/auth'
import type { Restaurant, OwnerApplication } from '@/app/lib/api'

interface Props {
  initialPendingRestaurants: Restaurant[]
  initialOwnerApplications: OwnerApplication[]
}

function SectionHeader({ title, count, color }: { title: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h2 className="text-base font-black text-gray-800">{title}</h2>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{count}</span>
    </div>
  )
}

export default function AdminClient({ initialPendingRestaurants, initialOwnerApplications }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialPendingRestaurants)
  const [applications, setApplications] = useState<OwnerApplication[]>(initialOwnerApplications)
  const [isPending, startTransition] = useTransition()
  const [processing, setProcessing] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleApproveRestaurant(restaurant: Restaurant) {
    setProcessing(restaurant._id)
    startTransition(async () => {
      const result = await approveRestaurant(restaurant._id)
      setProcessing(null)
      if (result?.success) {
        setRestaurants(prev => prev.filter(r => r._id !== restaurant._id))
        showToast(`${restaurant.name} approved`, 'success')
      } else {
        showToast(result?.message ?? 'Something went wrong', 'error')
      }
    })
  }

  function handleReviewApplication(app: OwnerApplication, approve: boolean) {
    setProcessing(app.id)
    startTransition(async () => {
      const result = await reviewOwnerApplication(app.id, approve)
      setProcessing(null)
      if (result?.success) {
        setApplications(prev => prev.filter(a => a.id !== app.id))
        showToast(approve ? `${app.email} promoted to owner` : `${app.email} rejected`, 'success')
      } else {
        showToast(result?.message ?? 'Something went wrong', 'error')
      }
    })
  }

  return (
    <div className="space-y-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* Owner Applications */}
      <div>
        <SectionHeader title="Owner Applications" count={applications.length} color="bg-violet-100 text-violet-700" />
        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-gray-500 font-medium text-sm">No pending owner applications.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {applications.map((app, idx) => (
              <div
                key={app.id}
                className={`flex items-center gap-4 px-5 py-4 ${idx !== 0 ? 'border-t border-gray-50' : ''}`}
                style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-900 text-sm">{app.businessName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{app.email}</p>
                  <p className="text-xs text-gray-400">
                    Applied {new Date(app.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleReviewApplication(app, true)}
                    disabled={isPending || processing === app.id}
                    className="text-xs font-bold px-3 py-2 rounded-xl text-white disabled:opacity-50 hover:opacity-90 transition-opacity shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
                  >
                    {processing === app.id ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReviewApplication(app, false)}
                    disabled={isPending || processing === app.id}
                    className="text-xs font-bold px-3 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Restaurant Approvals */}
      <div>
        <SectionHeader title="Pending Restaurants" count={restaurants.length} color="bg-amber-100 text-amber-700" />
        {restaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-gray-500 font-medium text-sm">No pending restaurant applications.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {restaurants.map((restaurant, idx) => (
              <div
                key={restaurant._id}
                className={`flex items-start gap-4 px-5 py-5 ${idx !== 0 ? 'border-t border-gray-50' : ''}`}
                style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}
              >
                {restaurant.imageUrl ? (
                  <img src={restaurant.imageUrl} alt={restaurant.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-orange-100" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)' }}>🏪</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-900">{restaurant.name}</p>
                  {restaurant.cuisineTypes?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {restaurant.cuisineTypes.map(c => (
                        <span key={c} className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                    <span>📍 {restaurant.address?.city}, {restaurant.address?.country}</span>
                    <span>Min. ₨{restaurant.minimumOrder}</span>
                    <span>{new Date(restaurant.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {restaurant.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{restaurant.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleApproveRestaurant(restaurant)}
                  disabled={isPending || processing === restaurant._id}
                  className="shrink-0 text-sm font-bold px-4 py-2 rounded-xl text-white shadow-md shadow-green-200/60 disabled:opacity-50 hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
                >
                  {processing === restaurant._id ? 'Approving…' : 'Approve'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
