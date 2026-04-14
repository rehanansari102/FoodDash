import { cookies } from 'next/headers'
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner'

export const metadata = { title: 'Dashboard — FoodDash' }

// Decode the JWT payload (base64url) without verifying — the proxy already verified it.
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))
  } catch {
    return {}
  }
}

export default async function DashboardPage() {
  const token = (await cookies()).get('access_token')?.value ?? ''
  const payload = decodeJwtPayload(token)
  const isEmailVerified = payload.isEmailVerified === true

  return (
    <div>
      {!isEmailVerified && <EmailVerificationBanner />}

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {String(payload.email ?? 'there')}!</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'My Orders', value: '0', icon: '🛍️' },
          { label: 'Saved Addresses', value: '0', icon: '📍' },
          { label: 'Loyalty Points', value: '0', icon: '⭐' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
          >
            <p className="text-2xl mb-2">{card.icon}</p>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
