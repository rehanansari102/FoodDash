'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPassword, undefined)

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 p-8 md:p-10">
      {/* Header */}
      <div className="mb-8 animate-fade-up delay-100">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full inline-block" />
          Password recovery
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Forgot your password?</h1>
        <p className="text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {/* Success */}
      {state?.success ? (
        <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-4 animate-fade-up">
          <p className="text-sm text-green-700 font-medium">✓ {state.message}</p>
          <p className="text-xs text-green-600 mt-2">
            Didn&apos;t receive it?{' '}
            <button
              onClick={() => window.location.reload()}
              className="underline hover:no-underline"
            >
              Try again
            </button>
          </p>
        </div>
      ) : (
        <>
          {/* Error */}
          {state?.message && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 animate-fade-up">
              <span className="text-red-500 mt-0.5">⚠</span>
              <p className="text-sm text-red-700">{state.message}</p>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div className="animate-fade-up delay-200">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
              />
            </div>

            <div className="animate-fade-up delay-300">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all duration-200"
              >
                {pending ? 'Sending…' : 'Send reset link →'}
              </button>
            </div>
          </form>
        </>
      )}

      <div className="mt-6 text-center animate-fade-up delay-400">
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          ← Back to log in
        </Link>
      </div>
    </div>
  )
}
