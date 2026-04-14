'use client'

import { useState, useTransition } from 'react'
import { resendVerification } from '@/app/actions/auth'

export default function EmailVerificationBanner() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleResend() {
    startTransition(async () => {
      const result = await resendVerification()
      if (result?.success) {
        setSent(true)
      } else {
        setError(result?.message ?? 'Failed to resend.')
      }
    })
  }

  if (sent) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-green-50 border border-green-100 px-4 py-3">
        <span className="text-green-500">✓</span>
        <p className="text-sm text-green-700">Verification email sent! Check your inbox.</p>
      </div>
    )
  }

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-amber-500 text-lg mt-0.5">⚠</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">Please verify your email</p>
          <p className="text-xs text-amber-700 mt-0.5">
            You need to verify your email before placing orders.
            {error && <span className="text-red-600 ml-1">{error}</span>}
          </p>
        </div>
      </div>
      <button
        onClick={handleResend}
        disabled={isPending}
        className="shrink-0 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
      >
        {isPending ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  )
}
