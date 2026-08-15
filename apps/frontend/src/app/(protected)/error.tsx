'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

/**
 * Catches render-time failures for every page under (protected).
 *
 * Most of these pages fetch through the API gateway while rendering on the
 * server, so an unreachable service would otherwise blank the whole page. The
 * common cause is a backend still starting up, which is transient — hence the
 * retry rather than a dead end.
 */
export default function ProtectedError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-4xl">
          ⚠️
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            We couldn&apos;t reach the server. This can happen on the first visit after a
            quiet period, while everything starts back up — trying again usually works.
          </p>
        </div>
        <button
          type="button"
          // Re-fetches and re-renders the segment. reset() would only re-render,
          // which cannot help when the failure was a request that never landed.
          onClick={() => unstable_retry()}
          className="mt-2 px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          Try again
        </button>
        {error.digest && (
          <p className="text-xs text-gray-300 mt-2">Reference: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
