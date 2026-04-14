'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { verifyEmail } from '@/app/actions/auth'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Verification link is invalid. Please request a new one.')
      return
    }

    verifyEmail(token).then((result) => {
      if (result?.success) {
        setStatus('success')
        setMessage(result.message ?? 'Email verified!')
      } else {
        setStatus('error')
        setMessage(result?.message ?? 'Verification failed.')
      }
    })
  }, [token])

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 p-8 md:p-10 text-center">
      <div className="text-5xl mb-6">
        {status === 'loading' && '⏳'}
        {status === 'success' && '✅'}
        {status === 'error' && '❌'}
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
        {status === 'loading' && 'Verifying your email…'}
        {status === 'success' && 'Email verified!'}
        {status === 'error' && 'Verification failed'}
      </h1>

      <p className="text-sm text-gray-500 mb-8">{message}</p>

      {status === 'success' && (
        <Link
          href="/dashboard"
          className="inline-block rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 text-sm shadow-lg shadow-orange-200 transition-all duration-200"
        >
          Go to dashboard →
        </Link>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 text-sm shadow-lg shadow-orange-200 transition-all duration-200"
          >
            Log in to resend verification
          </Link>
          <p className="text-xs text-gray-400">
            Logged in already?{' '}
            <Link href="/dashboard" className="text-orange-500 hover:underline">
              Go to dashboard
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 p-8 md:p-10 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-gray-500 text-sm">Verifying…</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
