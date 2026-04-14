'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { resetPassword } from '@/app/actions/auth'

function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, undefined)
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 p-8 md:p-10">
      {/* Header */}
      <div className="mb-8 animate-fade-up delay-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full inline-block" />
          New password
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500">Choose a strong new password for your account.</p>
      </div>

      {!token && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 mb-6">
          <p className="text-sm text-red-700">Invalid or missing reset token. Please request a new reset link.</p>
        </div>
      )}

      {/* Error */}
      {state?.message && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 animate-fade-up">
          <span className="text-red-500 mt-0.5">⚠</span>
          <p className="text-sm text-red-700">{state.message}</p>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="token" value={token} />

        <div className="animate-fade-up delay-200">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            disabled={!token}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-400">Must include uppercase, lowercase, and a number.</p>
        </div>

        <div className="animate-fade-up delay-300">
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            required
            disabled={!token}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 disabled:opacity-50"
          />
        </div>

        <div className="animate-fade-up delay-400">
          <button
            type="submit"
            disabled={pending || !token}
            className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all duration-200"
          >
            {pending ? 'Saving…' : 'Set new password →'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
