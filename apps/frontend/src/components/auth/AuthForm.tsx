'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { AuthState } from '@/app/actions/auth'

type Props = {
  mode: 'login' | 'register'
  action: (state: AuthState, formData: FormData) => Promise<AuthState>
}

export default function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const isRegister = mode === 'register'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          {isRegister ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          {isRegister
            ? 'Start ordering from the best restaurants near you.'
            : 'Good to see you again. Your favourites are waiting.'}
        </p>
      </div>

      {state?.message && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 animate-fade-up">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <p className="text-sm text-red-700">{state.message}</p>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
          <input
            id="email" name="email" type="email" autoComplete="email"
            placeholder="you@example.com" required
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100/80 transition-all duration-200"
          />
          {state?.errors?.email && <p className="mt-1.5 text-xs text-red-600">{state.errors.email[0]}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
            {!isRegister && (
              <Link href="/forgot-password" className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors">
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="password" name="password" type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder={isRegister ? 'At least 8 characters' : '••••••••'} required
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100/80 transition-all duration-200"
          />
          {state?.errors?.password && <p className="mt-1.5 text-xs text-red-600">{state.errors.password[0]}</p>}
        </div>

        <button type="submit" disabled={pending}
          className="w-full relative rounded-2xl overflow-hidden text-white font-bold py-3.5 text-sm shadow-lg shadow-orange-300/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
          <span className="relative z-10">
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Please wait…
              </span>
            ) : isRegister ? 'Create account →' : 'Log in →'}
          </span>
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <p className="text-center text-sm text-gray-500">
        {isRegister ? (
          <>Already have an account?{' '}
            <Link href="/login" className="font-bold text-orange-500 hover:text-orange-600 transition-colors">Log in</Link>
          </>
        ) : (
          <>Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-orange-500 hover:text-orange-600 transition-colors">Sign up free</Link>
          </>
        )}
      </p>
    </div>
  )
}
