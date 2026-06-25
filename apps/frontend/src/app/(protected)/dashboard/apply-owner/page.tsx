'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { applyForOwner } from '@/app/actions/auth'

export default function ApplyOwnerPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!businessName.trim()) return setError('Business name is required.')
    setError(null)
    startTransition(async () => {
      const result = await applyForOwner(businessName.trim())
      if (result?.success) {
        setSubmitted(true)
      } else {
        setError(result?.message ?? 'Something went wrong.')
      }
    })
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-xl font-black text-gray-900">Application Submitted!</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Your application is under review. You will be able to create restaurants once an admin approves it.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 w-full py-3 rounded-2xl text-sm font-bold text-white shadow-md shadow-orange-200/60 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Apply as Restaurant Owner</h1>
        <p className="text-sm text-gray-400 mt-1">Submit your business details for review. An admin will approve your application.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Khan's Kitchen"
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <p className="text-xs text-gray-400 mt-1">The name of your restaurant business.</p>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-xs font-semibold text-amber-700">What happens next?</p>
            <ul className="text-xs text-amber-600 mt-1.5 space-y-1">
              <li>• An admin reviews your application</li>
              <li>• Your account is promoted to Restaurant Owner</li>
              <li>• You can then create and manage your restaurants</li>
            </ul>
          </div>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white shadow-md shadow-orange-200/60 disabled:opacity-60 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
          >
            {isPending ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}
